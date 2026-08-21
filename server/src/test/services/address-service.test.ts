import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  countUserAddresses,
  createAddress,
  findAddressesByUserId,
} from '../../repositories/address-repository.js';

import {
  createUserAddress,
  listUserAddresses,
} from '../../services/address-service.js';

// Simula o repository para que os testes
// do service não acessem o banco real.
vi.mock('../../repositories/address-repository.js', () => ({
  countUserAddresses: vi.fn(),
  createAddress: vi.fn(),
  findAddressesByUserId: vi.fn(),
}));

const countUserAddressesMock = vi.mocked(
  countUserAddresses,
);

const createAddressMock = vi.mocked(
  createAddress,
);

const findAddressesByUserIdMock = vi.mocked(
  findAddressesByUserId,
);

const VALID_ADDRESS_INPUT = {
  city: 'Ribeirão Preto',
  complement: 'Apto 12',
  country: 'BR',
  name: 'Casa',
  neighborhood: 'Centro',
  number: '100',
  state: 'SP',
  street: 'Rua Exemplo',
  zipCode: '14000-000',
};

describe('createUserAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que o primeiro endereço cadastrado
  // seja definido automaticamente como padrão.
  it('deve criar o primeiro endereço como padrão', async () => {
    countUserAddressesMock.mockResolvedValue(0);

    createAddressMock.mockResolvedValue({
      city: 'Ribeirão Preto',
      complement: 'Apto 12',
      country: 'BR',
      createdAt: new Date(),
      id: 1,
      isDefault: true,
      name: 'Casa',
      neighborhood: 'Centro',
      number: '100',
      state: 'SP',
      street: 'Rua Exemplo',
      updatedAt: new Date(),
      userId: 1,
      zipCode: '14000-000',
    });

    await createUserAddress(
      1,
      VALID_ADDRESS_INPUT,
    );

    expect(
      countUserAddressesMock,
    ).toHaveBeenCalledWith(1);

    expect(createAddressMock).toHaveBeenCalledWith(
      1,
      VALID_ADDRESS_INPUT,
      true,
    );
  });

  // Garante que endereços posteriores não sejam
  // marcados automaticamente como padrão.
  it('não deve definir novos endereços como padrão quando o usuário já possuir endereço', async () => {
    countUserAddressesMock.mockResolvedValue(2);

    createAddressMock.mockResolvedValue({
      city: 'Ribeirão Preto',
      complement: 'Apto 12',
      country: 'BR',
      createdAt: new Date(),
      id: 2,
      isDefault: false,
      name: 'Casa',
      neighborhood: 'Centro',
      number: '100',
      state: 'SP',
      street: 'Rua Exemplo',
      updatedAt: new Date(),
      userId: 1,
      zipCode: '14000-000',
    });

    await createUserAddress(
      1,
      VALID_ADDRESS_INPUT,
    );

    expect(createAddressMock).toHaveBeenCalledWith(
      1,
      VALID_ADDRESS_INPUT,
      false,
    );
  });

  // Garante que o Zod normalize espaços extras
  // antes que os dados cheguem ao repository.
  it('deve normalizar os dados antes de persistir', async () => {
    countUserAddressesMock.mockResolvedValue(0);

    createAddressMock.mockResolvedValue({
      city: 'Ribeirão Preto',
      complement: 'Apto 12',
      country: 'BR',
      createdAt: new Date(),
      id: 1,
      isDefault: true,
      name: 'Casa',
      neighborhood: 'Centro',
      number: '100',
      state: 'SP',
      street: 'Rua Exemplo',
      updatedAt: new Date(),
      userId: 1,
      zipCode: '14000-000',
    });

    await createUserAddress(
      1,
      {
        city: '  Ribeirão Preto  ',
        complement: '  Apto 12  ',
        country: '  BR  ',
        name: '  Casa  ',
        neighborhood: '  Centro  ',
        number: '  100  ',
        state: '  SP  ',
        street: '  Rua Exemplo  ',
        zipCode: '  14000-000  ',
      },
    );

    expect(createAddressMock).toHaveBeenCalledWith(
      1,
      VALID_ADDRESS_INPUT,
      true,
    );
  });

  // Garante que dados inválidos sejam rejeitados
  // antes de qualquer acesso ao repository.
  it('não deve persistir um endereço inválido', async () => {
    await expect(
      createUserAddress(
        1,
        {
          ...VALID_ADDRESS_INPUT,
          city: '   ',
        },
      ),
    ).rejects.toBeDefined();

    expect(
      countUserAddressesMock,
    ).not.toHaveBeenCalled();

    expect(
      createAddressMock,
    ).not.toHaveBeenCalled();
  });
});

describe('listUserAddresses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que a listagem utilize apenas
  // o id do usuário autenticado.
  it('deve listar os endereços do usuário informado', async () => {
    const addresses = [
      {
        city: 'Ribeirão Preto',
        complement: 'Apto 12',
        country: 'BR',
        createdAt: new Date(),
        id: 1,
        isDefault: true,
        name: 'Casa',
        neighborhood: 'Centro',
        number: '100',
        state: 'SP',
        street: 'Rua Exemplo',
        updatedAt: new Date(),
        userId: 3,
        zipCode: '14000-000',
      },
      {
        city: 'Ribeirão Preto',
        complement: null,
        country: 'BR',
        createdAt: new Date(),
        id: 2,
        isDefault: false,
        name: 'Trabalho',
        neighborhood: 'Centro',
        number: '200',
        state: 'SP',
        street: 'Rua Trabalho',
        updatedAt: new Date(),
        userId: 3,
        zipCode: '14000-001',
      },
    ];

    findAddressesByUserIdMock.mockResolvedValue(
      addresses,
    );

    const result = await listUserAddresses(3);

    expect(
      findAddressesByUserIdMock,
    ).toHaveBeenCalledWith(3);

    expect(result).toEqual(addresses);
  });

  // Garante que usuários sem endereços
  // recebam uma lista vazia, não um erro.
  it('deve retornar lista vazia quando o usuário não possuir endereços', async () => {
    findAddressesByUserIdMock.mockResolvedValue([]);

    const result = await listUserAddresses(3);

    expect(result).toEqual([]);
  });
});