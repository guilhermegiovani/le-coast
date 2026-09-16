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

import type { PaymentGateway } from '../../services/payment/payment-gateway.js';

import {
  OrderStatus,
  PaymentStatus,
} from '../../generated/prisma/client.js';

vi.mock('../../repositories/order-repository.js', () => ({
  findOrderById: vi.fn(),
}));

vi.mock('../../repositories/payment-repository.js', () => ({
  updateOrderPaymentDetailsRepository: vi.fn(),
  updateOrderPaymentRepository: vi.fn(),
}));

const findOrderByIdMock = vi.mocked(findOrderById);

const updateOrderPaymentRepositoryMock = vi.mocked(
  updateOrderPaymentRepository,
);

const updateOrderPaymentDetailsRepositoryMock = vi.mocked(
  updateOrderPaymentDetailsRepository,
);

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

    const result = await updatePaymentStatus(
      1,
      'REFUNDED',
    );

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
    });

    await expect(
      updatePaymentStatus(1, 'REFUNDED'),
    ).rejects.toMatchObject({
      message:
        'Transição de status de pagamento inválida.',
      statusCode: 400,
    });

    // Uma transição inválida deve ser interrompida no service
    // antes que qualquer alteração chegue ao banco.
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

    // Sem um pedido válido, nenhuma atualização de pagamento
    // deve ser executada no banco.
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
    };

    findOrderByIdMock.mockResolvedValue(
      order,
    );

    const result = await updatePaymentStatus(
      1,
      'PAID',
    );

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
    });

    createPaymentMock.mockResolvedValue({
      preferenceId: 'PREF-123',
      checkoutUrl:
        'https://www.mercadopago.com.br/checkout/PREF-123',
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

    expect(
      createPaymentMock,
    ).toHaveBeenCalledWith({
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
      checkoutUrl:
        'https://www.mercadopago.com.br/checkout/PREF-123',
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

    expect(
      createPaymentMock,
    ).not.toHaveBeenCalled();

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
    });

    await expect(
      createPaymentForOrder(
        1,
        paymentGatewayMock,
        'MERCADO_PAGO',
      ),
    ).rejects.toMatchObject({
      message:
        'O pedido não está disponível para pagamento.',
      statusCode: 400,
    });

    expect(
      createPaymentMock,
    ).not.toHaveBeenCalled();

    expect(
      updateOrderPaymentDetailsRepositoryMock,
    ).not.toHaveBeenCalled();
  });
});

describe('processPaymentWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve atualizar o pagamento do pedido retornado pelo gateway', async () => {
    findOrderByIdMock.mockResolvedValue({
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

    getPaymentMock.mockResolvedValue({
      externalId: '987654',
      externalReference: '1',
      status: 'PAID',
    });

    updateOrderPaymentRepositoryMock.mockResolvedValue({
      id: 1,
      userId: 3,
      status: 'PENDING',
      paymentStatus: 'PAID',
      paymentGateway: 'MERCADO_PAGO',
      paymentId: '987654',
      totalAmount: 209.7 as never,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await processPaymentWebhook(
      '987654',
      paymentGatewayMock,
    );

    expect(
      getPaymentMock,
    ).toHaveBeenCalledWith('987654');

    expect(
      updateOrderPaymentRepositoryMock,
    ).toHaveBeenCalledWith(1, 'PAID');

    expect(
      updateOrderPaymentDetailsRepositoryMock,
    ).toHaveBeenCalledWith(
      1,
      'MERCADO_PAGO',
      '987654',
    );

    expect(result.paymentStatus).toBe('PAID');
  });

  it('não deve processar uma referência externa inválida', async () => {
    getPaymentMock.mockResolvedValue({
      externalId: '987654',
      externalReference: 'abc',
      status: 'PAID',
    });

    await expect(
      processPaymentWebhook(
        '987654',
        paymentGatewayMock,
      ),
    ).rejects.toMatchObject({
      message:
        'Referência externa do pagamento inválida.',
      statusCode: 400,
    });

    expect(
      updateOrderPaymentRepositoryMock,
    ).not.toHaveBeenCalled();
  });
});