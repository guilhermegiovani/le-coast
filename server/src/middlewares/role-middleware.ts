import type {
  NextFunction,
  Request,
  Response,
} from 'express';

import { AppError } from '../errors/app-error.js';
import type { UserRole } from '../generated/prisma/client.js';

// Cria um middleware que permite acesso somente
// aos usuários que possuem uma das roles informadas.
export function requireRole(
  ...allowedRoles: UserRole[]
) {
  return (
    request: Request,
    _response: Response,
    next: NextFunction,
  ) => {
    // Este middleware deve ser utilizado depois do authMiddleware.
    // Se request.user não existir, a requisição não está autenticada.
    if (!request.user) {
      throw new AppError(
        'Usuário não autenticado.',
        401,
      );
    }

    // Verifica se a role do usuário está entre
    // as roles permitidas para acessar o recurso.
    if (!allowedRoles.includes(request.user.role)) {
      throw new AppError(
        'Você não possui permissão para acessar este recurso.',
        403,
      );
    }

    next();
  };
}