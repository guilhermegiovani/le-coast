import bcrypt from 'bcryptjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  createUser,
  findUserByEmail,
  findUserById,
} from '../../repositories/user-repository.js';

import {
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from '../../services/auth-service.js';

import {
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
} from '../../services/refresh-token-service.js';

vi.mock('../../repositories/user-repository.js', () => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
}));

vi.mock('../../services/refresh-token-service.js', () => ({
  createRefreshToken: vi.fn(),
  findRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

const findUserByEmailMock = vi.mocked(findUserByEmail);
const findUserByIdMock = vi.mocked(findUserById);
const createUserMock = vi.mocked(createUser);

const createRefreshTokenMock = vi.mocked(
  createRefreshToken,
);

const findRefreshTokenMock = vi.mocked(
  findRefreshToken,
);

const revokeRefreshTokenMock = vi.mocked(
  revokeRefreshToken,
);

const bcryptHashMock = vi.mocked(
  bcrypt.hash as (
    data: string,
    saltOrRounds: number,
  ) => Promise<string>,
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

const VALID_LOGIN_INPUT = {
  email: 'guilherme@example.com',
  password: '12345678',
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

describe('registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve normalizar nome e e-mail antes de criar o usuário', async () => {
    findUserByEmailMock.mockResolvedValue(null);

    bcryptHashMock.mockResolvedValue('hashed-password');

    createUserMock.mockResolvedValue({
      email: 'guilherme@example.com',
      id: 1,
      name: 'Guilherme Nobre',
      role: 'CUSTOMER',
    });

    const result = await registerUser({
      email: '  GUILHERME@EXAMPLE.COM  ',
      name: '  Guilherme Nobre  ',
      password: '12345678',
    });

    expect(findUserByEmailMock).toHaveBeenCalledWith(
      'guilherme@example.com',
    );

    expect(createUserMock).toHaveBeenCalledWith({
      email: 'guilherme@example.com',
      name: 'Guilherme Nobre',
      passwordHash: 'hashed-password',
    });

    expect(result).toEqual({
      email: 'guilherme@example.com',
      id: 1,
      name: 'Guilherme Nobre',
      role: 'CUSTOMER',
    });
  });

  it('deve gerar o hash da senha antes de criar o usuário', async () => {
    findUserByEmailMock.mockResolvedValue(null);

    bcryptHashMock.mockResolvedValue('hashed-password');

    createUserMock.mockResolvedValue({
      email: 'guilherme@example.com',
      id: 1,
      name: 'Guilherme Nobre',
      role: 'CUSTOMER',
    });

    await registerUser({
      email: 'guilherme@example.com',
      name: 'Guilherme Nobre',
      password: '12345678',
    });

    expect(bcryptHashMock).toHaveBeenCalledWith(
      '12345678',
      12,
    );

    expect(createUserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        passwordHash: 'hashed-password',
      }),
    );
  });

  it('não deve enviar a senha original para o repository', async () => {
    findUserByEmailMock.mockResolvedValue(null);

    bcryptHashMock.mockResolvedValue('hashed-password');

    createUserMock.mockResolvedValue({
      email: 'guilherme@example.com',
      id: 1,
      name: 'Guilherme Nobre',
      role: 'CUSTOMER',
    });

    await registerUser({
      email: 'guilherme@example.com',
      name: 'Guilherme Nobre',
      password: '12345678',
    });

    expect(createUserMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        password: '12345678',
      }),
    );
  });

  it('deve lançar AppError quando o e-mail já estiver cadastrado', async () => {
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

    await expect(
      registerUser({
        email: 'guilherme@example.com',
        name: 'Guilherme Nobre',
        password: '12345678',
      }),
    ).rejects.toMatchObject({
      message: 'E-mail já cadastrado.',
      statusCode: 409,
    });

    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(createUserMock).not.toHaveBeenCalled();
  });

  // Garante que dados inválidos sejam rejeitados antes
  // de qualquer consulta ou alteração no banco.
  it('não deve acessar o repository quando os dados forem inválidos', async () => {
    await expect(
      registerUser({
        email: 'email-invalido',
        name: 'Guilherme Nobre',
        password: '12345678',
      }),
    ).rejects.toMatchObject({
      message: 'Informe um e-mail válido.',
      statusCode: 400,
    });

    expect(findUserByEmailMock).not.toHaveBeenCalled();
    expect(bcryptHashMock).not.toHaveBeenCalled();
    expect(createUserMock).not.toHaveBeenCalled();
  });
});

