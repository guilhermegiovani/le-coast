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
import {
  requestPasswordReset,
  resetPassword,
} from '../../services/password-reset-service.js';
import { AppError } from '../../errors/app-error.js';

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

// Simula o fluxo de recuperação de senha sem
// executar alterações reais no banco durante os testes HTTP.
vi.mock('../../services/password-reset-service.js', () => ({
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
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

const requestPasswordResetMock = vi.mocked(
  requestPasswordReset,
);

const resetPasswordMock = vi.mocked(
  resetPassword,
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

// Agrupa os testes HTTP do encerramento da sessão.
describe('POST /auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que uma sessão ativa seja revogada
  // e o cookie de refresh token seja removido.
  it('deve encerrar a sessão e limpar o cookie', async () => {
    findRefreshTokenMock.mockResolvedValue({
      ...VALID_STORED_REFRESH_TOKEN,
      revokedAt: null,
    });

    const response = await request(app)
      .post('/auth/logout')
      .set(
        'Cookie',
        'refreshToken=refresh-token',
      )
      .expect(204);

    expect(findRefreshTokenMock).toHaveBeenCalledWith(
      'refresh-token',
    );

    expect(revokeRefreshTokenMock).toHaveBeenCalledWith(10);

    const cookies = response.headers['set-cookie'];

    expect(cookies).toBeDefined();

    // O cookie deve ser reenviado com expiração imediata
    // para ser removido pelo navegador.
    expect(cookies?.[0]).toContain('refreshToken=');
    expect(cookies?.[0]).toContain('Expires=');
  });

  // Garante que logout sem cookie também seja aceito,
  // mantendo o comportamento idempotente.
  it('deve retornar 204 mesmo sem refresh token', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .expect(204);

    expect(findRefreshTokenMock).not.toHaveBeenCalled();
    expect(revokeRefreshTokenMock).not.toHaveBeenCalled();

    const cookies = response.headers['set-cookie'];

    // Mesmo sem sessão ativa, o servidor tenta remover
    // qualquer cookie residual do navegador.
    expect(cookies).toBeDefined();
    expect(cookies?.[0]).toContain('refreshToken=');
  });
});

// Agrupa os testes HTTP da solicitação
// de recuperação de senha.
describe('POST /auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que a resposta pública seja a mesma
  // quando existe uma conta associada ao e-mail.
  it('deve retornar uma mensagem genérica quando o usuário existir', async () => {
    requestPasswordResetMock.mockResolvedValue({
      email: 'guilherme@example.com',
      expiresAt: new Date(),
      token: 'reset-token',
    });

    const response = await request(app)
      .post('/auth/forgot-password')
      .send({
        email: 'guilherme@example.com',
      })
      .expect(200);

    expect(response.body).toEqual({
      message:
        'Se existir uma conta associada a este e-mail, enviaremos as instruções para redefinição da senha.',
    });

    expect(requestPasswordResetMock).toHaveBeenCalledWith(
      'guilherme@example.com',
    );
  });

  // Garante que a mesma resposta seja devolvida
  // quando não existe uma conta associada ao e-mail.
  it('deve retornar a mesma mensagem quando o usuário não existir', async () => {
    requestPasswordResetMock.mockResolvedValue(null);

    const response = await request(app)
      .post('/auth/forgot-password')
      .send({
        email: 'naoexiste@example.com',
      })
      .expect(200);

    expect(response.body).toEqual({
      message:
        'Se existir uma conta associada a este e-mail, enviaremos as instruções para redefinição da senha.',
    });
  });
});

// Agrupa os testes HTTP da redefinição de senha.
describe('POST /auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que uma redefinição válida conclua
  // o fluxo e informe que um novo login é necessário.
  it('deve redefinir a senha com sucesso', async () => {
    resetPasswordMock.mockResolvedValue(undefined);

    const response = await request(app)
      .post('/auth/reset-password')
      .send({
        password: 'novaSenha123',
        token: 'valid-reset-token',
      })
      .expect(200);

    expect(resetPasswordMock).toHaveBeenCalledWith(
      'valid-reset-token',
      'novaSenha123',
    );

    expect(response.body).toEqual({
      message:
        'Senha redefinida com sucesso. Faça login novamente.',
    });
  });

  // Garante que um token inválido seja convertido
  // em uma resposta HTTP apropriada pelo errorHandler.
  it('deve retornar 401 quando o token for inválido', async () => {
    resetPasswordMock.mockRejectedValue(
      new AppError(
        'Token de recuperação inválido.',
        401,
      ),
    );

    const response = await request(app)
      .post('/auth/reset-password')
      .send({
        password: 'novaSenha123',
        token: 'invalid-reset-token',
      })
      .expect(401);

    expect(response.body).toEqual({
      message: 'Token de recuperação inválido.',
    });
  });

  // Garante que tokens expirados também não
  // possam autorizar uma nova senha.
  it('deve retornar 401 quando o token estiver expirado', async () => {
    resetPasswordMock.mockRejectedValue(
      new AppError(
        'Token de recuperação expirado.',
        401,
      ),
    );

    const response = await request(app)
      .post('/auth/reset-password')
      .send({
        password: 'novaSenha123',
        token: 'expired-reset-token',
      })
      .expect(401);

    expect(response.body).toEqual({
      message: 'Token de recuperação expirado.',
    });
  });

  // Garante que erros de validação da nova senha
  // também sejam propagados corretamente pela API.
  it('deve retornar 400 quando a nova senha for inválida', async () => {
    resetPasswordMock.mockRejectedValue(
      new AppError(
        'A senha deve conter pelo menos 8 caracteres.',
        400,
      ),
    );

    const response = await request(app)
      .post('/auth/reset-password')
      .send({
        password: '1234567',
        token: 'valid-reset-token',
      })
      .expect(400);

    expect(response.body).toEqual({
      message:
        'A senha deve conter pelo menos 8 caracteres.',
    });
  });
});