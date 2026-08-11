import type {
  NextFunction,
  Request,
  Response,
} from 'express';
import jwt from 'jsonwebtoken';

import { authConfig } from '../config/auth.js';
import { AppError } from '../errors/app-error.js';
import type { UserRole } from '../generated/prisma/client.js';

type TokenPayload = {
  role: UserRole;
  sub: string;
};

// Valida o token JWT enviado no header Authorization.
// Se o token for válido, disponibiliza os dados do usuário
// autenticado em request.user.
export function authMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const authorizationHeader = request.headers.authorization;

  // Rotas protegidas exigem o header Authorization.
  if (!authorizationHeader) {
    throw new AppError('Token de autenticação não informado.', 401);
  }

  const [scheme, token] = authorizationHeader.split(' ');

  // Esperamos o formato padrão:
  // Authorization: Bearer <token>
  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Token de autenticação inválido.', 401);
  }

  try {
    // Verifica assinatura, expiração e integridade do token.
    const decoded = jwt.verify(
      token,
      authConfig.jwt.secret,
    ) as TokenPayload;

    const userId = Number(decoded.sub);

    // O subject do JWT deve representar um id válido de usuário.
    if (!decoded.sub || Number.isNaN(userId)) {
      throw new AppError('Token de autenticação inválido.', 401);
    }

    // Disponibiliza os dados autenticados para as próximas
    // etapas da requisição, como controllers e outros middlewares.
    request.user = {
      id: userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // Preserva erros da própria aplicação.
    if (error instanceof AppError) {
      throw error;
    }

    // Tokens expirados, alterados ou assinados com outro segredo
    // são tratados da mesma forma para não expor detalhes internos.
    throw new AppError('Token de autenticação inválido.', 401);
  }
}