// Agrupa os testes das regras de autenticação do usuário.
describe('loginUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Define uma sessão renovável padrão para os testes
    // em que o login chega até a criação do refresh token.
    createRefreshTokenMock.mockResolvedValue({
      expiresAt: new Date('2026-09-11T00:00:00.000Z'),
      token: 'refresh-token',
    });
  });

  // Garante que o e-mail seja normalizado antes da busca no banco.
  it('deve normalizar o e-mail antes de buscar o usuário', async () => {
    findUserByEmailMock.mockResolvedValue(ACTIVE_USER);
    bcryptCompareMock.mockResolvedValue(true);

    await loginUser({
      email: '  GUILHERME@EXAMPLE.COM  ',
      password: '12345678',
    });

    expect(findUserByEmailMock).toHaveBeenCalledWith(
      'guilherme@example.com',
    );
  });

  // Garante que um e-mail inexistente não permita autenticação.
  it('deve rejeitar quando o usuário não for encontrado', async () => {
    findUserByEmailMock.mockResolvedValue(null);

    await expect(
      loginUser(VALID_LOGIN_INPUT),
    ).rejects.toMatchObject({
      message: 'E-mail ou senha inválidos.',
      statusCode: 401,
    });

    // Não existe motivo para comparar a senha se o usuário não existe.
    expect(bcryptCompareMock).not.toHaveBeenCalled();
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });

  // Garante que usuários inativos não possam autenticar.
  it('deve rejeitar quando o usuário estiver inativo', async () => {
    findUserByEmailMock.mockResolvedValue({
      ...ACTIVE_USER,
      isActive: false,
    });

    await expect(
      loginUser(VALID_LOGIN_INPUT),
    ).rejects.toMatchObject({
      message: 'Usuário inativo.',
      statusCode: 403,
    });

    // A autenticação é interrompida antes da comparação da senha.
    expect(bcryptCompareMock).not.toHaveBeenCalled();
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });

  // Garante que uma senha incorreta não permita autenticação.
  it('deve rejeitar quando a senha estiver incorreta', async () => {
    findUserByEmailMock.mockResolvedValue(ACTIVE_USER);
    bcryptCompareMock.mockResolvedValue(false);

    await expect(
      loginUser(VALID_LOGIN_INPUT),
    ).rejects.toMatchObject({
      message: 'E-mail ou senha inválidos.',
      statusCode: 401,
    });

    expect(bcryptCompareMock).toHaveBeenCalledWith(
      '12345678',
      'hashed-password',
    );
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });

  // Garante que credenciais corretas criem
  // uma sessão autenticada completa.
  it('deve autenticar quando as credenciais estiverem corretas', async () => {
    findUserByEmailMock.mockResolvedValue(ACTIVE_USER);
    bcryptCompareMock.mockResolvedValue(true);

    const result = await loginUser(VALID_LOGIN_INPUT);

    expect(bcryptCompareMock).toHaveBeenCalledWith(
      '12345678',
      'hashed-password',
    );

    // O login deve criar uma sessão renovável
    // associada ao usuário autenticado.
    expect(createRefreshTokenMock).toHaveBeenCalledWith(1);

    expect(result).toEqual({
      accessToken: expect.any(String),
      refreshToken: 'refresh-token',
      user: {
        email: 'guilherme@example.com',
        id: 1,
        name: 'Guilherme Nobre',
        role: 'CUSTOMER',
      },
    });

    // Dados sensíveis nunca devem fazer parte
    // da resposta pública do login.
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  // Garante que entradas inválidas sejam rejeitadas antes
  // de qualquer acesso ao repository.
  it('não deve acessar o repository quando os dados forem inválidos', async () => {
    await expect(
      loginUser({
        email: 'email-invalido',
        password: '12345678',
      }),
    ).rejects.toMatchObject({
      message: 'Informe um e-mail válido.',
      statusCode: 400,
    });

    expect(findUserByEmailMock).not.toHaveBeenCalled();
    expect(bcryptCompareMock).not.toHaveBeenCalled();
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });
});

// Agrupa os testes responsáveis por recuperar
// os dados atuais do usuário autenticado.
describe('getAuthenticatedUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que um usuário existente e ativo
  // tenha somente seus dados seguros retornados.
  it('deve retornar o usuário autenticado', async () => {
    findUserByIdMock.mockResolvedValue({
      email: 'guilherme@example.com',
      id: 1,
      isActive: true,
      name: 'Guilherme Nobre',
      role: 'CUSTOMER',
    });

    const result = await getAuthenticatedUser(1);

    expect(findUserByIdMock).toHaveBeenCalledWith(1);

    expect(result).toEqual({
      email: 'guilherme@example.com',
      id: 1,
      name: 'Guilherme Nobre',
      role: 'CUSTOMER',
    });

    // Informações internas, como isActive, não precisam
    // fazer parte do contrato público deste endpoint.
    expect(result).not.toHaveProperty('isActive');
  });

  // Garante que um id inexistente não seja tratado
  // como uma sessão autenticada válida.
  it('deve rejeitar quando o usuário não for encontrado', async () => {
    findUserByIdMock.mockResolvedValue(null);

    await expect(
      getAuthenticatedUser(999),
    ).rejects.toMatchObject({
      message: 'Usuário não encontrado.',
      statusCode: 404,
    });
  });

  // Garante que um usuário desativado perca o acesso,
  // mesmo que ainda possua um JWT não expirado.
  it('deve rejeitar quando o usuário estiver inativo', async () => {
    findUserByIdMock.mockResolvedValue({
      email: 'guilherme@example.com',
      id: 1,
      isActive: false,
      name: 'Guilherme Nobre',
      role: 'CUSTOMER',
    });

    await expect(
      getAuthenticatedUser(1),
    ).rejects.toMatchObject({
      message: 'Usuário inativo.',
      statusCode: 403,
    });
  });
});

