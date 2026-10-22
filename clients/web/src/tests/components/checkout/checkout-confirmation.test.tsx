import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/contexts/auth-context';
import { CheckoutConfirmation } from '@/components/checkout/checkout-confirmation';
import { getOrderById } from '@/services/order-service';

const { useSearchParamsMock, useRouterMock } = vi.hoisted(() => ({
    useSearchParamsMock: vi.fn(),
    useRouterMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useSearchParams: useSearchParamsMock,
    useRouter: useRouterMock,
}));

vi.mock('@/services/order-service', () => ({
    getOrderById: vi.fn(),
}));

vi.mock('@/contexts/auth-context', () => ({
    useAuth: vi.fn(),
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
        useRouterMock.mockReturnValue({ push: vi.fn() });
        vi.clearAllMocks();

        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
            accessToken: 'test-access-token',
            user: {
                id: 1,
                name: 'Guilherme Nobre',
                email: 'guilherme@example.com',
                role: 'CUSTOMER',
            },
            login: vi.fn(),
            logout: vi.fn(),
        });
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
                    name: 'Pagamento aprovado!',
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

    it('deve exibir os produtos e o endereço de entrega do pedido', async () => {
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({
                status: 'approved',
                external_reference: '10',
            }),
        );

        vi.mocked(getOrderById).mockResolvedValue({
            ...ORDER,
            items: [
                {
                    id: 1,
                    orderId: 10,
                    variantId: 1,
                    productName: 'Top Essential',
                    sizeName: 'M',
                    colorName: 'Preto',
                    quantity: 2,
                    unitPrice: 89.9,
                },
            ],
        });

        render(<CheckoutConfirmation />);

        expect(
            await screen.findByRole('heading', {
                name: 'Resumo dos produtos',
            }),
        ).toBeInTheDocument();

        expect(screen.getByText('Top Essential')).toBeInTheDocument();
        expect(screen.getByText(/Cor: Preto/)).toBeInTheDocument();
        expect(screen.getByText(/Tamanho: M/)).toBeInTheDocument();
        expect(screen.getByText('Quantidade: 2')).toBeInTheDocument();

        expect(
            screen.getByRole('heading', {
                name: 'Endereço de entrega',
            }),
        ).toBeInTheDocument();

        expect(screen.getByText('Rua Teste, 100')).toBeInTheDocument();
        expect(screen.getByText(/Ribeirão Preto - SP/)).toBeInTheDocument();
        expect(screen.getByText('CEP: 14000-000')).toBeInTheDocument();
    });

    it('deve exibir uma mensagem quando falhar ao carregar o pedido', async () => {
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({
                external_reference: '10',
            }),
        );

        vi.mocked(getOrderById).mockRejectedValue(
            new Error('Erro ao consultar pedido'),
        );

        render(<CheckoutConfirmation />);

        expect(
            await screen.findByRole('heading', {
                name: 'Não foi possível carregar o pedido',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Consultar meus pedidos',
            }),
        ).toBeInTheDocument();
    });

    it('deve exibir uma mensagem quando o identificador do pedido for inválido', () => {
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({
                external_reference: 'abc',
            }),
        );

        render(<CheckoutConfirmation />);

        expect(
            screen.getByRole('heading', {
                name: 'Pedido não encontrado',
            }),
        ).toBeInTheDocument();

        expect(getOrderById).not.toHaveBeenCalled();
    });

    it('deve solicitar login quando o usuário não estiver autenticado', () => {
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({
                external_reference: '10',
            }),
        );

        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            accessToken: null,
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(<CheckoutConfirmation />);

        expect(
            screen.getByRole('heading', {
                name: 'Entre na sua conta',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Acessar minha conta',
            }),
        ).toBeInTheDocument();

        expect(getOrderById).not.toHaveBeenCalled();
    });

    it('deve aguardar a restauração da sessão antes de consultar o pedido', () => {
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams({
                external_reference: '10',
            }),
        );

        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: false,
            isLoading: true,
            accessToken: null,
            user: null,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(<CheckoutConfirmation />);

        expect(
            screen.getByRole('heading', {
                name: 'Carregando seu pedido...',
            }),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole('heading', {
                name: 'Entre na sua conta',
            }),
        ).not.toBeInTheDocument();

        expect(getOrderById).not.toHaveBeenCalled();
    });
});