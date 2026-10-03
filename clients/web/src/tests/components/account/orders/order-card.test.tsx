import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OrderCard } from '@/components/account/orders/order-card';
import type { Order } from '@/services/order-service';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: pushMock,
    })),
}));

const ORDER: Order = {
    id: 1,
    userId: 1,
    totalAmount: 179.8,
    status: 'PENDING',
    paymentStatus: 'PAID',
    paymentGateway: 'MERCADO_PAGO',
    paymentId: '123456',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
    address: {
        id: 1,
        orderId: 1,
        name: 'Guilherme Nobre',
        street: 'Rua Teste',
        number: '100',
        complement: null,
        neighborhood: 'Centro',
        city: 'Ribeirão Preto',
        state: 'SP',
        zipCode: '14000-000',
        country: 'Brasil',
    },
    items: [
        {
            id: 1,
            orderId: 1,
            variantId: 1,
            productName: 'Top Essential',
            sizeName: 'M',
            colorName: 'Preto',
            quantity: 2,
            unitPrice: 89.9,
        },
    ],
};

describe('OrderCard', () => {
    it('deve exibir as informações do pedido', () => {
        render(<OrderCard order={ORDER} />);

        expect(screen.getByText('Pedido #1')).toBeInTheDocument();
        expect(screen.getByText(/1 item\(ns\)/)).toBeInTheDocument();
        expect(screen.getByText(/R\$ 179\.80/)).toBeInTheDocument();
        expect(screen.getByText('Pendente')).toBeInTheDocument();
        expect(screen.getByText('Pagamento aprovado')).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Ver detalhes',
            }),
        ).toBeInTheDocument();
    });

    it('deve exibir o status cancelado com badge de erro', () => {
        render(
            <OrderCard
                order={{
                    ...ORDER,
                    status: 'CANCELLED',
                }}
            />,
        );

        expect(screen.getByText('Cancelado')).toBeInTheDocument();
    });

    it('deve navegar para os detalhes do pedido', () => {
        render(<OrderCard order={ORDER} />);

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Ver detalhes',
            }),
        );

        expect(pushMock).toHaveBeenCalledWith('/account/orders/1');
    });
});