// Agrupa os testes relacionados à renovação da sessão.
describe('refreshSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Define uma nova sessão renovável padrão
    // para os cenários de renovação bem-sucedida.
    createRefreshTokenMock.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      token: 'new-refresh-token',
    });
  });

  // Garante que um refresh token válido seja
  // rotacionado e gere uma nova sessão.
  it('deve renovar a sessão com um refresh token válido', async () => {
    findRefreshTokenMock.mockResolvedValue(
      VALID_STORED_REFRESH_TOKEN,
    );

    const result = await refreshSession(
      'old-refresh-token',
    );

    expect(findRefreshTokenMock).toHaveBeenCalledWith(
      'old-refresh-token',
    );

    // O token atual deve ser revogado antes
    // da emissão de uma nova sessão.
    expect(revokeRefreshTokenMock).toHaveBeenCalledWith(10);

    // Um novo refresh token deve ser criado
    // para o mesmo usuário.
    expect(createRefreshTokenMock).toHaveBeenCalledWith(1);

    expect(result).toEqual({
      accessToken: expect.any(String),
      refreshToken: 'new-refresh-token',
      user: {
        email: 'guilherme@example.com',
        id: 1,
        name: 'Guilherme Nobre',
        role: 'CUSTOMER',
      },
    });
  });

  // Garante que tokens inexistentes não possam
  // criar uma nova sessão.
  it('deve rejeitar um refresh token inexistente', async () => {
    findRefreshTokenMock.mockResolvedValue(null);

    await expect(
      refreshSession('invalid-refresh-token'),
    ).rejects.toMatchObject({
      message: 'Refresh token inválido.',
      statusCode: 401,
    });

    expect(revokeRefreshTokenMock).not.toHaveBeenCalled();
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });

  // Garante que um refresh token já revogado
  // não possa ser reutilizado.
  it('deve rejeitar um refresh token revogado', async () => {
    findRefreshTokenMock.mockResolvedValue({
      ...VALID_STORED_REFRESH_TOKEN,
      revokedAt: new Date(),
    });

    await expect(
      refreshSession('revoked-refresh-token'),
    ).rejects.toMatchObject({
      message: 'Refresh token inválido.',
      statusCode: 401,
    });

    expect(revokeRefreshTokenMock).not.toHaveBeenCalled();
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });

  // Garante que tokens expirados não possam
  // renovar uma sessão.
  it('deve rejeitar um refresh token expirado', async () => {
    findRefreshTokenMock.mockResolvedValue({
      ...VALID_STORED_REFRESH_TOKEN,
      expiresAt: new Date(Date.now() - 60_000),
    });

    await expect(
      refreshSession('expired-refresh-token'),
    ).rejects.toMatchObject({
      message: 'Refresh token expirado.',
      statusCode: 401,
    });

    expect(revokeRefreshTokenMock).not.toHaveBeenCalled();
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });

  // Garante que usuários inativos não possam
  // renovar sessões existentes.
  it('deve rejeitar quando o usuário estiver inativo', async () => {
    findRefreshTokenMock.mockResolvedValue({
      ...VALID_STORED_REFRESH_TOKEN,
      user: {
        ...ACTIVE_USER,
        isActive: false,
      },
    });

    await expect(
      refreshSession('refresh-token'),
    ).rejects.toMatchObject({
      message: 'Usuário inativo.',
      statusCode: 403,
    });

    expect(revokeRefreshTokenMock).not.toHaveBeenCalled();
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });
});

// Agrupa os testes relacionados ao encerramento da sessão.
describe('logoutUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que uma sessão ativa seja revogada.
  it('deve revogar o refresh token quando a sessão existir', async () => {
    findRefreshTokenMock.mockResolvedValue({
      ...VALID_STORED_REFRESH_TOKEN,
      revokedAt: null,
    });

    await logoutUser('refresh-token');

    expect(findRefreshTokenMock).toHaveBeenCalledWith(
      'refresh-token',
    );

    expect(revokeRefreshTokenMock).toHaveBeenCalledWith(10);
  });

  // Garante que logout de uma sessão inexistente
  // continue sendo tratado como sucesso.
  it('não deve lançar erro quando a sessão não existir', async () => {
    findRefreshTokenMock.mockResolvedValue(null);

    await expect(
      logoutUser('refresh-token'),
    ).resolves.toBeUndefined();

    expect(revokeRefreshTokenMock).not.toHaveBeenCalled();
  });

  // Garante que uma sessão já revogada não seja
  // processada novamente.
  it('não deve revogar novamente uma sessão já encerrada', async () => {
    findRefreshTokenMock.mockResolvedValue({
      ...VALID_STORED_REFRESH_TOKEN,
      revokedAt: new Date(),
    });

    await logoutUser('refresh-token');

    expect(revokeRefreshTokenMock).not.toHaveBeenCalled();
  });
});