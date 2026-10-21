
import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../config/prisma.js';
import { PaymentStatus } from '../generated/prisma/client.js';
import { AppError } from '../errors/app-error.js';
import { findOrderById } from '../repositories/order-repository.js';
import {
  updateOrderPaymentDetailsRepository,
  updateOrderPaymentRepository,
} from '../repositories/payment-repository.js';
import { updateOrderStatus } from './order-service.js';
import type { PaymentGateway } from './payment/payment-gateway.js';

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
 * Aceita uma transação opcional para que a atualização do pagamento
 * possa participar de uma transação maior, coordenada pelo serviço.
 */
export async function updatePaymentStatus(
  orderId: number,
  newStatus: PaymentStatus,
  transaction?: Prisma.TransactionClient,
) {
  // Usa a transação existente quando fornecida.
  // Sem transação, mantém o comportamento anterior.
  const order = transaction
    ? await findOrderById(orderId, transaction)
    : await findOrderById(orderId);

  if (!order) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  // Uma notificação repetida com o mesmo status não precisa atualizar
  // novamente o pagamento.
  if (order.paymentStatus === newStatus) {
    return order;
  }

  const allowedTransitions = PAYMENT_STATUS_TRANSITIONS[order.paymentStatus];

  // Impede mudanças de estado que não são permitidas.
  if (!allowedTransitions.includes(newStatus)) {
    throw new AppError(
      'Transição de status de pagamento inválida.',
      400,
    );
  }

  // Mantém a atualização dentro da transação, quando existente.
  return transaction
    ? updateOrderPaymentRepository(
      orderId,
      newStatus,
      transaction,
    )
    : updateOrderPaymentRepository(orderId, newStatus);
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
  const order = await findOrderById(orderId);

  if (!order) {
    throw new AppError('Pedido não encontrado.', 404);
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

  const payment = await paymentGateway.createPayment({
    orderId: order.id,
    amount: Number(order.totalAmount),
  });

  await updateOrderPaymentDetailsRepository(
    order.id,
    gatewayName,
    null,
  );

  return payment;
}

/**
 * Processa o resultado de um pagamento retornado pelo gateway.
 *
 * A referência externa identifica o pedido e o status retornado
 * pelo gateway passa pela validação de transição do pagamento.
 *
 * Quando o pagamento é aprovado, um pedido ainda PENDING avança
 * automaticamente para PROCESSING através do service de pedidos,
 * que preserva as regras de transição e a validação do pagamento.
 */
export async function processPaymentWebhook(
  externalId: string,
  paymentGateway: PaymentGateway,
) {
  // Consulta o gateway antes da transação para não manter
  // uma transação de banco aberta durante uma chamada de rede.
  const payment = await paymentGateway.getPayment(externalId);

  if (!externalId || payment.externalId !== externalId) {
    throw new AppError(
      'Identificador do pagamento inválido.',
      400,
    );
  }

  const orderId = Number(payment.externalReference);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    throw new AppError(
      'Referência externa do pagamento inválida.',
      400,
    );
  }

  // Valida os dados antes de iniciar as alterações no banco.
  const order = await findOrderById(orderId);

  if (!order) {
    throw new AppError('Pedido não encontrado.', 404);
  }

  if (payment.currency !== 'BRL') {
    throw new AppError('Moeda do pagamento inválida.', 400);
  }

  if (
    !Number.isFinite(payment.amount) ||
    payment.amount <= 0 ||
    Math.round(payment.amount * 100) !==
    Math.round(Number(order.totalAmount) * 100)
  ) {
    throw new AppError(
      'Valor do pagamento não corresponde ao pedido.',
      400,
    );
  }

  // Mantém as alterações locais na mesma transação.
  return prisma.$transaction(async (transaction) => {
    await updatePaymentStatus(
      orderId,
      payment.status,
      transaction,
    );

    await updateOrderPaymentDetailsRepository(
      orderId,
      'MERCADO_PAGO',
      payment.externalId,
      transaction,
    );

    // Consulta novamente dentro da transação para avaliar
    // o estado atual do pedido antes da transição.
    const currentOrder = await findOrderById(
      orderId,
      transaction,
    );

    if (!currentOrder) {
      throw new AppError('Pedido não encontrado.', 404);
    }

    if (
      payment.status === 'PAID' &&
      currentOrder.status === 'PENDING'
    ) {
      return updateOrderStatus(
        orderId,
        { status: 'PROCESSING' },
        transaction,
      );
    }

    return currentOrder;
  });
}

