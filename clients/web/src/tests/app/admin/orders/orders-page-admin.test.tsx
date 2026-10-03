import {
    fireEvent,
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

import AdminOrdersPage from '@/app/admin/orders/page';
import { useAuth } from '@/contexts/auth-context';
import {
    getOrders,
    updateOrderStatus,
    type Order,
} from '@/services/order-service';

vi.mock('@/contexts/auth-context', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/services/order-service', () => ({
    getOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);
const getOrdersMock = vi.mocked(getOrders);
const updateOrderStatusMock = vi.mocked(updateOrderStatus);

const ADMIN_USER = {
    email: 'admin@example.com',
    id: 1,
    name: 'Admin',
    role: 'ADMIN' as const,
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

describe('AdminOrdersPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve exibir carregamento enquanto a sessão estiver sendo restaurada', () => {
        useAuthMock.mockReturnValue({
            accessToken: null,
            isAuthenticated: false,
            isLoading: true,
            login: vi.fn(),
            logout: vi.fn(),
            user: null,
        });

        render(<AdminOrdersPage />);

        expect(
            screen.getByText('Carregando...'),
        ).toBeInTheDocument();

        expect(getOrdersMock).not.toHaveBeenCalled();
    });

    it('deve bloquear acesso para usuário que não seja administrador', () => {
        useAuthMock.mockReturnValue({
            accessToken: 'access-token',
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            user: {
                email: 'guilherme@example.com',
                id: 1,
                name: 'Guilherme Nobre',
                role: 'CUSTOMER' as const,
            },
        });

        render(<AdminOrdersPage />);

        expect(
            screen.getByRole('heading', {
                name: 'Acesso não autorizado',
            }),
        ).toBeInTheDocument();

        expect(getOrdersMock).not.toHaveBeenCalled();
    });

    it('deve buscar e exibir os pedidos para um administrador', async () => {
        useAuthMock.mockReturnValue({
            accessToken: 'access-token',
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            user: ADMIN_USER,
        });

        getOrdersMock.mockResolvedValue([ORDER]);

        render(<AdminOrdersPage />);

        await waitFor(() => {
            expect(getOrdersMock).toHaveBeenCalledTimes(1);
        });

        expect(
            screen.getByRole('heading', {
                name: 'Pedidos',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByText('Pedidos (1)'),
        ).toBeInTheDocument();

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
    });

    it('deve exibir mensagem quando não houver pedidos', async () => {
        useAuthMock.mockReturnValue({
            accessToken: 'access-token',
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            user: ADMIN_USER,
        });

        getOrdersMock.mockResolvedValue([]);

        render(<AdminOrdersPage />);

        await waitFor(() => {
            expect(
                screen.getByText('Nenhum pedido encontrado'),
            ).toBeInTheDocument();
        });
    });

    it('deve iniciar o processamento de um pedido pago', async () => {
        useAuthMock.mockReturnValue({
            accessToken: 'access-token',
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            user: ADMIN_USER,
        });

        getOrdersMock.mockResolvedValue([ORDER]);

        const updatedOrder: Order = {
            ...ORDER,
            status: 'PROCESSING',
        };

        let resolveUpdate: (order: Order) => void = () => { };

        updateOrderStatusMock.mockReturnValue(
            new Promise<Order>((resolve) => {
                resolveUpdate = resolve;
            }),
        );

        render(<AdminOrdersPage />);

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: 'Iniciar processamento',
                }),
            ).toBeInTheDocument();
        });

        const button = screen.getByRole('button', {
            name: 'Iniciar processamento',
        });

        fireEvent.click(button);

        expect(
            updateOrderStatusMock,
        ).toHaveBeenCalledWith(1, 'PROCESSING');

        expect(button).toBeDisabled();

        resolveUpdate(updatedOrder);

        await waitFor(() => {
            expect(
                screen.getByText('Em processamento'),
            ).toBeInTheDocument();
        });

        expect(
            screen.queryByRole('button', {
                name: 'Iniciar processamento',
            }),
        ).not.toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Marcar como enviado',
            }),
        ).toBeInTheDocument();
    });
});