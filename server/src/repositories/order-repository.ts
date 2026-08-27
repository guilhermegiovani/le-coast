import type { CreateOrderInput } from '../validators/order-validator.js';
import type { OrderStatus } from '../generated/prisma/client.js';
import { prisma } from '../config/prisma.js';

type CreateOrderRepositoryInput = {
  userId: number;
  data: CreateOrderInput;
  totalAmount: number;
};

// Cria o pedido, o snapshot do endereço e seus itens
// dentro da mesma operação transacional.
//
// Caso qualquer etapa falhe, o Prisma desfaz toda
// a criação e evita pedidos parcialmente persistidos.
export async function createOrderRepository({
  userId,
  data,
  totalAmount,
}: CreateOrderRepositoryInput) {
  return prisma.$transaction(async (transaction) => {
    // Cria primeiro o registro principal do pedido.
    const order = await transaction.order.create({
      data: {
        totalAmount,
        userId,
      },
    });

    // Copia o endereço utilizado na compra.
    //
    // Esse snapshot não depende mais do Address original,
    // preservando o histórico do pedido.
    await transaction.orderAddress.create({
      data: {
        city: data.address.city,

        // Campos opcionais só são enviados ao Prisma
        // quando realmente possuem um valor.
        ...(data.address.complement !== undefined && {
          complement: data.address.complement,
        }),

        country: data.address.country,
        name: data.address.name,
        neighborhood: data.address.neighborhood,
        number: data.address.number,
        orderId: order.id,
        state: data.address.state,
        street: data.address.street,
        zipCode: data.address.zipCode,
      },
    });

    // Cria todos os itens pertencentes ao pedido.
    await transaction.orderItem.createMany({
      data: data.items.map((item) => ({
        orderId: order.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        variantId: item.variantId,
      })),
    });

    // Retorna o pedido completo já com o endereço
    // e os itens persistidos pela transação.
    return transaction.order.findUniqueOrThrow({
      where: {
        id: order.id,
      },
      include: {
        address: true,
        items: true,
      },
    });
  });
}

// Busca todos os pedidos pertencentes
// ao usuário autenticado.
//
// O endereço e os itens são incluídos porque fazem
// parte do histórico necessário para exibir o pedido.
export async function findOrdersByUserId(
  userId: number,
) {
  return prisma.order.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      address: true,
      items: true,
    },
  });
}

// Busca um pedido específico pertencente
// ao usuário autenticado.
//
// O userId faz parte da consulta para impedir que
// um usuário acesse pedidos pertencentes a outra conta.
export async function findOrderByIdAndUserId(
  orderId: number,
  userId: number,
) {
  return prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      address: true,
      items: true,
    },
  });
}

// Busca um pedido pelo seu identificador.
export async function findOrderById(
  orderId: number,
) {
  return prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });
}

// Atualiza o status de um pedido específico.
export async function updateOrderStatusRepository(
  orderId: number,
  status: OrderStatus,
) {
  return prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status,
    },
  });
}