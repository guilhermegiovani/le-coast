import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';

import { AppError } from '../errors/app-error.js';
import { ZodError } from 'zod';

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

  // Converte erros de validação do Zod
  // em uma resposta HTTP 400 amigável.
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];

    return response.status(400).json({
      message:
        firstIssue?.message ??
        'Dados inválidos.',
    });
  }

  // Erros inesperados não devem expor detalhes internos ao cliente.
  console.error(error);

  response.status(500).json({
    message: 'Erro interno do servidor.',
  });
};