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

import OrdersPage from '@/app/account/orders/page';
import { useAuth } from '@/contexts/auth-context';
import {
    getOrders,
    type Order,
} from '@/services/order-service';

vi.mock('@/contexts/auth-context', () => ({
    useAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
        push: vi.fn(),
        refresh: vi.fn(),
        replace: vi.fn(),
    })),
}));

vi.mock('@/services/order-service', () => ({
    getOrders: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);
const getOrdersMock = vi.mocked(getOrders);

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

describe('OrdersPage', () => {
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

    it('deve exibir carregamento enquanto os pedidos são buscados', async () => {
        let resolveOrders: (orders: Order[]) => void = () => { };

        getOrdersMock.mockReturnValue(
            new Promise<Order[]>((resolve) => {
                resolveOrders = resolve;
            }),
        );

        render(<OrdersPage />);

        expect(
            screen.getByText('Carregando pedidos...'),
        ).toBeInTheDocument();

        resolveOrders([ORDER]);

        await waitFor(() => {
            expect(
                screen.getByText('Pedido #1'),
            ).toBeInTheDocument();
        });
    });

    it('deve buscar e exibir os pedidos do usuário autenticado', async () => {
        getOrdersMock.mockResolvedValue([ORDER]);

        render(<OrdersPage />);

        await waitFor(() => {
            expect(getOrdersMock).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.getByText('Pedido #1'),
        ).toBeInTheDocument();

        expect(
            screen.getByText(/R\$ 179\.80/),
        ).toBeInTheDocument();

        expect(
            screen.getByText('Pendente'),
        ).toBeInTheDocument();

        expect(
            screen.getByText('Pagamento aprovado'),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Ver detalhes',
            }),
        ).toBeInTheDocument();
    });

    it('deve exibir mensagem quando o usuário não possui pedidos', async () => {
        getOrdersMock.mockResolvedValue([]);

        render(<OrdersPage />);

        await waitFor(() => {
            expect(
                screen.getByText('Nenhum pedido encontrado'),
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText(
                'Seus pedidos realizados aparecerão aqui.',
            ),
        ).toBeInTheDocument();
    });

    it('não deve buscar pedidos enquanto a sessão estiver sendo restaurada', () => {
        useAuthMock.mockReturnValue({
            accessToken: null,
            isAuthenticated: false,
            isLoading: true,
            login: vi.fn(),
            logout: vi.fn(),
            user: null,
        });

        render(<OrdersPage />);

        expect(getOrdersMock).not.toHaveBeenCalled();
    });

    it('não deve buscar pedidos quando o usuário não estiver autenticado', () => {
        useAuthMock.mockReturnValue({
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            user: null,
        });

        render(<OrdersPage />);

        expect(getOrdersMock).not.toHaveBeenCalled();
    });
});