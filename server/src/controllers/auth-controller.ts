import type { Request, Response } from 'express';

import {
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from '../services/auth-service.js';
import { requestPasswordReset, resetPassword } from '../services/password-reset-service.js';
import { authConfig } from '../config/auth.js';
import { AppError } from '../errors/app-error.js';

export async function register(
  request: Request,
  response: Response,
) {
  const { email, name, password } = request.body;

  const user = await registerUser({
    email,
    name,
    password,
  });

  return response.status(201).json(user);
}

// Autentica um usuário, envia o refresh token em cookie
// HttpOnly e retorna somente o access token e os dados públicos.
export async function login(
  request: Request,
  response: Response,
) {
  const { email, password } = request.body;

  const {
    accessToken,
    refreshToken,
    user,
  } = await loginUser({
    email,
    password,
  });

  // O refresh token fica em cookie HttpOnly para não ficar
  // acessível diretamente ao JavaScript do navegador.
  response.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge:
      authConfig.refreshToken.expiresInDays *
      24 *
      60 *
      60 *
      1000,
  });

  return response.status(200).json({
    accessToken,
    user,
  });
}

// Retorna os dados atuais do usuário autenticado.
export async function me(
  request: Request,
  response: Response,
) {
  // O authMiddleware garante que request.user exista
  // antes deste controller ser executado.
  const userId = request.user!.id;

  const user = await getAuthenticatedUser(userId);

  return response.status(200).json(user);
}

// Renova a sessão utilizando o refresh token
// armazenado no cookie HttpOnly.
export async function refresh(
  request: Request,
  response: Response,
) {
  const refreshToken = request.cookies.refreshToken;

  // O refresh token precisa existir para que
  // uma sessão possa ser renovada.
  if (!refreshToken) {
    throw new AppError(
      'Refresh token não informado.',
      401,
    );
  }

  const result = await refreshSession(refreshToken);

  // O novo refresh token substitui o anterior,
  // implementando a rotação da sessão.
  response.cookie(
    'refreshToken',
    result.refreshToken,
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge:
        authConfig.refreshToken.expiresInDays *
        24 *
        60 *
        60 *
        1000,
    },
  );

  // O refresh token continua fora do JSON.
  return response.status(200).json({
    accessToken: result.accessToken,
    user: result.user,
  });
}

// Encerra a sessão renovável associada ao refresh token
// e remove o cookie utilizado para renovação.
export async function logout(
  request: Request,
  response: Response,
) {
  const refreshToken = request.cookies.refreshToken;

  // Se o cookie existir, tenta revogar a sessão correspondente.
  // Se não existir, o estado desejado já é "deslogado".
  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  // Remove o refresh token do navegador.
  // As opções precisam ser compatíveis com as usadas na criação
  // do cookie para garantir que ele seja removido corretamente.
  response.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response.status(204).send();
}

// Recebe uma solicitação de recuperação de senha.
// A resposta é sempre a mesma para evitar revelar
// se existe ou não uma conta associada ao e-mail informado.
export async function forgotPassword(
  request: Request,
  response: Response,
) {
  const { email } = request.body;

  await requestPasswordReset(email);

  // A mensagem é propositalmente genérica.
  // Isso reduz risco de enumeração de usuários.
  return response.status(200).json({
    message:
      'Se existir uma conta associada a este e-mail, enviaremos as instruções para redefinição da senha.',
  });
}

// Redefine a senha do usuário a partir de um
// token de recuperação válido.
export async function resetPasswordController(
  request: Request,
  response: Response,
) {
  const { password, token } = request.body;

  // O service é responsável por validar o token,
  // aplicar as regras da nova senha e executar
  // todas as alterações dentro da transação.
  await resetPassword(
    token,
    password,
  );

  // Após a redefinição, todas as sessões renováveis
  // do usuário são revogadas. Por isso, ele deverá
  // realizar login novamente.
  return response.status(200).json({
    message:
      'Senha redefinida com sucesso. Faça login novamente.',
  });
}