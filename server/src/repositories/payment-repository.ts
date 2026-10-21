
import { PaymentStatus } from '../generated/prisma/client.js';
import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../config/prisma.js';

/**
 * Atualiza as informações de pagamento associadas a um pedido.
 *
 * Essa função não decide se uma mudança de status é válida.
 * As regras de negócio ficam no service.
 *
 * Quando uma transação é fornecida, a atualização utiliza
 * o cliente transacional recebido. Caso contrário, utiliza
 * a instância padrão do Prisma.
 */
export async function updateOrderPaymentRepository(
  orderId: number,
  paymentStatus: PaymentStatus,
  transaction?: Prisma.TransactionClient,
) {
  const transactionClient = transaction ?? prisma;

  return transactionClient.order.update({
    where: {
      id: orderId,
    },
    data: {
      paymentStatus,
    },
  });
}

/**
 * Salva os dados externos do pagamento associados ao pedido.
 *
 * O gateway e o identificador externo são informações de
 * integração e não definem, por si só, se o pagamento foi pago.
 *
 * Quando uma transação é fornecida, a atualização utiliza
 * o cliente transacional recebido. Caso contrário, utiliza
 * a instância padrão do Prisma.
 */
export async function updateOrderPaymentDetailsRepository(
  orderId: number,
  paymentGateway: string,
  paymentId: string | null,
  transaction?: Prisma.TransactionClient,
) {
  const transactionClient = transaction ?? prisma;

  return transactionClient.order.update({
    where: {
      id: orderId,
    },
    data: {
      paymentGateway,
      paymentId,
    },
  });
}
