import { PaymentStatus } from '../generated/prisma/client.js';
import { prisma } from '../config/prisma.js';

/**
 * Atualiza as informações de pagamento associadas a um pedido.
 *
 * Essa função não decide se uma mudança de status é válida.
 * As regras de negócio ficam no service.
 */
export async function updateOrderPaymentRepository(
  orderId: number,
  paymentStatus: PaymentStatus,
) {
  return prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      paymentStatus,
    },
  });
}