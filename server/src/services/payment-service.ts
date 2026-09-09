import { PaymentStatus } from '../generated/prisma/client.js';
import { AppError } from '../errors/app-error.js';
import { findOrderById } from '../repositories/order-repository.js';
import { updateOrderPaymentDetailsRepository, updateOrderPaymentRepository } from '../repositories/payment-repository.js';
import type {
  PaymentGateway,
} from './payment/payment-gateway.js';

/**
 * Define quais mudanças de estado são permitidas para um pagamento.
 *
 * A regra fica independente do gateway utilizado. No futuro,
 * Mercado Pago ou outro provedor apenas informará o resultado
 * do pagamento e esta camada aplicará as regras internas.
 */
const PAYMENT_STATUS_TRANSITIONS: Record<
  PaymentStatus,
  PaymentStatus[]
> = {
  PENDING: ['PAID', 'FAILED'],
  PAID: ['REFUNDED'],
  FAILED: ['PENDING'],
  REFUNDED: [],
};

/**
 * Atualiza o estado interno do pagamento de um pedido.
 *
 * Esta função deverá ser chamada futuramente pela integração
 * confiável com o gateway, e não diretamente pelo cliente.
 */
export async function updatePaymentStatus(
  orderId: number,
  newStatus: PaymentStatus,
) {
  const order = await findOrderById(orderId);

  if (!order) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  const allowedTransitions =
    PAYMENT_STATUS_TRANSITIONS[order.paymentStatus];

  // Impede mudanças de estado que não fazem sentido no
  // ciclo de vida do pagamento.
  if (!allowedTransitions.includes(newStatus)) {
    throw new AppError(
      'Transição de status de pagamento inválida.',
      400,
    );
  }

  return updateOrderPaymentRepository(
    orderId,
    newStatus,
  );
}

/**
 * Cria o pagamento de um pedido através do gateway informado.
 *
 * O valor utilizado é sempre o total armazenado no pedido.
 * O cliente não define o valor do pagamento.
 */
export async function createPaymentForOrder(
  orderId: number,
  paymentGateway: PaymentGateway,
  gatewayName: string,
) {
  const order = await findOrderById(
    orderId,
  );

  if (!order) {
    throw new AppError(
      'Pedido não encontrado.',
      404,
    );
  }

  if (
    order.status !== 'PENDING' ||
    order.paymentStatus !== 'PENDING'
  ) {
    throw new AppError(
      'O pedido não está disponível para pagamento.',
      400,
    );
  }

  const payment =
    await paymentGateway.createPayment({
      orderId: order.id,
      amount: Number(order.totalAmount),
    });

  await updateOrderPaymentDetailsRepository(
    order.id,
    gatewayName,
    payment.preferenceId,
  );

  return payment;
}