import type { Request, Response } from 'express';

import { registerUser } from '../services/auth-service.js';

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