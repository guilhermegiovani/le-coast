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
import { registerUser } from '../../services/auth-service.js';

vi.mock('../../repositories/user-repository.js', () => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
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