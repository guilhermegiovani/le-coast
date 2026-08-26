import {
    createOrderRepository,
    findOrderByIdAndUserId,
    findOrdersByUserId,
} from '../repositories/order-repository.js';

import {
    createOrderSchema,
    type CreateOrderInput,
} from '../validators/order-validator.js';

// Cria um novo pedido para o usuário autenticado.
//
// O Zod valida e normaliza os dados recebidos.
// O service fica responsável por aplicar regras de negócio,
// como o cálculo do valor total do pedido.
export async function createUserOrder(
    userId: number,
    data: CreateOrderInput,
) {
    const input = createOrderSchema.parse(data);

    // Calcula o valor total do pedido e normaliza
    // o resultado para duas casas decimais.
    //
    // Isso evita imprecisões de ponto flutuante do JavaScript,
    // como 209.70000000000002 em cálculos monetários.
    const totalAmount = Number(
        input.items
            .reduce(
                (total, item) =>
                    total + item.unitPrice * item.quantity,
                0,
            )
            .toFixed(2),
    );

    return createOrderRepository({
        data: input,
        totalAmount,
        userId,
    });
}

// Lista os pedidos pertencentes
// ao usuário autenticado.
export async function listUserOrders(
    userId: number,
) {
    return findOrdersByUserId(userId);
}

// Busca um pedido específico pertencente
// ao usuário autenticado.
export async function getUserOrderById(
  userId: number,
  orderId: number,
) {
  return findOrderByIdAndUserId(
    orderId,
    userId,
  );
}