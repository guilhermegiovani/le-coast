import type { Request, Response } from 'express';

import {
  getAuthenticatedUser,
  loginUser,
  registerUser,
} from '../services/auth-service.js';

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

// Autentica um usuário e retorna o token de acesso.
export async function login(
  request: Request,
  response: Response,
) {
  const { email, password } = request.body;

  const result = await loginUser({
    email,
    password,
  });

  return response.status(200).json(result);
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