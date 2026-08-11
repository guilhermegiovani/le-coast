import request from 'supertest';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { app } from '../../app.js';
import { generateAccessToken } from '../../lib/jwt.js';
import { findUserById } from '../../repositories/user-repository.js';

// Substitui somente o acesso ao banco.
// O restante do fluxo de autenticação continua real.
vi.mock('../../repositories/user-repository.js', () => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
}));

const findUserByIdMock = vi.mocked(findUserById);

// Agrupa os testes HTTP das rotas de autenticação.
describe('GET /auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que uma requisição autenticada possa
  // recuperar os dados atuais do usuário.
  it('deve retornar o usuário autenticado', async () => {
    findUserByIdMock.mockResolvedValue({
      email: 'guilherme@example.com',
      id: 1,
      isActive: true,
      name: 'Guilherme Nobre',
      role: 'CUSTOMER',
    });

    const token = generateAccessToken({
      id: 1,
      role: 'CUSTOMER',
    });

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({
      email: 'guilherme@example.com',
      id: 1,
      name: 'Guilherme Nobre',
      role: 'CUSTOMER',
    });

    expect(findUserByIdMock).toHaveBeenCalledWith(1);
  });

  // Garante que uma rota protegida não possa ser
  // acessada sem autenticação.
  it('deve retornar 401 quando o token não for informado', async () => {
    const response = await request(app)
      .get('/auth/me')
      .expect(401);

    expect(response.body).toEqual({
      message: 'Token de autenticação não informado.',
    });

    // Sem identidade autenticada, nem sequer devemos consultar o banco.
    expect(findUserByIdMock).not.toHaveBeenCalled();
  });

  // Garante que tokens inválidos sejam rejeitados
  // antes que o controller seja executado.
  it('deve retornar 401 quando o token for inválido', async () => {
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer token-invalido')
      .expect(401);

    expect(response.body).toEqual({
      message: 'Token de autenticação inválido.',
    });

    expect(findUserByIdMock).not.toHaveBeenCalled();
  });

  // Garante que uma conta desativada não continue
  // acessível somente por ainda possuir um JWT válido.
  it('deve retornar 403 quando o usuário estiver inativo', async () => {
    findUserByIdMock.mockResolvedValue({
      email: 'guilherme@example.com',
      id: 1,
      isActive: false,
      name: 'Guilherme Nobre',
      role: 'CUSTOMER',
    });

    const token = generateAccessToken({
      id: 1,
      role: 'CUSTOMER',
    });

    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expect(response.body).toEqual({
      message: 'Usuário inativo.',
    });
  });
});