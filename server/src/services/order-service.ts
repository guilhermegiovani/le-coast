import { AppError } from '../errors/app-error.js';
import {
    createOrderRepository,
    findOrderByIdAndUserId,
    updateOrderStatusRepository,
    findOrdersByUserId,
    findOrderById,
} from '../repositories/order-repository.js';

import { findActiveProductVariantsByIds } from '../repositories/product-variant-repository.js';

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

    // Remove IDs repetidos antes de consultar o banco,
    // evitando buscas desnecessárias pela mesma variação.
    const variantIds = [
        ...new Set(input.items.map((item) => item.variantId)),
    ];

    const variants = await findActiveProductVariantsByIds(variantIds);

    // Todas as variações enviadas pelo cliente precisam existir
    // e estar disponíveis para venda.
    if (variants.length !== variantIds.length) {
        throw new AppError(
            'Uma ou mais variações do pedido são inválidas ou estão indisponíveis.',
            400,
        );
    }

    // Monta os itens utilizando exclusivamente informações
    // confiáveis vindas do banco.
    //
    // O preço enviado pelo frontend deixa de ser utilizado.
    const orderItems = input.items.map((item) => {
        const variant = variants.find(
            (currentVariant) => currentVariant.id === item.variantId,
        );

        // Este caso já foi protegido pela validação acima,
        // mas mantemos a verificação para evitar acesso inseguro.
        if (!variant) {
            throw new AppError(
                'Variação do produto não encontrada.',
                400,
            );
        }

        // Impede que o cliente compre uma quantidade maior
        // do que o estoque atualmente disponível.
        if (item.quantity > variant.stock) {
            throw new AppError(
                `Estoque insuficiente para a variação ${variant.sku}.`,
                400,
            );
        }

        return {
            variantId: variant.id,

            // Snapshot histórico do produto no momento da compra.
            productName: variant.product.name,
            sizeName: variant.size.name,
            colorName: variant.color.name,

            quantity: item.quantity,

            // O preço sempre vem do banco e nunca do frontend.
            unitPrice: Number(variant.price),
        };
    });

    // Calcula o total com os preços oficiais recuperados
    // diretamente do banco de dados.
    const totalAmount = Number(
        orderItems
            .reduce(
                (total, item) =>
                    total + item.unitPrice * item.quantity,
                0,
            )
            .toFixed(2),
    );

    return createOrderRepository({
        userId,
        data: {
            ...input,
            items: orderItems,
        },
        totalAmount,
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