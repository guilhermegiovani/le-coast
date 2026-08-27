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

import {
  createUserOrder,
  getUserOrderById,
  listUserOrders,
  updateOrderStatus,
} from '../../services/order-service.js';

// Simula o service para que os testes HTTP
// não acessem o banco real.
vi.mock('../../services/order-service.js', () => ({
  createUserOrder: vi.fn(),
  getUserOrderById: vi.fn(),
  listUserOrders: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

const createUserOrderMock = vi.mocked(
  createUserOrder,
);

const listUserOrdersMock = vi.mocked(
  listUserOrders,
);

const getUserOrderByIdMock = vi.mocked(
  getUserOrderById,
);

const updateOrderStatusMock = vi.mocked(
  updateOrderStatus,
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
  ],
};

describe('POST /orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que apenas usuários autenticados
  // consigam criar novos pedidos.
  it('deve retornar 401 quando o token não for informado', async () => {
    await request(app)
      .post('/orders')
      .send(VALID_ORDER_INPUT)
      .expect(401);

    expect(
      createUserOrderMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que um usuário autenticado consiga
  // criar um pedido com dados válidos.
  it('deve criar um pedido para o usuário autenticado', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    createUserOrderMock.mockResolvedValue({
      address: {
        city: 'Ribeirão Preto',
        complement: 'Apto 12',
        country: 'BR',
        createdAt: new Date(),
        id: 1,
        name: 'Casa',
        neighborhood: 'Centro',
        number: '100',
        orderId: 1,
        state: 'SP',
        street: 'Rua Exemplo',
        zipCode: '14000-000',
      },
      createdAt: new Date(),
      id: 1,
      items: [
        {
          createdAt: new Date(),
          id: 1,
          orderId: 1,
          quantity: 2,
          unitPrice: 79.9 as never,
          variantId: 1,
        },
      ],
      paymentGateway: null,
      paymentId: null,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      totalAmount: 159.8 as never,
      updatedAt: new Date(),
      userId: 3,
    });

    const response = await request(app)
      .post('/orders')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .send(VALID_ORDER_INPUT)
      .expect(201);

    expect(
      createUserOrderMock,
    ).toHaveBeenCalledWith(
      3,
      VALID_ORDER_INPUT,
    );

    expect(response.body).toMatchObject({
      id: 1,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      userId: 3,
    });
  });

  // Garante que o usuário do pedido seja obtido
  // exclusivamente através do token autenticado.
  it('deve ignorar userId enviado no body', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    createUserOrderMock.mockResolvedValue({
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

    await request(app)
      .post('/orders')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .send({
        ...VALID_ORDER_INPUT,
        userId: 999,
      })
      .expect(201);

    expect(
      createUserOrderMock,
    ).toHaveBeenCalledWith(
      3,
      expect.objectContaining({
        address: VALID_ORDER_INPUT.address,
        items: VALID_ORDER_INPUT.items,
      }),
    );
  });
});

describe('GET /orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que a listagem de pedidos seja
  // protegida por autenticação.
  it('deve retornar 401 quando o token não for informado', async () => {
    await request(app)
      .get('/orders')
      .expect(401);

    expect(
      listUserOrdersMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que o usuário autenticado receba
  // somente a listagem associada ao seu id.
  it('deve listar os pedidos do usuário autenticado', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    listUserOrdersMock.mockResolvedValue([
      {
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
      },
    ]);

    const response = await request(app)
      .get('/orders')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(200);

    // O id utilizado na consulta deve vir
    // exclusivamente do JWT autenticado.
    expect(
      listUserOrdersMock,
    ).toHaveBeenCalledWith(3);

    expect(response.body).toHaveLength(1);

    expect(response.body[0]).toMatchObject({
      id: 1,
      paymentStatus: 'PENDING',
      status: 'PENDING',
      userId: 3,
    });
  });

  // Garante que não possuir pedidos seja tratado
  // como uma lista vazia, e não como erro.
  it('deve retornar uma lista vazia quando o usuário não possuir pedidos', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    listUserOrdersMock.mockResolvedValue([]);

    const response = await request(app)
      .get('/orders')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(200);

    expect(response.body).toEqual([]);
  });
});

describe('GET /orders/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que o detalhe de um pedido
  // não possa ser acessado sem autenticação.
  it('deve retornar 401 quando o token não for informado', async () => {
    await request(app)
      .get('/orders/1')
      .expect(401);

    expect(
      getUserOrderByIdMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que o pedido seja buscado utilizando
  // o usuário autenticado e o id informado na URL.
  it('deve retornar o pedido do usuário autenticado', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    getUserOrderByIdMock.mockResolvedValue({
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

    const response = await request(app)
      .get('/orders/1')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(200);

    expect(
      getUserOrderByIdMock,
    ).toHaveBeenCalledWith(
      3,
      1,
    );

    expect(response.body).toMatchObject({
      id: 1,
      userId: 3,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    });
  });

  // Garante que ids inválidos sejam rejeitados
  // antes de qualquer consulta ao service.
  it('deve retornar 400 quando o id do pedido for inválido', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    await request(app)
      .get('/orders/abc')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(400);

    expect(
      getUserOrderByIdMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que pedidos inexistentes ou pertencentes
  // a outro usuário não tenham seus dados expostos.
  it('deve retornar 404 quando o pedido não for encontrado', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    getUserOrderByIdMock.mockResolvedValue(null);

    const response = await request(app)
      .get('/orders/999')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(404);

    expect(
      getUserOrderByIdMock,
    ).toHaveBeenCalledWith(
      3,
      999,
    );

    expect(response.body).toEqual({
      message: 'Pedido não encontrado.',
    });
  });
});

describe('PATCH /orders/:id/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que a atualização de status
  // não possa ser acessada sem autenticação.
  it('deve retornar 401 quando o token não for informado', async () => {
    await request(app)
      .patch('/orders/1/status')
      .send({
        status: 'PROCESSING',
      })
      .expect(401);

    expect(
      updateOrderStatusMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que clientes comuns não possam
  // alterar o fluxo operacional dos pedidos.
  it('deve retornar 403 quando o usuário não for ADMIN', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    await request(app)
      .patch('/orders/1/status')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .send({
        status: 'PROCESSING',
      })
      .expect(403);

    expect(
      updateOrderStatusMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que um administrador possa
  // atualizar o status de um pedido.
  it('deve permitir que ADMIN atualize o status do pedido', async () => {
    const accessToken = generateAccessToken({
      id: 1,
      role: 'ADMIN',
    });

    updateOrderStatusMock.mockResolvedValue({
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

    const response = await request(app)
      .patch('/orders/1/status')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .send({
        status: 'PROCESSING',
      })
      .expect(200);

    expect(
      updateOrderStatusMock,
    ).toHaveBeenCalledWith(
      1,
      {
        status: 'PROCESSING',
      },
    );

    expect(response.body).toMatchObject({
      id: 1,
      status: 'PROCESSING',
      userId: 3,
    });
  });

  // Garante que identificadores inválidos sejam
  // rejeitados antes de chegar ao service.
  it('deve retornar 400 quando o id do pedido for inválido', async () => {
    const accessToken = generateAccessToken({
      id: 1,
      role: 'ADMIN',
    });

    await request(app)
      .patch('/orders/abc/status')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .send({
        status: 'PROCESSING',
      })
      .expect(400);

    expect(
      updateOrderStatusMock,
    ).not.toHaveBeenCalled();
  });
});