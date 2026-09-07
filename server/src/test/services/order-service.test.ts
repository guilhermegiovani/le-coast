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
  createOrderFromCart,
  createUserOrder,
  getUserOrderById,
  listUserOrders,
  updateOrderStatus,
} from '../../services/order-service.js';

import {
  findCartByUserIdRepository,
  clearCartItemsRepository,
} from '../../repositories/cart-repository.js';

import { findActiveProductVariantsByIds } from '../../repositories/product-variant-repository.js';

import { prisma } from '../../config/prisma.js';

// Simula o repository para que os testes do service
// não utilizem o banco real.
vi.mock('../../repositories/order-repository.js', () => ({
  createOrderRepository: vi.fn(),
  findOrderById: vi.fn(),
  findOrderByIdAndUserId: vi.fn(),
  findOrdersByUserId: vi.fn(),
  updateOrderStatusRepository: vi.fn(),
}));

vi.mock('../../repositories/product-variant-repository.js', () => ({
  findActiveProductVariantsByIds: vi.fn(),
}));

vi.mock('../../repositories/cart-repository.js', () => ({
  findCartByUserIdRepository: vi.fn(),
  clearCartItemsRepository: vi.fn(),
}));

vi.mock('../../config/prisma.js', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
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

const findActiveProductVariantsByIdsMock = vi.mocked(
  findActiveProductVariantsByIds,
);

const findCartByUserIdRepositoryMock = vi.mocked(
  findCartByUserIdRepository,
);

const clearCartItemsRepositoryMock = vi.mocked(
  clearCartItemsRepository,
);

const transactionMock = vi.mocked(
  prisma.$transaction,
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
      variantId: 1,
    },
    {
      quantity: 1,
      variantId: 2,
    },
  ],
};

