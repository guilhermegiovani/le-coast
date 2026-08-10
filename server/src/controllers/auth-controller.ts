import type { Request, Response } from 'express';

import {
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