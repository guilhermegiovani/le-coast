import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CheckoutConfirmation } from '@/components/checkout/checkout-confirmation';
import { getOrderById } from '@/services/order-service';

const { useSearchParamsMock } = vi.hoisted(() => ({
    useSearchParamsMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useSearchParams: useSearchParamsMock,
}));

vi.mock('@/services/order-service', () => ({
    getOrderById: vi.fn(),
}));

const ORDER = {
    id: 10,
    userId: 3,
    totalAmount: 89.9,
    status: 'PENDING',
    paymentStatus: 'PAID',
    paymentGateway: 'MERCADO_PAGO',
    paymentId: '123456',
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

describe('CheckoutConfirmation', () => {
    beforeEach(() => {
        useSearchParamsMock.mockReset();
        vi.clearAllMocks();
    });

    it('deve exibir confirmação para pagamento aprovado', async () => {
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({
                status: 'approved',
                external_reference: '10',
            }),
        );

        vi.mocked(getOrderById).mockResolvedValue(ORDER);

        render(<CheckoutConfirmation />);

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: 'Pagamento aprovado',
                }),
            ).toBeInTheDocument();
        });

        expect(screen.getByText('Pedido #10')).toBeInTheDocument();
        expect(getOrderById).toHaveBeenCalledWith(10);
    });

    it('deve exibir pagamento pendente', async () => {
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({
                status: 'pending',
                external_reference: '10',
            }),
        );

        vi.mocked(getOrderById).mockResolvedValue({
            ...ORDER,
            paymentStatus: 'PENDING',
        });

        render(<CheckoutConfirmation />);

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: 'Pagamento pendente',
                }),
            ).toBeInTheDocument();
        });
    });

    it('deve exibir pagamento não concluído', async () => {
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({
                status: 'failure',
                external_reference: '10',
            }),
        );

        vi.mocked(getOrderById).mockResolvedValue({
            ...ORDER,
            paymentStatus: 'FAILED',
        });

        render(<CheckoutConfirmation />);

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: 'Pagamento não concluído',
                }),
            ).toBeInTheDocument();
        });
    });

    it('deve utilizar o status real do pedido em vez do status da URL', async () => {
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({
                status: 'approved',
                external_reference: '10',
            }),
        );

        vi.mocked(getOrderById).mockResolvedValue({
            ...ORDER,
            paymentStatus: 'FAILED',
        });

        render(<CheckoutConfirmation />);

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: 'Pagamento não concluído',
                }),
            ).toBeInTheDocument();
        });
    });
});