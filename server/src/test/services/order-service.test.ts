import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  createOrderRepository,
  findOrderById,
  findOrderByIdAndUserId,
  findOrdersByUserId,
  updateOrderStatusRepository,
} from '../../repositories/order-repository.js';

import {
  createUserOrder,
  getUserOrderById,
  listUserOrders,
  updateOrderStatus,
} from '../../services/order-service.js';

// Simula o repository para que os testes do service
// não utilizem o banco real.
vi.mock('../../repositories/order-repository.js', () => ({
  createOrderRepository: vi.fn(),
  findOrderById: vi.fn(),
  findOrderByIdAndUserId: vi.fn(),
  findOrdersByUserId: vi.fn(),
  updateOrderStatusRepository: vi.fn(),
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

const findOrderByIdMock = vi.mocked(
  findOrderById,
);

const updateOrderStatusRepositoryMock = vi.mocked(
  updateOrderStatusRepository,
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

describe('updateOrderStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que uma transição válida seja
  // persistida corretamente.
  it('deve atualizar PENDING para PROCESSING', async () => {
    findOrderByIdMock.mockResolvedValue({
      createdAt: new Date(),
      id: 1,
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      totalAmount: 209.7 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    updateOrderStatusRepositoryMock.mockResolvedValue({
      createdAt: new Date(),
      id: 1,
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'PROCESSING',
      totalAmount: 209.7 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    const result = await updateOrderStatus(
      1,
      {
        status: 'PROCESSING',
      },
    );

    expect(
      updateOrderStatusRepositoryMock,
    ).toHaveBeenCalledWith(
      1,
      'PROCESSING',
    );

    expect(result.status).toBe(
      'PROCESSING',
    );
  });

  // Garante que etapas do fluxo não possam
  // ser puladas.
  it('não deve permitir PENDING para SHIPPED', async () => {
    findOrderByIdMock.mockResolvedValue({
      createdAt: new Date(),
      id: 1,
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      totalAmount: 209.7 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    await expect(
      updateOrderStatus(
        1,
        {
          status: 'SHIPPED',
        },
      ),
    ).rejects.toMatchObject({
      message: 'Transição de status inválida.',
      statusCode: 400,
    });

    expect(
      updateOrderStatusRepositoryMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que pedidos finalizados não possam
  // ser cancelados pelo fluxo de status.
  it('não deve permitir DELIVERED para CANCELLED', async () => {
    findOrderByIdMock.mockResolvedValue({
      createdAt: new Date(),
      id: 1,
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PAID',
      status: 'DELIVERED',
      totalAmount: 209.7 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    await expect(
      updateOrderStatus(
        1,
        {
          status: 'CANCELLED',
        },
      ),
    ).rejects.toMatchObject({
      message: 'Transição de status inválida.',
      statusCode: 400,
    });
  });

  // Garante que pedidos inexistentes
  // não possam ser atualizados.
  it('deve retornar 404 quando o pedido não existir', async () => {
    findOrderByIdMock.mockResolvedValue(null);

    await expect(
      updateOrderStatus(
        999,
        {
          status: 'PROCESSING',
        },
      ),
    ).rejects.toMatchObject({
      message: 'Pedido não encontrado.',
      statusCode: 404,
    });

    expect(
      updateOrderStatusRepositoryMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que um pedido em processamento
  // possa avançar para a etapa de envio.
  it('deve atualizar PROCESSING para SHIPPED', async () => {
    findOrderByIdMock.mockResolvedValue({
      createdAt: new Date(),
      id: 1,
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'PROCESSING',
      totalAmount: 209.7 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    updateOrderStatusRepositoryMock.mockResolvedValue({
      createdAt: new Date(),
      id: 1,
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'SHIPPED',
      totalAmount: 209.7 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    const result = await updateOrderStatus(
      1,
      {
        status: 'SHIPPED',
      },
    );

    expect(
      updateOrderStatusRepositoryMock,
    ).toHaveBeenCalledWith(
      1,
      'SHIPPED',
    );

    expect(result.status).toBe('SHIPPED');
  });

  // Garante que um pedido enviado
  // possa avançar para a etapa de entrega.
  it('deve atualizar SHIPPED para DELIVERED', async () => {
    findOrderByIdMock.mockResolvedValue({
      createdAt: new Date(),
      id: 1,
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'SHIPPED',
      totalAmount: 209.7 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    updateOrderStatusRepositoryMock.mockResolvedValue({
      createdAt: new Date(),
      id: 1,
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'DELIVERED',
      totalAmount: 209.7 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    const result = await updateOrderStatus(
      1,
      {
        status: 'DELIVERED',
      },
    );

    expect(
      updateOrderStatusRepositoryMock,
    ).toHaveBeenCalledWith(
      1,
      'DELIVERED',
    );

    expect(result.status).toBe('DELIVERED');
  });

  // Garante que pedidos ainda pendentes
  // possam ser cancelados antes do processamento.
  it('deve atualizar PENDING para CANCELLED', async () => {
    findOrderByIdMock.mockResolvedValue({
      createdAt: new Date(),
      id: 1,
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      totalAmount: 209.7 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    updateOrderStatusRepositoryMock.mockResolvedValue({
      createdAt: new Date(),
      id: 1,
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'CANCELLED',
      totalAmount: 209.7 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    const result = await updateOrderStatus(
      1,
      {
        status: 'CANCELLED',
      },
    );

    expect(
      updateOrderStatusRepositoryMock,
    ).toHaveBeenCalledWith(
      1,
      'CANCELLED',
    );

    expect(result.status).toBe('CANCELLED');
  });
});