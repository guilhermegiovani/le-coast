import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findOrderById } from '../../repositories/order-repository.js';
import {
  updateOrderPaymentDetailsRepository,
  updateOrderPaymentRepository,
} from '../../repositories/payment-repository.js';

import {
  createPaymentForOrder,
  updatePaymentStatus,
  processPaymentWebhook,
} from '../../services/payment-service.js';

import { updateOrderStatus } from '../../services/order-service.js';

import type { PaymentGateway } from '../../services/payment/payment-gateway.js';

import {
  OrderStatus,
  PaymentStatus,
} from '../../generated/prisma/client.js';

// Cria um objeto compartilhado para representar a transação falsa.
// vi.hoisted permite disponibilizá-lo antes da execução dos mocks.
const { transactionMock } = vi.hoisted(() => ({
  transactionMock: {},
}));

// Simula a transação do Prisma sem acessar o banco de dados real.
// O callback é executado normalmente com o objeto falso da transação.
vi.mock('../../config/prisma.js', () => ({
  prisma: {
    $transaction: vi.fn(
      async (callback: (transaction: object) => unknown) =>
        callback(transactionMock),
    ),
  },
}));

vi.mock('../../repositories/order-repository.js', () => ({
  findOrderById: vi.fn(),
}));

vi.mock('../../repositories/payment-repository.js', () => ({
  updateOrderPaymentDetailsRepository: vi.fn(),
  updateOrderPaymentRepository: vi.fn(),
}));

// Isola o serviço de pedidos para verificar a transição automática
// sem executar operações reais no banco de dados.
vi.mock('../../services/order-service.js', () => ({
  updateOrderStatus: vi.fn(),
}));

const findOrderByIdMock = vi.mocked(findOrderById);

const updateOrderPaymentRepositoryMock = vi.mocked(
  updateOrderPaymentRepository,
);

const updateOrderPaymentDetailsRepositoryMock = vi.mocked(
  updateOrderPaymentDetailsRepository,
);

const updateOrderStatusMock = vi.mocked(updateOrderStatus);

const createPaymentMock = vi.fn();
const getPaymentMock = vi.fn();

const paymentGatewayMock: PaymentGateway = {
  createPayment: createPaymentMock,
  getPayment: getPaymentMock,
};

describe('updatePaymentStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve atualizar PENDING para PAID', async () => {
    findOrderByIdMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentGateway: null,
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });

    updateOrderPaymentRepositoryMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'PENDING',
      paymentStatus: 'PAID',
      paymentGateway: null,
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updatePaymentStatus(1, 'PAID');

    expect(
      updateOrderPaymentRepositoryMock,
    ).toHaveBeenCalledWith(1, 'PAID');

    expect(result.paymentStatus).toBe('PAID');
  });

  it('deve atualizar PENDING para FAILED', async () => {
    findOrderByIdMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentGateway: null,
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });

    updateOrderPaymentRepositoryMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'PENDING',
      paymentStatus: 'FAILED',
      paymentGateway: null,
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updatePaymentStatus(1, 'FAILED');

    expect(
      updateOrderPaymentRepositoryMock,
    ).toHaveBeenCalledWith(1, 'FAILED');

    expect(result.paymentStatus).toBe('FAILED');
  });

  it('deve permitir uma nova tentativa após FAILED', async () => {
    findOrderByIdMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'PENDING',
      paymentStatus: 'FAILED',
      paymentGateway: null,
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });

    updateOrderPaymentRepositoryMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentGateway: null,
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updatePaymentStatus(1, 'PENDING');

    expect(
      updateOrderPaymentRepositoryMock,
    ).toHaveBeenCalledWith(1, 'PENDING');

    expect(result.paymentStatus).toBe('PENDING');
  });

  it('deve atualizar PAID para REFUNDED', async () => {
    findOrderByIdMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'CANCELLED',
      paymentStatus: 'PAID',
      paymentGateway: null,
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });

    updateOrderPaymentRepositoryMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED',
      paymentGateway: null,
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await updatePaymentStatus(1, 'REFUNDED');

    expect(
      updateOrderPaymentRepositoryMock,
    ).toHaveBeenCalledWith(1, 'REFUNDED');

    expect(result.paymentStatus).toBe('REFUNDED');
  });

  it('não deve permitir uma transição de pagamento inválida', async () => {
    findOrderByIdMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentGateway: null,
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });

    await expect(
      updatePaymentStatus(1, 'REFUNDED'),
    ).rejects.toMatchObject({
      message: 'Transição de status de pagamento inválida.',
      statusCode: 400,
    });

    // Uma transição inválida não pode chegar ao banco.
    expect(
      updateOrderPaymentRepositoryMock,
    ).not.toHaveBeenCalled();
  });

  it('deve retornar erro quando o pedido não existir', async () => {
    findOrderByIdMock.mockResolvedValue(null);

    await expect(
      updatePaymentStatus(999, 'PAID'),
    ).rejects.toMatchObject({
      message: 'Pedido não encontrado.',
      statusCode: 404,
    });

    expect(
      updateOrderPaymentRepositoryMock,
    ).not.toHaveBeenCalled();
  });

  it('deve ignorar uma atualização quando o pagamento já estiver no mesmo status', async () => {
    const order = {
      id: 1,
      userId: 3,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PAID,
      paymentGateway: 'MERCADO_PAGO',
      paymentId: '987654',
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    };

    findOrderByIdMock.mockResolvedValue(order);

    const result = await updatePaymentStatus(1, 'PAID');

    expect(result).toBe(order);

    expect(
      updateOrderPaymentRepositoryMock,
    ).not.toHaveBeenCalled();
  });
});

