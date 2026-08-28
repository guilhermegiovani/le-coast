import { AppError } from '../errors/app-error.js';
import {
    createOrderRepository,
    findOrderByIdAndUserId,
    updateOrderStatusRepository,
    findOrdersByUserId,
    findOrderById,
} from '../repositories/order-repository.js';

import {
    createOrderSchema,
    updateOrderStatusSchema,
    type UpdateOrderStatusInput,
    type CreateOrderInput,
} from '../validators/order-validator.js';

import type { OrderStatus } from '../generated/prisma/client.js';

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

const ORDER_STATUS_TRANSITIONS: Record<
    OrderStatus,
    OrderStatus[]
> = {
    PENDING: [
        'PROCESSING',
        'CANCELLED',
    ],
    PROCESSING: [
        'SHIPPED',
        'CANCELLED',
    ],
    SHIPPED: [
        'DELIVERED',
    ],
    DELIVERED: [],
    CANCELLED: [],
};

// Atualiza o status de um pedido respeitando
// a ordem permitida do fluxo de processamento.
export async function updateOrderStatus(
    orderId: number,
    data: UpdateOrderStatusInput,
) {
    const input = updateOrderStatusSchema.parse(data);

    const order = await findOrderById(orderId);

    if (!order) {
        throw new AppError(
            'Pedido não encontrado.',
            404,
        );
    }

    // Um pedido só pode começar a ser processado
    // depois que o pagamento for confirmado.
    if (
        input.status === 'PROCESSING' &&
        order.paymentStatus !== 'PAID'
    ) {
        throw new AppError(
            'O pedido só pode ser processado após a confirmação do pagamento.',
            400,
        );
    }

    const allowedStatuses =
        ORDER_STATUS_TRANSITIONS[order.status];

    if (!allowedStatuses.includes(input.status)) {
        throw new AppError(
            'Transição de status inválida.',
            400,
        );
    }

    return updateOrderStatusRepository(
        orderId,
        input.status,
    );
}