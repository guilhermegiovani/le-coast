import {
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import OrderDetailsPage from '@/app/account/orders/[id]/page';
import { useAuth } from '@/contexts/auth-context';
import {
    getOrderById,
    type Order,
} from '@/services/order-service';

vi.mock('@/contexts/auth-context', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/services/order-service', () => ({
    getOrderById: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useParams: vi.fn(() => ({
        id: '1',
    })),
    useRouter: vi.fn(() => ({
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
        push: vi.fn(),
        refresh: vi.fn(),
        replace: vi.fn(),
    })),
}));

const useAuthMock = vi.mocked(useAuth);
const getOrderByIdMock = vi.mocked(getOrderById);

const AUTH_USER = {
    email: 'guilherme@example.com',
    id: 1,
    name: 'Guilherme Nobre',
    role: 'CUSTOMER' as const,
};

const ORDER: Order = {
    id: 1,
    userId: 1,
    totalAmount: 179.8,
    status: 'PENDING',
    paymentStatus: 'PAID',
    paymentGateway: 'mercado-pago',
    paymentId: 'payment-123',
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

describe('OrderDetailsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useAuthMock.mockReturnValue({
            accessToken: 'access-token',
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            user: AUTH_USER,
        });
    });

    it('deve exibir carregamento enquanto o pedido é buscado', async () => {
        let resolveOrder: (order: Order) => void = () => { };

        getOrderByIdMock.mockReturnValue(
            new Promise<Order>((resolve) => {
                resolveOrder = resolve;
            }),
        );

        render(<OrderDetailsPage />);

        expect(
            screen.getByText('Carregando pedido...'),
        ).toBeInTheDocument();

        resolveOrder(ORDER);

        await waitFor(() => {
            expect(
                screen.getByText('Pedido #1'),
            ).toBeInTheDocument();
        });
    });

    it('deve buscar e exibir os detalhes do pedido', async () => {
        getOrderByIdMock.mockResolvedValue(ORDER);

        render(<OrderDetailsPage />);

        await waitFor(() => {
            expect(getOrderByIdMock).toHaveBeenCalledWith(1);
        });

        expect(
            screen.getByText('Pedido #1'),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/R\$ 179\.80/),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Status do pedido:\s*PENDING/),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Pagamento:\s*PAID/),
        ).toBeInTheDocument();

        expect(
            screen.getByText('Top Essential'),
        ).toBeInTheDocument();

        expect(
            screen.getByText((_, element) => {
                const text = element?.textContent
                    ?.replace(/\s+/g, ' ')
                    .trim();

                return (
                    text ===
                    'Tamanho: M · Cor: Preto · Quantidade: 2'
                );
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByText((_, element) => {
                const text = element?.textContent
                    ?.replace(/\s+/g, ' ')
                    .trim();

                return text === 'Rua Teste, 100';
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByText((_, element) => {
                const text = element?.textContent
                    ?.replace(/\s+/g, ' ')
                    .trim();

                return text === 'Centro · Ribeirão Preto - SP';
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByText((_, element) => {
                const text = element?.textContent
                    ?.replace(/\s+/g, ' ')
                    .trim();

                return text === 'CEP: 14000-000';
            }),
        ).toBeInTheDocument();
    });

    it('não deve buscar o pedido enquanto a sessão estiver sendo restaurada', () => {
        useAuthMock.mockReturnValue({
            accessToken: null,
            isAuthenticated: false,
            isLoading: true,
            login: vi.fn(),
            logout: vi.fn(),
            user: null,
        });

        render(<OrderDetailsPage />);

        expect(getOrderByIdMock).not.toHaveBeenCalled();
    });

    it('não deve buscar o pedido quando o usuário não estiver autenticado', () => {
        useAuthMock.mockReturnValue({
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            user: null,
        });

        render(<OrderDetailsPage />);

        expect(getOrderByIdMock).not.toHaveBeenCalled();
    });

    it('deve exibir mensagem quando o pedido não for encontrado', async () => {
        getOrderByIdMock.mockResolvedValue(null as never);

        render(<OrderDetailsPage />);

        await waitFor(() => {
            expect(
                screen.getByText('Pedido não encontrado.'),
            ).toBeInTheDocument();
        });
    });
});