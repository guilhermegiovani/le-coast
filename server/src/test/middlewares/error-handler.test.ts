import express, { type Express } from 'express';
import request from 'supertest';
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AppError } from '../../errors/app-error.js';
import { errorHandler } from '../../middlewares/error-handler.js';

// Cria uma aplicação Express mínima exclusivamente para testar
// o comportamento do middleware global de erros.
function createTestApp(): Express {
  const app = express();

  // Simula uma rota que lança um erro conhecido da aplicação.
  app.get('/app-error', () => {
    throw new AppError('E-mail já cadastrado.', 409);
  });

  // Simula uma falha inesperada da aplicação.
  app.get('/unexpected-error', () => {
    throw new Error('Erro interno sensível.');
  });

  // O middleware de erro precisa ser registrado após as rotas.
  app.use(errorHandler);

  return app;
}

describe('errorHandler', () => {
  // Garante que erros conhecidos retornam o status e a mensagem
  // definidos pelo AppError.
  it('deve retornar o AppError com seu status e mensagem', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/app-error')
      .expect(409);

    expect(response.body).toEqual({
      message: 'E-mail já cadastrado.',
    });
  });

  // Garante que erros inesperados não exponham informações
  // internas da aplicação ao cliente.
  it('deve retornar erro 500 para erros inesperados', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const app = createTestApp();

    const response = await request(app)
      .get('/unexpected-error')
      .expect(500);

    expect(response.body).toEqual({
      message: 'Erro interno do servidor.',
    });

    expect(response.body).not.toEqual({
      message: 'Erro interno sensível.',
    });

    consoleErrorSpy.mockRestore();
  });
});