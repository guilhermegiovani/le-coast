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

  // Gera o token utilizado nas próximas requisições autenticadas.
  const token = generateAccessToken({
    id: user.id,
    role: user.role,
  });

  // Retorna o token e somente os dados seguros do usuário.
  return {
    token,
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