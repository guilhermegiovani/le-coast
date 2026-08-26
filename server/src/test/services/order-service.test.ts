import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  createOrderRepository,
  findOrderByIdAndUserId,
  findOrdersByUserId,
} from '../../repositories/order-repository.js';

import {
  createUserOrder,
  getUserOrderById,
  listUserOrders,
} from '../../services/order-service.js';

// Simula o repository para que os testes do service
// não utilizem o banco real.
vi.mock('../../repositories/order-repository.js', () => ({
  createOrderRepository: vi.fn(),
  findOrderByIdAndUserId: vi.fn(),
  findOrdersByUserId: vi.fn(),
}));

const createOrderRepositoryMock = vi.mocked(
  createOrderRepository,
);

const findOrdersByUserIdMock = vi.mocked(
  findOrdersByUserId,
);

const findOrderByIdAndUserIdMock = vi.mocked(
  findOrderByIdAndUserId,
);

const VALID_ORDER_INPUT = {
  address: {
    city: 'Ribeirão Preto',
    complement: 'Apto 12',
    country: 'BR',
    name: 'Casa',
    neighborhood: 'Centro',
    number: '100',
    state: 'SP',
    street: 'Rua Exemplo',
    zipCode: '14000-000',
  },
  items: [
    {
      quantity: 2,
      unitPrice: 79.9,
      variantId: 1,
    },
    {
      quantity: 1,
      unitPrice: 49.9,
      variantId: 2,
    },
  ],
};

describe('createUserOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que o valor total seja calculado
  // no backend a partir dos itens do pedido.
  it('deve calcular corretamente o valor total do pedido', async () => {
    createOrderRepositoryMock.mockResolvedValue({
      address: null,
      createdAt: new Date(),
      id: 1,
      items: [],
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      totalAmount: 209.7 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    await createUserOrder(
      3,
      VALID_ORDER_INPUT,
    );

    expect(
      createOrderRepositoryMock,
    ).toHaveBeenCalledWith({
      data: VALID_ORDER_INPUT,
      totalAmount: 209.7,
      userId: 3,
    });
  });

  // Garante que os dados sejam validados e normalizados
  // antes de chegarem à camada de persistência.
  it('deve normalizar os dados antes de criar o pedido', async () => {
    createOrderRepositoryMock.mockResolvedValue({
      address: null,
      createdAt: new Date(),
      id: 1,
      items: [],
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      totalAmount: 159.8 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    await createUserOrder(
      3,
      {
        address: {
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
        items: [
          {
            quantity: 2,
            unitPrice: 79.9,
            variantId: 1,
          },
        ],
      },
    );

    expect(
      createOrderRepositoryMock,
    ).toHaveBeenCalledWith({
      data: {
        address: {
          city: 'Ribeirão Preto',
          complement: 'Apto 12',
          country: 'BR',
          name: 'Casa',
          neighborhood: 'Centro',
          number: '100',
          state: 'SP',
          street: 'Rua Exemplo',
          zipCode: '14000-000',
        },
        items: [
          {
            quantity: 2,
            unitPrice: 79.9,
            variantId: 1,
          },
        ],
      },
      totalAmount: 159.8,
      userId: 3,
    });
  });

  // Garante que pedidos inválidos sejam rejeitados
  // antes de qualquer tentativa de persistência.
  it('não deve criar pedido sem itens', async () => {
    await expect(
      createUserOrder(
        3,
        {
          ...VALID_ORDER_INPUT,
          items: [],
        },
      ),
    ).rejects.toBeDefined();

    expect(
      createOrderRepositoryMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que itens com quantidade inválida
  // não cheguem ao repository.
  it('não deve criar pedido com quantidade inválida', async () => {
    await expect(
      createUserOrder(
        3,
        {
          ...VALID_ORDER_INPUT,
          items: [
            {
              quantity: 0,
              unitPrice: 79.9,
              variantId: 1,
            },
          ],
        },
      ),
    ).rejects.toBeDefined();

    expect(
      createOrderRepositoryMock,
    ).not.toHaveBeenCalled();
  });
});

describe('listUserOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que a listagem utilize exclusivamente
  // o id do usuário autenticado.
  it('deve buscar os pedidos do usuário informado', async () => {
    findOrdersByUserIdMock.mockResolvedValue([]);

    const result = await listUserOrders(3);

    expect(
      findOrdersByUserIdMock,
    ).toHaveBeenCalledWith(3);

    expect(result).toEqual([]);
  });
});

describe('getUserOrderById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que a busca utilize tanto o id do pedido
  // quanto o id do usuário autenticado.
  it('deve buscar um pedido pertencente ao usuário informado', async () => {
    findOrderByIdAndUserIdMock.mockResolvedValue(null);

    const result = await getUserOrderById(
      3,
      1,
    );

    expect(
      findOrderByIdAndUserIdMock,
    ).toHaveBeenCalledWith(
      1,
      3,
    );

    expect(result).toBeNull();
  });
});