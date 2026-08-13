import bcrypt from 'bcryptjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { prisma } from '../../config/prisma.js';
import {
  findPasswordResetToken,
  markPasswordResetTokenAsUsed,
} from '../../repositories/password-reset-repository.js';
import {
  findUserByEmail,
  updateUserPassword,
} from '../../repositories/user-repository.js';
import {
  requestPasswordReset,
  resetPassword,
} from '../../services/password-reset-service.js';
import { revokeAllRefreshTokens } from '../../services/refresh-token-service.js';

// Mocka o repository de usuários para não acessar
// o banco real durante os testes unitários.
vi.mock('../../repositories/user-repository.js', () => ({
  findUserByEmail: vi.fn(),
  updateUserPassword: vi.fn(),
}));

// Simula o acesso aos tokens de recuperação
// sem consultar o banco real.
vi.mock('../../repositories/password-reset-repository.js', () => ({
  findPasswordResetToken: vi.fn(),
  markPasswordResetTokenAsUsed: vi.fn(),
}));

// Simula a revogação das sessões renováveis
// sem alterar refresh tokens reais no banco.
vi.mock('../../services/refresh-token-service.js', () => ({
  revokeAllRefreshTokens: vi.fn(),
}));

// Simula o Prisma sem acessar o banco real.
// Mantemos somente a criação de tokens e o controle
// da transação utilizado pelo service.
vi.mock('../../config/prisma.js', () => ({
  prisma: {
    passwordResetToken: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Simula o bcrypt para controlar o hash gerado
// durante os testes de redefinição da senha.
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}));

const findUserByEmailMock = vi.mocked(findUserByEmail);

const updateUserPasswordMock = vi.mocked(
  updateUserPassword,
);

const findPasswordResetTokenMock = vi.mocked(
  findPasswordResetToken,
);

const markPasswordResetTokenAsUsedMock = vi.mocked(
  markPasswordResetTokenAsUsed,
);

const revokeAllRefreshTokensMock = vi.mocked(
  revokeAllRefreshTokens,
);

const createPasswordResetTokenMock = vi.mocked(
  prisma.passwordResetToken.create,
);

const transactionMock = vi.mocked(
  prisma.$transaction,
);

const bcryptHashMock = vi.mocked(
  bcrypt.hash as (
    data: string,
    saltOrRounds: number,
  ) => Promise<string>,
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

const VALID_STORED_RESET_TOKEN = {
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 60_000),
  id: 10,
  tokenHash: 'hashed-reset-token',
  usedAt: null,
  userId: 1,
  user: ACTIVE_USER,
};

// Representa o mesmo client transacional que será
// compartilhado entre todas as operações do reset.
const TRANSACTION_CLIENT = {
  transaction: true,
} as never;

// Agrupa os testes relacionados à solicitação
// de recuperação de senha.
describe('requestPasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que o e-mail seja normalizado
  // antes da busca pelo usuário.
  it('deve normalizar o e-mail antes de buscar o usuário', async () => {
    findUserByEmailMock.mockResolvedValue(ACTIVE_USER);

    createPasswordResetTokenMock.mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: 1,
      tokenHash: 'hash',
      usedAt: null,
      userId: 1,
    });

    await requestPasswordReset(
      '  GUILHERME@EXAMPLE.COM  ',
    );

    expect(findUserByEmailMock).toHaveBeenCalledWith(
      'guilherme@example.com',
    );
  });

  // Garante que um token de recuperação seja criado
  // quando o usuário realmente existir.
  it('deve criar um token de recuperação para um usuário existente', async () => {
    findUserByEmailMock.mockResolvedValue(ACTIVE_USER);

    createPasswordResetTokenMock.mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: 1,
      tokenHash: 'hash',
      usedAt: null,
      userId: 1,
    });

    const result = await requestPasswordReset(
      'guilherme@example.com',
    );

    expect(result).not.toBeNull();
    expect(result?.email).toBe('guilherme@example.com');
    expect(result?.token).toEqual(expect.any(String));
    expect(result?.expiresAt).toBeInstanceOf(Date);

    expect(
      createPasswordResetTokenMock,
    ).toHaveBeenCalledTimes(1);
  });

  // Garante que somente o hash do token seja
  // persistido no banco.
  it('não deve persistir o token original', async () => {
    findUserByEmailMock.mockResolvedValue(ACTIVE_USER);

    createPasswordResetTokenMock.mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: 1,
      tokenHash: 'hash',
      usedAt: null,
      userId: 1,
    });

    const result = await requestPasswordReset(
      'guilherme@example.com',
    );

    const call =
      createPasswordResetTokenMock.mock.calls[0]?.[0];

    expect(call).toBeDefined();

    expect(call?.data.tokenHash).toEqual(
      expect.any(String),
    );

    expect(call?.data.tokenHash).not.toBe(
      result?.token,
    );

    // SHA-256 em hexadecimal gera 64 caracteres.
    expect(call?.data.tokenHash).toHaveLength(64);
  });

  // Garante que o token seja associado
  // ao usuário correto.
  it('deve associar o token ao usuário correto', async () => {
    findUserByEmailMock.mockResolvedValue(ACTIVE_USER);

    createPasswordResetTokenMock.mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: 1,
      tokenHash: 'hash',
      usedAt: null,
      userId: 1,
    });

    await requestPasswordReset(
      'guilherme@example.com',
    );

    expect(
      createPasswordResetTokenMock,
    ).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 1,
      }),
    });
  });

  // Garante que o token possua uma data
  // de expiração futura.
  it('deve criar uma data de expiração futura', async () => {
    findUserByEmailMock.mockResolvedValue(ACTIVE_USER);

    createPasswordResetTokenMock.mockResolvedValue({
      createdAt: new Date(),
      expiresAt: new Date(),
      id: 1,
      tokenHash: 'hash',
      usedAt: null,
      userId: 1,
    });

    const beforeCreation = new Date();

    const result = await requestPasswordReset(
      'guilherme@example.com',
    );

    expect(
      result!.expiresAt.getTime(),
    ).toBeGreaterThan(beforeCreation.getTime());
  });

  // Garante que e-mails inexistentes não gerem
  // token e não revelem a existência da conta.
  it('não deve criar token quando o usuário não existir', async () => {
    findUserByEmailMock.mockResolvedValue(null);

    const result = await requestPasswordReset(
      'naoexiste@example.com',
    );

    expect(result).toBeNull();

    expect(
      createPasswordResetTokenMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que dados inválidos sejam rejeitados
  // antes de qualquer acesso ao banco.
  it('não deve acessar o repository com e-mail inválido', async () => {
    await expect(
      requestPasswordReset('email-invalido'),
    ).rejects.toMatchObject({
      message: 'Informe um e-mail válido.',
      statusCode: 400,
    });

    expect(findUserByEmailMock).not.toHaveBeenCalled();

    expect(
      createPasswordResetTokenMock,
    ).not.toHaveBeenCalled();
  });
});

// Agrupa os testes relacionados à redefinição
// efetiva da senha do usuário.
describe('resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Simula o Prisma executando o callback
    // com um mesmo client transacional.
    transactionMock.mockImplementation(
      async (callback: any) =>
        callback(TRANSACTION_CLIENT),
    );

    // Evita executar bcrypt real e permite
    // verificar exatamente o hash enviado ao repository.
    bcryptHashMock.mockResolvedValue(
      'new-password-hash',
    );
  });

  // Garante que um token válido permita redefinir
  // a senha e invalidar todas as sessões antigas.
  it('deve redefinir a senha com um token válido', async () => {
    findPasswordResetTokenMock.mockResolvedValue(
      VALID_STORED_RESET_TOKEN,
    );

    await resetPassword(
      'valid-reset-token',
      'novaSenha123',
    );

    // A senha é protegida antes de qualquer
    // alteração persistente.
    expect(bcryptHashMock).toHaveBeenCalledWith(
      'novaSenha123',
      12,
    );

    // A atualização da senha deve participar
    // da mesma transação das outras operações.
    expect(updateUserPasswordMock).toHaveBeenCalledWith(
      1,
      'new-password-hash',
      TRANSACTION_CLIENT,
    );

    // O token deve ser marcado como utilizado
    // dentro da mesma transação.
    expect(
      markPasswordResetTokenAsUsedMock,
    ).toHaveBeenCalledWith(
      10,
      TRANSACTION_CLIENT,
    );

    // Todas as sessões antigas precisam ser
    // revogadas no mesmo contexto transacional.
    expect(
      revokeAllRefreshTokensMock,
    ).toHaveBeenCalledWith(
      1,
      TRANSACTION_CLIENT,
    );

    expect(transactionMock).toHaveBeenCalledTimes(1);
  });

  // Garante que tokens inexistentes sejam rejeitados
  // antes de qualquer alteração no banco.
  it('deve rejeitar um token inexistente', async () => {
    findPasswordResetTokenMock.mockResolvedValue(null);

    await expect(
      resetPassword(
        'invalid-token',
        'novaSenha123',
      ),
    ).rejects.toMatchObject({
      message: 'Token de recuperação inválido.',
      statusCode: 401,
    });

    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(transactionMock).not.toHaveBeenCalled();
    expect(updateUserPasswordMock).not.toHaveBeenCalled();
  });

  // Garante que um token já utilizado
  // não possa redefinir a senha novamente.
  it('deve rejeitar um token já utilizado', async () => {
    findPasswordResetTokenMock.mockResolvedValue({
      ...VALID_STORED_RESET_TOKEN,
      usedAt: new Date(),
    });

    await expect(
      resetPassword(
        'used-token',
        'novaSenha123',
      ),
    ).rejects.toMatchObject({
      message: 'Token de recuperação inválido.',
      statusCode: 401,
    });

    expect(transactionMock).not.toHaveBeenCalled();
  });

  // Garante que tokens expirados
  // deixem de ser aceitos.
  it('deve rejeitar um token expirado', async () => {
    findPasswordResetTokenMock.mockResolvedValue({
      ...VALID_STORED_RESET_TOKEN,
      expiresAt: new Date(Date.now() - 60_000),
    });

    await expect(
      resetPassword(
        'expired-token',
        'novaSenha123',
      ),
    ).rejects.toMatchObject({
      message: 'Token de recuperação expirado.',
      statusCode: 401,
    });

    expect(transactionMock).not.toHaveBeenCalled();
  });

  // Garante que usuários inativos não possam
  // redefinir a senha por esse fluxo.
  it('deve rejeitar quando o usuário estiver inativo', async () => {
    findPasswordResetTokenMock.mockResolvedValue({
      ...VALID_STORED_RESET_TOKEN,
      user: {
        ...ACTIVE_USER,
        isActive: false,
      },
    });

    await expect(
      resetPassword(
        'valid-token',
        'novaSenha123',
      ),
    ).rejects.toMatchObject({
      message: 'Usuário inativo.',
      statusCode: 403,
    });

    expect(transactionMock).not.toHaveBeenCalled();
  });

  // Garante que a nova senha seja obrigatória.
  it('deve exigir a nova senha', async () => {
    findPasswordResetTokenMock.mockResolvedValue(
      VALID_STORED_RESET_TOKEN,
    );

    await expect(
      resetPassword(
        'valid-token',
        '',
      ),
    ).rejects.toMatchObject({
      message: 'Informe a nova senha.',
      statusCode: 400,
    });

    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(transactionMock).not.toHaveBeenCalled();
  });

  // Garante que a nova senha respeite
  // a política mínima da aplicação.
  it('deve rejeitar uma nova senha muito curta', async () => {
    findPasswordResetTokenMock.mockResolvedValue(
      VALID_STORED_RESET_TOKEN,
    );

    await expect(
      resetPassword(
        'valid-token',
        '1234567',
      ),
    ).rejects.toMatchObject({
      message:
        'A senha deve conter pelo menos 8 caracteres.',
      statusCode: 400,
    });

    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(transactionMock).not.toHaveBeenCalled();
  });
});