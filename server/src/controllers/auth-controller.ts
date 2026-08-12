import type { Request, Response } from 'express';

import {
  getAuthenticatedUser,
  loginUser,
  refreshSession,
  registerUser,
} from '../services/auth-service.js';
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