describe('createPaymentForOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar o pagamento utilizando o total do pedido', async () => {
    findOrderByIdMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentGateway: null,
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });

    createPaymentMock.mockResolvedValue({
      preferenceId: 'PREF-123',
      checkoutUrl: 'https://www.mercadopago.com.br/checkout/PREF-123',
    });

    updateOrderPaymentDetailsRepositoryMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentGateway: 'MERCADO_PAGO',
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await createPaymentForOrder(
      1,
      paymentGatewayMock,
      'MERCADO_PAGO',
    );

    expect(createPaymentMock).toHaveBeenCalledWith({
      orderId: 1,
      amount: 209.7,
    });

    expect(
      updateOrderPaymentDetailsRepositoryMock,
    ).toHaveBeenCalledWith(
      1,
      'MERCADO_PAGO',
      null,
    );

    expect(result).toEqual({
      preferenceId: 'PREF-123',
      checkoutUrl: 'https://www.mercadopago.com.br/checkout/PREF-123',
    });
  });

  it('deve retornar erro quando o pedido não existir', async () => {
    findOrderByIdMock.mockResolvedValue(null);

    await expect(
      createPaymentForOrder(
        999,
        paymentGatewayMock,
        'MERCADO_PAGO',
      ),
    ).rejects.toMatchObject({
      message: 'Pedido não encontrado.',
      statusCode: 404,
    });

    expect(createPaymentMock).not.toHaveBeenCalled();

    expect(
      updateOrderPaymentDetailsRepositoryMock,
    ).not.toHaveBeenCalled();
  });

  it('não deve criar pagamento para pedido indisponível', async () => {
    findOrderByIdMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'PROCESSING',
      paymentStatus: 'PENDING',
      paymentGateway: null,
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    });

    await expect(
      createPaymentForOrder(
        1,
        paymentGatewayMock,
        'MERCADO_PAGO',
      ),
    ).rejects.toMatchObject({
      message: 'O pedido não está disponível para pagamento.',
      statusCode: 400,
    });

    expect(createPaymentMock).not.toHaveBeenCalled();

    expect(
      updateOrderPaymentDetailsRepositoryMock,
    ).not.toHaveBeenCalled();
  });
});

