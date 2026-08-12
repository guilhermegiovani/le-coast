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
import bcrypt from 'bcryptjs';

import {
  findUserByEmail,
  findUserById,
} from '../../repositories/user-repository.js';

import {
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
} from '../../services/refresh-token-service.js';

// Substitui somente o acesso ao banco.
// Simula o acesso aos usuários sem utilizar o banco real.
vi.mock('../../repositories/user-repository.js', () => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
}));

// Simula o gerenciamento das sessões renováveis
// sem acessar o banco real durante os testes HTTP.
vi.mock('../../services/refresh-token-service.js', () => ({
  createRefreshToken: vi.fn(),
  findRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
}));

// Simula operações do bcrypt para controlar
// os cenários de senha válida ou inválida.
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

const findUserByEmailMock = vi.mocked(findUserByEmail);
const findUserByIdMock = vi.mocked(findUserById);

const createRefreshTokenMock = vi.mocked(
  createRefreshToken,
);

const findRefreshTokenMock = vi.mocked(
  findRefreshToken,
);

const revokeRefreshTokenMock = vi.mocked(
  revokeRefreshToken,
);

const bcryptCompareMock = vi.mocked(
  bcrypt.compare as (
    data: string,
    encrypted: string,
  ) => Promise<boolean>,
);

const ACTIVE_USER = {
  createdAt: new Date(),
  email: 'guilherme@example.com',
  id: 1,
  isActive: true,
  name: 'Guilherme Nobre',
  passwordHash: 'hashed-password',
  role: 'CUSTOMER' as const,
  updatedAt: new Date(),
};

const VALID_STORED_REFRESH_TOKEN = {
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 60_000),
  id: 10,
  revokedAt: null,
  tokenHash: 'hashed-refresh-token',
  userId: 1,
  user: ACTIVE_USER,
};

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

  // Garante que o login entregue o refresh token
  // somente em cookie HttpOnly e nunca no corpo da resposta.
  it('deve enviar o refresh token em cookie HttpOnly', async () => {
    // Simula um usuário válido encontrado pelo repository.
    findUserByEmailMock.mockResolvedValue({
      createdAt: new Date(),
      email: 'guilherme@example.com',
      id: 1,
      isActive: true,
      name: 'Guilherme Nobre',
      passwordHash: 'hashed-password',
      role: 'CUSTOMER',
      updatedAt: new Date(),
    });

    // Simula uma senha válida para permitir que o login
    // avance até a criação da sessão autenticada.
    bcryptCompareMock.mockResolvedValue(true);

    // Simula a criação do refresh token sem gravar
    // uma sessão real no banco durante o teste.
    createRefreshTokenMock.mockResolvedValue({
      expiresAt: new Date('2026-09-11T00:00:00.000Z'),
      token: 'refresh-token',
    });

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'guilherme@example.com',
        password: '12345678',
      })
      .expect(200);

    // O corpo da resposta deve conter somente
    // o access token e os dados públicos do usuário.
    expect(response.body).toEqual({
      accessToken: expect.any(String),
      user: {
        email: 'guilherme@example.com',
        id: 1,
        name: 'Guilherme Nobre',
        role: 'CUSTOMER',
      },
    });

    // O refresh token não deve ser exposto no JSON.
    expect(response.body).not.toHaveProperty('refreshToken');

    const cookies = response.headers['set-cookie'];

    // Garante que o servidor realmente enviou um cookie.
    expect(cookies).toBeDefined();

    // Garante que o refresh token foi transportado por cookie.
    expect(cookies?.[0]).toContain('refreshToken=');

    // Garante que o cookie não possa ser acessado
    // diretamente pelo JavaScript do navegador.
    expect(cookies?.[0]).toContain('HttpOnly');
  });
});

// Agrupa os testes HTTP da renovação de sessão.
describe('POST /auth/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Define uma nova sessão padrão para os
    // cenários em que a renovação é bem-sucedida.
    createRefreshTokenMock.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      token: 'new-refresh-token',
    });
  });

  // Garante que uma sessão válida seja renovada
  // utilizando o refresh token armazenado no cookie.
  it('deve renovar a sessão e rotacionar o refresh token', async () => {
    findRefreshTokenMock.mockResolvedValue(
      VALID_STORED_REFRESH_TOKEN,
    );

    const response = await request(app)
      .post('/auth/refresh')
      .set(
        'Cookie',
        'refreshToken=old-refresh-token',
      )
      .expect(200);

    // O token recebido pelo cookie deve ser usado
    // para localizar a sessão correspondente.
    expect(findRefreshTokenMock).toHaveBeenCalledWith(
      'old-refresh-token',
    );

    // O refresh token anterior deve ser revogado.
    expect(revokeRefreshTokenMock).toHaveBeenCalledWith(10);

    // Uma nova sessão deve ser criada para
    // o mesmo usuário autenticado.
    expect(createRefreshTokenMock).toHaveBeenCalledWith(1);

    // O corpo retorna somente o novo access token
    // e os dados públicos do usuário.
    expect(response.body).toEqual({
      accessToken: expect.any(String),
      user: {
        email: 'guilherme@example.com',
        id: 1,
        name: 'Guilherme Nobre',
        role: 'CUSTOMER',
      },
    });

    // O refresh token nunca deve ser exposto no JSON.
    expect(response.body).not.toHaveProperty(
      'refreshToken',
    );

    const cookies = response.headers['set-cookie'];

    // A resposta deve substituir o cookie antigo
    // pelo novo refresh token gerado.
    expect(cookies).toBeDefined();
    expect(cookies?.[0]).toContain(
      'refreshToken=new-refresh-token',
    );

    // O novo cookie continua protegido contra
    // acesso direto pelo JavaScript do navegador.
    expect(cookies?.[0]).toContain('HttpOnly');
  });

  // Garante que não seja possível renovar uma
  // sessão sem apresentar o refresh token.
  it('deve retornar 401 quando o refresh token não for informado', async () => {
    const response = await request(app)
      .post('/auth/refresh')
      .expect(401);

    expect(response.body).toEqual({
      message: 'Refresh token não informado.',
    });

    // Sem credencial, nenhuma sessão deve ser
    // consultada, revogada ou criada.
    expect(findRefreshTokenMock).not.toHaveBeenCalled();
    expect(revokeRefreshTokenMock).not.toHaveBeenCalled();
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });

  // Garante que um refresh token inválido
  // não consiga gerar uma nova sessão.
  it('deve retornar 401 para um refresh token inválido', async () => {
    findRefreshTokenMock.mockResolvedValue(null);

    const response = await request(app)
      .post('/auth/refresh')
      .set(
        'Cookie',
        'refreshToken=invalid-refresh-token',
      )
      .expect(401);

    expect(response.body).toEqual({
      message: 'Refresh token inválido.',
    });

    expect(revokeRefreshTokenMock).not.toHaveBeenCalled();
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });
});