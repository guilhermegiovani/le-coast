import jwt, {
  type SignOptions,
} from 'jsonwebtoken';

import { authConfig } from '../config/auth.js';

type GenerateTokenPayload = {
  id: number;
  role: 'CUSTOMER' | 'ADMIN';
};

// Gera o token de acesso utilizado para autenticar
// as requisições realizadas pelo usuário.
export function generateAccessToken(
  payload: GenerateTokenPayload,
) {
  const options: SignOptions = {
    expiresIn: authConfig.jwt.expiresIn,
    subject: String(payload.id),
  };

  return jwt.sign(
    {
      role: payload.role,
    },
    authConfig.jwt.secret,
    options,
  );
}