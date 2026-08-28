import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findOrderById } from '../../repositories/order-repository.js';
import { updateOrderPaymentRepository } from '../../repositories/payment-repository.js';
import { updatePaymentStatus } from '../../services/payment-service.js';

vi.mock('../../repositories/order-repository.js', () => ({
  findOrderById: vi.fn(),
}));

vi.mock('../../repositories/payment-repository.js', () => ({
  updateOrderPaymentRepository: vi.fn(),
}));

const findOrderByIdMock = vi.mocked(findOrderById);
const updateOrderPaymentRepositoryMock = vi.mocked(
  updateOrderPaymentRepository,
);

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
});