const VALID_PRODUCT_VARIANTS = [
  {
    id: 1,
    product: {
      id: 1,
      categoryId: 1,
      name: 'Top Essential',
      slug: 'top-essential',
      description: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    size: {
      id: 1,
      name: 'M',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    color: {
      id: 1,
      name: 'Preto',
      hexCode: '#000000',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sku: 'TOP-ESS-M-PRETO',
    price: 79.9 as never,
    stock: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    productId: 1,
    sizeId: 1,
    colorId: 1,
  },
  {
    id: 2,
    product: {
      id: 2,
      categoryId: 1,
      name: 'Short Essential',
      slug: 'short-essential',
      description: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    size: {
      id: 1,
      name: 'M',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    color: {
      id: 1,
      name: 'Preto',
      hexCode: '#000000',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    sku: 'SHORT-ESS-M-PRETO',
    price: 49.9 as never,
    stock: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    productId: 2,
    sizeId: 1,
    colorId: 1,
  },
];

const MOCK_CART = {
  id: 1,
  userId: 3,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
};

const MOCK_CART_ITEM = {
  id: 1,
  cartId: 1,
  variantId: 1,
  quantity: 2,
  unitPrice: 79.9 as never,
  createdAt: new Date(),
  updatedAt: new Date(),
  variant: VALID_PRODUCT_VARIANTS[0],
};

describe('createUserOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Disponibiliza variantes válidas para os testes
    // que exercitam a criação de pedidos.
    findActiveProductVariantsByIdsMock.mockImplementation(
      async (variantIds) =>
        VALID_PRODUCT_VARIANTS.filter((variant) =>
          variantIds.includes(variant.id),
        ),
    );
  });

  // Garante que o valor total seja calculado
  // no backend a partir dos itens do pedido.
  it('deve calcular corretamente o valor total do pedido', async () => {

    await createUserOrder(
      3,
      VALID_ORDER_INPUT,
    );

    expect(
      createOrderRepositoryMock,
    ).toHaveBeenCalledWith({
      data: {
        address: VALID_ORDER_INPUT.address,
        items: [
          {
            colorName: 'Preto',
            productName: 'Top Essential',
            quantity: 2,
            sizeName: 'M',
            unitPrice: 79.9,
            variantId: 1,
          },
          {
            colorName: 'Preto',
            productName: 'Short Essential',
            quantity: 1,
            sizeName: 'M',
            unitPrice: 49.9,
            variantId: 2,
          },
        ],
      },
      totalAmount: 209.7,
      userId: 3,
    });
  });

  // Garante que os dados sejam validados e normalizados
  // antes de chegarem à camada de persistência.
  it('deve normalizar os dados antes de criar o pedido', async () => {

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
            colorName: 'Preto',
            productName: 'Top Essential',
            quantity: 2,
            sizeName: 'M',
            unitPrice: 79.9,
            variantId: 1,
          }
        ],
      },
      totalAmount: 159.8,
      userId: 3,
    });
  });

  // Garante que o preço persistido no item do pedido
  // seja obtido diretamente da ProductVariant.
  it('deve utilizar o preço da variante ao criar o pedido', async () => {
    createOrderRepositoryMock.mockResolvedValue({
      address: null,
      createdAt: new Date(),
      id: 1,
      items: [],
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      totalAmount: 79.9 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    await createUserOrder(
      3,
      {
        ...VALID_ORDER_INPUT,
        items: [
          {
            quantity: 1,
            variantId: 1,
          },
        ],
      },
    );

    expect(
      createOrderRepositoryMock,
    ).toHaveBeenCalledWith({
      data: {
        address: VALID_ORDER_INPUT.address,
        items: [
          {
            colorName: 'Preto',
            productName: 'Top Essential',
            quantity: 1,
            sizeName: 'M',
            unitPrice: 79.9,
            variantId: 1,
          },
        ],
      },
      totalAmount: 79.9,
      userId: 3,
    });
  });

  // Garante que o pedido seja rejeitado quando
  // a quantidade solicitada ultrapassar o estoque disponível.
  it('não deve criar pedido com estoque insuficiente', async () => {
    await expect(
      createUserOrder(
        3,
        {
          ...VALID_ORDER_INPUT,
          items: [
            {
              quantity: 11,
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

  // Garante que o pedido seja rejeitado quando
  // uma variante informada não existir ou não estiver disponível.
  it('não deve criar pedido com variante inexistente', async () => {
    await expect(
      createUserOrder(
        3,
        {
          ...VALID_ORDER_INPUT,
          items: [
            {
              quantity: 1,
              variantId: 999,
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

describe('createOrderFromCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    transactionMock.mockImplementation(
      async (callback) => {
        const transactionClient = {};

        return callback(
          transactionClient as never,
        );
      },
    );

    findCartByUserIdRepositoryMock.mockResolvedValue({
      ...MOCK_CART,
      items: [
        MOCK_CART_ITEM,
      ],
    } as never);

    findActiveProductVariantsByIdsMock.mockImplementation(
      async (variantIds) =>
        VALID_PRODUCT_VARIANTS.filter((variant) =>
          variantIds.includes(variant.id),
        ),
    );

    createOrderRepositoryMock.mockResolvedValue(
      {} as never,
    );
  });

  // Garante que os itens do carrinho sejam transformados
  // em itens do pedido utilizando o preço atual da variante.
  it('deve criar um pedido a partir do carrinho', async () => {
    await createOrderFromCart(
      3,
      VALID_ORDER_INPUT.address,
    );

    expect(
      findCartByUserIdRepositoryMock,
    ).toHaveBeenCalledWith(3);

    expect(
      createOrderRepositoryMock,
    ).toHaveBeenCalledWith({
      userId: 3,
      data: {
        address: VALID_ORDER_INPUT.address,
        items: [
          {
            colorName: 'Preto',
            productName: 'Top Essential',
            quantity: 2,
            sizeName: 'M',
            unitPrice: 79.9,
            variantId: 1,
          },
        ],
      },
      totalAmount: 159.8,
      transaction: expect.anything(),
    });

    expect(
      clearCartItemsRepositoryMock,
    ).toHaveBeenCalledWith(
      1,
      expect.anything(),
    );
  });

  // Garante que um usuário sem carrinho não possa
  // iniciar o checkout.
  it('não deve criar pedido sem carrinho', async () => {
    findCartByUserIdRepositoryMock.mockResolvedValue(
      null,
    );

    await expect(
      createOrderFromCart(
        3,
        VALID_ORDER_INPUT.address,
      ),
    ).rejects.toMatchObject({
      message: 'Carrinho não encontrado.',
      statusCode: 404,
    });

    expect(
      createOrderRepositoryMock,
    ).not.toHaveBeenCalled();

    expect(
      clearCartItemsRepositoryMock,
    ).not.toHaveBeenCalled();

    expect(
      transactionMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que um carrinho vazio não possa
  // gerar um pedido.
  it('não deve criar pedido com carrinho vazio', async () => {
    findCartByUserIdRepositoryMock.mockResolvedValue({
      ...MOCK_CART,
      items: [],
    } as never);

    await expect(
      createOrderFromCart(
        3,
        VALID_ORDER_INPUT.address,
      ),
    ).rejects.toMatchObject({
      message: 'O carrinho está vazio.',
      statusCode: 400,
    });

    expect(
      createOrderRepositoryMock,
    ).not.toHaveBeenCalled();

    expect(
      clearCartItemsRepositoryMock,
    ).not.toHaveBeenCalled();

    expect(
      transactionMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que o carrinho não seja limpo quando
  // a criação do pedido falhar dentro da transação.
  it('não deve limpar o carrinho quando a criação do pedido falhar', async () => {
    createOrderRepositoryMock.mockRejectedValue(
      new Error('Erro ao criar pedido.'),
    );

    await expect(
      createOrderFromCart(
        3,
        VALID_ORDER_INPUT.address,
      ),
    ).rejects.toThrow(
      'Erro ao criar pedido.',
    );

    expect(
      clearCartItemsRepositoryMock,
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
      paymentStatus: 'PAID',
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

  it('não deve processar um pedido com pagamento pendente', async () => {
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
      updateOrderStatus(1, {
        status: 'PROCESSING',
      }),
    ).rejects.toMatchObject({
      message:
        'O pedido só pode ser processado após a confirmação do pagamento.',
      statusCode: 400,
    });

    // Como o pagamento não foi confirmado,
    // nenhuma atualização deve chegar ao banco.
    expect(
      updateOrderStatusRepositoryMock,
    ).not.toHaveBeenCalled();
  });
});