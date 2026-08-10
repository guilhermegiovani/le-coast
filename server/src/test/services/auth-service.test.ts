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
} from '../../repositories/user-repository.js';
import { registerUser, loginUser } from '../../services/auth-service.js';

vi.mock('../../repositories/user-repository.js', () => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

const findUserByEmailMock = vi.mocked(findUserByEmail);
const createUserMock = vi.mocked(createUser);
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
  });

  // Garante que credenciais corretas retornem somente
  // os dados seguros necessários do usuário.
  it('deve autenticar quando as credenciais estiverem corretas', async () => {
    findUserByEmailMock.mockResolvedValue(ACTIVE_USER);
    bcryptCompareMock.mockResolvedValue(true);

    const result = await loginUser(VALID_LOGIN_INPUT);

    expect(bcryptCompareMock).toHaveBeenCalledWith(
      '12345678',
      'hashed-password',
    );

    expect(result).toEqual({
      token: expect.any(String),
      user: {
        email: 'guilherme@example.com',
        id: 1,
        name: 'Guilherme Nobre',
        role: 'CUSTOMER',
      },
    });

    // O hash da senha nunca deve fazer parte da resposta do login.
    expect(result.user).not.toHaveProperty('passwordHash');

    // O hash da senha nunca deve fazer parte da resposta do login.
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
  });
});