describe('processPaymentWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve atualizar o pagamento e avançar o pedido para PROCESSING após a aprovação', async () => {
    const pendingOrder = {
      id: 1,
      userId: 3,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentGateway: 'MERCADO_PAGO',
      paymentId: null,
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    };

    const paidOrder = {
      ...pendingOrder,
      paymentStatus: PaymentStatus.PAID,
    };

    const processingOrder = {
      ...paidOrder,
      status: OrderStatus.PROCESSING,
      paymentId: '987654',
    };

    // A primeira consulta valida o pedido antes da transação.
    // As consultas seguintes acontecem dentro da transação.
    findOrderByIdMock
      .mockResolvedValueOnce(pendingOrder)
      .mockResolvedValueOnce(pendingOrder)
      .mockResolvedValueOnce(paidOrder);

    getPaymentMock.mockResolvedValue({
      externalId: '987654',
      externalReference: '1',
      status: 'PAID',
      amount: 209.7,
      currency: 'BRL',
    });

    updateOrderPaymentRepositoryMock.mockResolvedValue(paidOrder);
    updateOrderStatusMock.mockResolvedValue(processingOrder as never);

    const result = await processPaymentWebhook(
      '987654',
      paymentGatewayMock,
    );

    expect(getPaymentMock).toHaveBeenCalledWith('987654');

    expect(
      updateOrderPaymentRepositoryMock,
    ).toHaveBeenCalledWith(1, 'PAID', transactionMock);

    expect(
      updateOrderPaymentDetailsRepositoryMock,
    ).toHaveBeenCalledWith(
      1,
      'MERCADO_PAGO',
      '987654',
      transactionMock,
    );

    // A mudança de status usa a mesma transação das atualizações do pagamento.
    expect(updateOrderStatusMock).toHaveBeenCalledWith(
      1,
      { status: 'PROCESSING' },
      transactionMock,
    );

    expect(result.status).toBe('PROCESSING');
    expect(result.paymentStatus).toBe('PAID');
  });

  it('não deve repetir a transição quando o webhook chegar novamente para um pedido em processamento', async () => {
    const processingOrder = {
      id: 1,
      userId: 3,
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.PAID,
      paymentGateway: 'MERCADO_PAGO',
      paymentId: '987654',
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    };

    findOrderByIdMock.mockResolvedValue(processingOrder);

    getPaymentMock.mockResolvedValue({
      externalId: '987654',
      externalReference: '1',
      status: 'PAID',
      amount: 209.7,
      currency: 'BRL',
    });

    const result = await processPaymentWebhook(
      '987654',
      paymentGatewayMock,
    );

    expect(getPaymentMock).toHaveBeenCalledWith('987654');

    // O pagamento já está PAID, então não é atualizado novamente.
    expect(
      updateOrderPaymentRepositoryMock,
    ).not.toHaveBeenCalled();

    // O pedido já está PROCESSING, portanto não deve avançar novamente.
    expect(updateOrderStatusMock).not.toHaveBeenCalled();

    expect(result.status).toBe('PROCESSING');
    expect(result.paymentStatus).toBe('PAID');
  });

  it('deve avançar para PROCESSING se o pagamento já estiver PAID mas o pedido ainda estiver PENDING', async () => {
    const pendingPaidOrder = {
      id: 1,
      userId: 3,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PAID,
      paymentGateway: 'MERCADO_PAGO',
      paymentId: '987654',
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    };

    const processingOrder = {
      ...pendingPaidOrder,
      status: OrderStatus.PROCESSING,
    };

    findOrderByIdMock.mockResolvedValue(pendingPaidOrder);

    getPaymentMock.mockResolvedValue({
      externalId: '987654',
      externalReference: '1',
      status: 'PAID',
      amount: 209.7,
      currency: 'BRL',
    });

    updateOrderStatusMock.mockResolvedValue(processingOrder as never);

    const result = await processPaymentWebhook(
      '987654',
      paymentGatewayMock,
    );

    // Não atualiza o pagamento novamente, mas recupera a transição
    // caso uma execução anterior tenha deixado o pedido em PENDING.
    expect(
      updateOrderPaymentRepositoryMock,
    ).not.toHaveBeenCalled();

    expect(updateOrderStatusMock).toHaveBeenCalledWith(
      1,
      { status: 'PROCESSING' },
      transactionMock,
    );

    expect(result.status).toBe('PROCESSING');
  });

  it('não deve processar uma referência externa inválida', async () => {
    getPaymentMock.mockResolvedValue({
      externalId: '987654',
      externalReference: 'abc',
      status: 'PAID',
      amount: 209.7,
      currency: 'BRL',
    });

    await expect(
      processPaymentWebhook(
        '987654',
        paymentGatewayMock,
      ),
    ).rejects.toMatchObject({
      message: 'Referência externa do pagamento inválida.',
      statusCode: 400,
    });

    expect(
      updateOrderPaymentRepositoryMock,
    ).not.toHaveBeenCalled();

    expect(updateOrderStatusMock).not.toHaveBeenCalled();
  });
});