import { api } from '@/lib/api';

export type CreateOrderAddressInput = {
    name: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
};

export type CreateOrderInput = {
    address: CreateOrderAddressInput;
};

export type OrderAddress = {
    id: number;
    orderId: number;
    name: string;
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
};

export type OrderItem = {
    id: number;
    orderId: number;
    variantId: number;
    productName: string;
    sizeName: string;
    colorName: string;
    quantity: number;
    unitPrice: number;
};

export type Order = {
    id: number;
    userId: number;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    paymentGateway: string | null;
    paymentId: string | null;
    createdAt: string;
    updatedAt: string;
    address: OrderAddress;
    items: OrderItem[];
};

// Cria um pedido utilizando o carrinho do usuário
// e o endereço informado no checkout.
export async function createOrder(
    data: CreateOrderInput,
): Promise<Order> {
    const response = await api.post<Order>(
        '/orders/checkout',
        data,
    );

    return response.data;
}

// Busca os dados completos de um pedido autenticado pelo seu ID.
export async function getOrderById(orderId: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/${orderId}`);
    return response.data;
}