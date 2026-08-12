import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { prisma } from '../../config/prisma.js';
import { createRefreshToken } from '../../services/refresh-token-service.js';

// Mocka apenas a escrita no Prisma.
// A geração do token e do hash continua sendo real.
vi.mock('../../config/prisma.js', () => ({
  prisma: {
    refreshToken: {
      create: vi.fn(),
    },
  },
}));

const createRefreshTokenRecordMock = vi.mocked(
  prisma.refreshToken.create,
);

// Agrupa os testes da criação de refresh tokens.
describe('createRefreshToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que um refresh token seja criado
  // e persistido para o usuário informado.
  it('deve criar um refresh token para o usuário', async () => {
    createRefreshTokenRecordMock.mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: 1,
      revokedAt: null,
      tokenHash: 'hash',
      userId: 1,
    });

    const result = await createRefreshToken(1);

    expect(result.token).toEqual(expect.any(String));
    expect(result.token.length).toBeGreaterThan(0);

    expect(result.expiresAt).toBeInstanceOf(Date);

    expect(createRefreshTokenRecordMock).toHaveBeenCalledTimes(1);
  });

  // Garante que o valor original do refresh token
  // nunca seja salvo diretamente no banco.
  it('não deve persistir o refresh token original', async () => {
    createRefreshTokenRecordMock.mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: 1,
      revokedAt: null,
      tokenHash: 'hash',
      userId: 1,
    });

    const result = await createRefreshToken(1);

    const call =
      createRefreshTokenRecordMock.mock.calls[0]?.[0];

    expect(call).toBeDefined();

    expect(call?.data).not.toMatchObject({
      tokenHash: result.token,
    });
  });

  // Garante que o hash persistido seja diferente
  // do token original entregue ao cliente.
  it('deve persistir somente o hash do refresh token', async () => {
    createRefreshTokenRecordMock.mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: 1,
      revokedAt: null,
      tokenHash: 'hash',
      userId: 1,
    });

    const result = await createRefreshToken(1);

    const call =
      createRefreshTokenRecordMock.mock.calls[0]?.[0];

    expect(call?.data.tokenHash).toEqual(
      expect.any(String),
    );

    expect(call?.data.tokenHash).not.toBe(result.token);

    // SHA-256 em hexadecimal gera 64 caracteres.
    expect(call?.data.tokenHash).toHaveLength(64);
  });

  // Garante que o refresh token seja associado
  // ao usuário correto no banco.
  it('deve associar o refresh token ao usuário', async () => {
    createRefreshTokenRecordMock.mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: 1,
      revokedAt: null,
      tokenHash: 'hash',
      userId: 42,
    });

    await createRefreshToken(42);

    expect(
      createRefreshTokenRecordMock,
    ).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 42,
      }),
    });
  });

  // Garante que a sessão criada possua
  // uma data de expiração futura.
  it('deve criar uma data de expiração futura', async () => {
    createRefreshTokenRecordMock.mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: 1,
      revokedAt: null,
      tokenHash: 'hash',
      userId: 1,
    });

    const beforeCreation = new Date();

    const result = await createRefreshToken(1);

    expect(
      result.expiresAt.getTime(),
    ).toBeGreaterThan(beforeCreation.getTime());
  });
});