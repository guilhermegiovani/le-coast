import express, { type Express } from 'express';
import request from 'supertest';
import {
  describe,
  expect,
  it,
} from 'vitest';

import { errorHandler } from '../../middlewares/error-handler.js';
import { requireRole } from '../../middlewares/role-middleware.js';

// Cria uma aplicação Express mínima para testar
// exclusivamente as regras de autorização por role.
function createTestApp(
  role?: 'CUSTOMER' | 'ADMIN',
): Express {
  const app = express();

  // Simula o resultado do authMiddleware.
  // Em produção, request.user será preenchido pelo JWT.
  app.use((request, _response, next) => {
    if (role) {
      request.user = {
        id: 1,
        role,
      };
    }

    next();
  });

  // Rota utilizada somente para validar o middleware de autorização.
  app.get(
    '/admin',
    requireRole('ADMIN'),
    (_request, response) => {
      response.status(200).json({
        status: 'ok',
      });
    },
  );

  // O middleware global de erros deve ficar depois das rotas.
  app.use(errorHandler);

  return app;
}

// Agrupa os testes relacionados à autorização por role.
describe('requireRole', () => {
  // Garante que o middleware não autorize uma requisição
  // quando nenhum usuário autenticado estiver disponível.
  it('deve retornar 401 quando o usuário não estiver autenticado', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/admin')
      .expect(401);

    expect(response.body).toEqual({
      message: 'Usuário não autenticado.',
    });
  });

  // Garante que um usuário autenticado, mas sem a role
  // necessária, não consiga acessar o recurso.
  it('deve retornar 403 quando o usuário não possuir a role necessária', async () => {
    const app = createTestApp('CUSTOMER');

    const response = await request(app)
      .get('/admin')
      .expect(403);

    expect(response.body).toEqual({
      message:
        'Você não possui permissão para acessar este recurso.',
    });
  });

  // Garante que um usuário com a role necessária
  // consiga continuar normalmente para o controller.
  it('deve permitir acesso quando o usuário possuir a role necessária', async () => {
    const app = createTestApp('ADMIN');

    const response = await request(app)
      .get('/admin')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
    });
  });
});