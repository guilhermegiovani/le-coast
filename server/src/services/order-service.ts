import { AppError } from '../errors/app-error.js';
import {
    createOrderRepository,
    findOrderByIdAndUserId,
    updateOrderStatusRepository,
    findOrdersByUserId,
    findOrderById,
} from '../repositories/order-repository.js';

import {
    decrementProductVariantStockRepository,
    findActiveProductVariantsByIds,
} from '../repositories/product-variant-repository.js';

import {
    createOrderSchema,
    updateOrderStatusSchema,
    type UpdateOrderStatusInput,
    type CreateOrderInput,
} from '../validators/order-validator.js';

import type { OrderStatus } from '../generated/prisma/client.js';

import { prisma } from '../config/prisma.js';

import {
    clearCartItemsRepository,
    findCartByUserIdRepository,
} from '../repositories/cart-repository.js';

import type { Prisma } from '../generated/prisma/client.js';

// Cria um novo pedido a partir dos dados enviados pelo cliente.
//
// O Zod valida e normaliza os dados recebidos.
// O service fica responsável por buscar as variantes,
// validar estoque, obter os preços oficiais e montar os snapshots.
export async function createUserOrder(
    userId: number,
    data: CreateOrderInput,
) {
    const input = createOrderSchema.parse(data);

    return prisma.$transaction(
        async (transactionClient) => {
            return createOrder(
                userId,
                input,
                transactionClient,
            );
        },
    );
}

/**
 * Executa a criação do pedido utilizando os dados já validados.
 *
 * O transactionClient é opcional porque o POST /orders pode
 * criar sua própria transação através do repository, enquanto
 * o checkout precisa compartilhar a mesma transação com o carrinho.
 */
async function createOrder(
    userId: number,
    input: CreateOrderInput,
    transactionClient?: Prisma.TransactionClient,
) {
    // Remove IDs repetidos antes de consultar o banco,
    // evitando buscas desnecessárias pela mesma variação.
    const variantIds = [
        ...new Set(
            input.items.map(
                (item) => item.variantId,
            ),
        ),
    ];

    const variants =
        await findActiveProductVariantsByIds(
            variantIds,
        );

    // Todas as variações enviadas precisam existir
    // e estar disponíveis para venda.
    if (
        variants.length !== variantIds.length
    ) {
        throw new AppError(
            'Uma ou mais variações do pedido são inválidas ou estão indisponíveis.',
            400,
        );
    }

    // Monta os itens utilizando exclusivamente informações
    // confiáveis vindas do banco.
    const orderItems = input.items.map(
        (item) => {
            const variant =
                variants.find(
                    (currentVariant) =>
                        currentVariant.id ===
                        item.variantId,
                );

            if (!variant) {
                throw new AppError(
                    'Variação do produto não encontrada.',
                    400,
                );
            }

            // Impede que o cliente compre uma quantidade
            // maior do que o estoque disponível.
            if (
                item.quantity >
                variant.stock
            ) {
                throw new AppError(
                    `Estoque insuficiente para a variação ${variant.sku}.`,
                    400,
                );
            }

            return {
                variantId: variant.id,
                productName:
                    variant.product.name,
                sizeName:
                    variant.size.name,
                colorName:
                    variant.color.name,
                quantity: item.quantity,
                unitPrice:
                    Number(variant.price),
            };
        },
    );

    // Baixa o estoque de cada variante dentro da mesma transação
    // utilizada para criar o pedido.
    for (const item of orderItems) {
        const result =
            await decrementProductVariantStockRepository(
                item.variantId,
                item.quantity,
                transactionClient,
            );

        // A condição stock >= quantity é verificada diretamente
        // no banco. Se nenhuma linha for atualizada, o estoque mudou
        // entre a validação e a baixa.
        if (result.count === 0) {
            throw new AppError(
                'Estoque insuficiente para uma ou mais variações do pedido.',
                400,
            );
        }
    }

    // Calcula o total utilizando os preços oficiais
    // recuperados diretamente do banco.
    const totalAmount = Number(
        orderItems
            .reduce(
                (total, item) =>
                    total +
                    item.unitPrice *
                    item.quantity,
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
        ...(transactionClient !== undefined && {
            transaction: transactionClient,
        }),
    });
}

// Cria um pedido utilizando os itens atualmente
// presentes no carrinho do usuário.
//
// O carrinho é lido, o preço das variantes é consultado
// novamente e a criação do pedido + limpeza do carrinho
// acontecem dentro da mesma transação.
export async function createOrderFromCart(
    userId: number,
    address: CreateOrderInput['address'],
) {
    const cart =
        await findCartByUserIdRepository(
            userId,
        );

    if (!cart) {
        throw new AppError(
            'Carrinho não encontrado.',
            404,
        );
    }

    if (cart.items.length === 0) {
        throw new AppError(
            'O carrinho está vazio.',
            400,
        );
    }

    const items = cart.items.map(
        (item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
        }),
    );

    const input =
        createOrderSchema.parse({
            address,
            items,
        });

    return prisma.$transaction(
        async (transactionClient) => {
            const order =
                await createOrder(
                    userId,
                    input,
                    transactionClient,
                );

            await clearCartItemsRepository(
                cart.id,
                transactionClient,
            );

            return order;
        },
    );
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

    const allowedStatuses = ORDER_STATUS_TRANSITIONS[order.status];

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