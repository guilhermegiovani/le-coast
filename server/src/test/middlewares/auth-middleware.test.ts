import express, { type Express } from 'express';
import request from 'supertest';
import {
  describe,
  expect,
  it,
} from 'vitest';

import { authConfig } from '../../config/auth.js';
import { errorHandler } from '../../middlewares/error-handler.js';
import { authMiddleware } from '../../middlewares/auth-middleware.js';
import { generateAccessToken } from '../../lib/jwt.js';

// Cria uma aplicação Express mínima para testar
// exclusivamente o comportamento do middleware de autenticação.
function createTestApp(): Express {
  const app = express();

  // Rota protegida usada somente nos testes.
  app.get(
    '/protected',
    authMiddleware,
    (request, response) => {
      response.status(200).json({
        user: request.user,
      });
    },
  );

  // O middleware global de erros precisa ficar depois das rotas.
  app.use(errorHandler);

  return app;
}

// Agrupa os testes das regras de autenticação por JWT.
describe('authMiddleware', () => {
  // Garante que rotas protegidas rejeitem requisições
  // que não enviam o header Authorization.
  it('deve rejeitar quando o token não for informado', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/protected')
      .expect(401);

    expect(response.body).toEqual({
      message: 'Token de autenticação não informado.',
    });
  });

  // Garante que o formato Bearer seja obrigatório.
  it('deve rejeitar um header Authorization malformado', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Token qualquer-coisa')
      .expect(401);

    expect(response.body).toEqual({
      message: 'Token de autenticação inválido.',
    });
  });

  // Garante que tokens inválidos ou adulterados
  // não permitam acesso à rota protegida.
  it('deve rejeitar um token inválido', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer token-invalido')
      .expect(401);

    expect(response.body).toEqual({
      message: 'Token de autenticação inválido.',
    });
  });

  // Garante que um token válido permita o acesso
  // e disponibilize os dados autenticados no request.
  it('deve permitir acesso com um token válido', async () => {
    const app = createTestApp();

    const token = generateAccessToken({
      id: 42,
      role: 'CUSTOMER',
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      user: {
        id: 42,
        role: 'CUSTOMER',
      },
    });
  });

  // Garante que tokens assinados com outro segredo
  // sejam rejeitados mesmo que tenham formato JWT válido.
  it('deve rejeitar um token assinado com outro segredo', async () => {
    const jwt = await import('jsonwebtoken');

    const token = jwt.default.sign(
      {
        role: 'CUSTOMER',
      },
      `${authConfig.jwt.secret}-outro`,
      {
        subject: '42',
      },
    );

    const app = createTestApp();

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(response.body).toEqual({
      message: 'Token de autenticação inválido.',
    });
  });
});