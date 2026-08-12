import { AppError } from '../errors/app-error.js';
import bcrypt from 'bcryptjs';

import {
  createUser,
  findUserByEmail,
  findUserById,
} from '../repositories/user-repository.js';

import type {
  LoginUserInput,
  LoginUserResult,
  RegisterUserInput,
  RegisterUserResult,
} from '../types/auth.js';

import {
  validateLoginInput,
  validateRegisterInput,
} from '../validators/auth-validator.js';

import { generateAccessToken } from '../lib/jwt.js';
import {
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
} from './refresh-token-service.js';

// Quantidade de rounds usada para gerar o hash da senha.
const PASSWORD_SALT_ROUNDS = 12;

// Cria um novo usuário garantindo e-mail único e senha protegida.
export async function registerUser(
  input: RegisterUserInput,
): Promise<RegisterUserResult> {
  validateRegisterInput(input);

  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedName = input.name.trim();

  // Impede cadastro duplicado antes de tentar inserir no banco.
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError('E-mail já cadastrado.', 409);
  }

  // Nunca salvamos a senha original no banco.
  const passwordHash = await bcrypt.hash(
    input.password,
    PASSWORD_SALT_ROUNDS,
  );

  return createUser({
    email: normalizedEmail,
    name: normalizedName,
    passwordHash,
  });
}

// Autentica um usuário a partir do e-mail e da senha informados.
export async function loginUser(
  input: LoginUserInput,
): Promise<LoginUserResult> {
  validateLoginInput(input);

  const normalizedEmail = input.email.trim().toLowerCase();

  // Busca o usuário pelo e-mail já normalizado.
  const user = await findUserByEmail(normalizedEmail);

  // Não revelamos se o problema foi e-mail inexistente ou senha incorreta.
  if (!user) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  // Usuários desativados não podem autenticar.
  if (!user.isActive) {
    throw new AppError('Usuário inativo.', 403);
  }

  // Compara a senha informada com o hash armazenado no banco.
  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  // Gera o access token JWT usado para autenticar
  // as próximas requisições da API.
  const accessToken = generateAccessToken({
    id: user.id,
    role: user.role,
  });

  // Cria o refresh token persistido e revogável
  // utilizado para renovar a sessão no futuro.
  const refreshToken = await createRefreshToken(user.id);

  // Retorna os dados necessários para a camada HTTP.
  // O controller decidirá como entregar cada token ao cliente.
  return {
    accessToken,
    refreshToken: refreshToken.token,
    user: {
      email: user.email,
      id: user.id,
      name: user.name,
      role: user.role,
    },
  };
}

// Retorna os dados atuais do usuário autenticado.
export async function getAuthenticatedUser(
  userId: number,
) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }

  // Usuários inativos não devem manter acesso à aplicação.
  if (!user.isActive) {
    throw new AppError('Usuário inativo.', 403);
  }

  return {
    email: user.email,
    id: user.id,
    name: user.name,
    role: user.role,
  };
}

// Renova uma sessão a partir de um refresh token válido.
// O token antigo é revogado e uma nova sessão é criada.
export async function refreshSession(
  refreshTokenValue: string,
) {
  // Busca a sessão correspondente ao token recebido.
  // A busca é feita pelo hash, nunca pelo token em texto puro.
  const storedRefreshToken =
    await findRefreshToken(refreshTokenValue);

  if (!storedRefreshToken) {
    throw new AppError(
      'Refresh token inválido.',
      401,
    );
  }

  // Tokens já revogados não podem ser reutilizados.
  if (storedRefreshToken.revokedAt) {
    throw new AppError(
      'Refresh token inválido.',
      401,
    );
  }

  // Tokens expirados também deixam de representar
  // uma sessão válida.
  if (
    storedRefreshToken.expiresAt.getTime() <=
    Date.now()
  ) {
    throw new AppError(
      'Refresh token expirado.',
      401,
    );
  }

  // Usuários desativados não devem conseguir
  // renovar uma sessão existente.
  if (!storedRefreshToken.user.isActive) {
    throw new AppError(
      'Usuário inativo.',
      403,
    );
  }

  // Revoga o token atual antes de emitir outro.
  // Isso implementa a rotação do refresh token.
  await revokeRefreshToken(
    storedRefreshToken.id,
  );

  // Cria um novo refresh token para substituir
  // o token que acabou de ser revogado.
  const newRefreshToken =
    await createRefreshToken(
      storedRefreshToken.user.id,
    );

  // Gera um novo access token curto com os
  // dados atuais do usuário.
  const accessToken = generateAccessToken({
    id: storedRefreshToken.user.id,
    role: storedRefreshToken.user.role,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken.token,
    user: {
      email: storedRefreshToken.user.email,
      id: storedRefreshToken.user.id,
      name: storedRefreshToken.user.name,
      role: storedRefreshToken.user.role,
    },
  };
}