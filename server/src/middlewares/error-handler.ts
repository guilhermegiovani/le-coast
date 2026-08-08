import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';

import { AppError } from '../errors/app-error.js';

// Centraliza o tratamento dos erros lançados pela aplicação.
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  // Erros conhecidos da aplicação retornam sua mensagem
  // e o status HTTP definido no AppError.
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message,
    });

    return;
  }

  // Erros inesperados não devem expor detalhes internos ao cliente.
  console.error(error);

  response.status(500).json({
    message: 'Erro interno do servidor.',
  });
};