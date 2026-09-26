import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';
import { createOrder, getOrderById } from '@/services/order-service';

vi.mock('@/lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('order-service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve criar um pedido utilizando o checkout', async () => {
        const order = {
            id: 10,
            userId: 3,
            totalAmount: 89.9,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentGateway: null,
            paymentId: null,
            createdAt: '2026-09-17T12:00:00.000Z',
            updatedAt: '2026-09-17T12:00:00.000Z',
            address: {
                id: 1,
                orderId: 10,
                name: 'Guilherme Nobre',
                street: 'Rua Teste',
                number: '100',
                complement: null,
                neighborhood: 'Centro',
                city: 'Ribeirão Preto',
                state: 'SP',
                zipCode: '14000-000',
                country: 'BR',
            },
            items: [],
        };

        const data = {
            address: {
                name: 'Guilherme Nobre',
                street: 'Rua Teste',
                number: '100',
                neighborhood: 'Centro',
                city: 'Ribeirão Preto',
                state: 'SP',
                zipCode: '14000-000',
            },
        };

        vi.mocked(api.post).mockResolvedValue({ data: order });

        const result = await createOrder(data);

        expect(api.post).toHaveBeenCalledOnce();
        expect(api.post).toHaveBeenCalledWith('/orders/checkout', data);
        expect(result).toEqual(order);
    });

    it('deve buscar um pedido pelo ID', async () => {
        const order = {
            id: 10,
            userId: 3,
            totalAmount: 89.9,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentGateway: null,
            paymentId: null,
            createdAt: '2026-09-17T12:00:00.000Z',
            updatedAt: '2026-09-17T12:00:00.000Z',
            address: {
                id: 1,
                orderId: 10,
                name: 'Guilherme Nobre',
                street: 'Rua Teste',
                number: '100',
                complement: null,
                neighborhood: 'Centro',
                city: 'Ribeirão Preto',
                state: 'SP',
                zipCode: '14000-000',
                country: 'BR',
            },
            items: [],
        };

        vi.mocked(api.get).mockResolvedValue({ data: order });

        const result = await getOrderById(10);

        expect(api.get).toHaveBeenCalledOnce();
        expect(api.get).toHaveBeenCalledWith('/orders/10');
        expect(result).toEqual(order);
    });
});
