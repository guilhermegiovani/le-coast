import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/contexts/auth-context';
import { getAdminDashboardMetrics } from '@/services/admin-dashboard-service';
import AdminPage from '@/app/admin/page';

vi.mock('@/contexts/auth-context', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/services/admin-dashboard-service', () => ({
    getAdminDashboardMetrics: vi.fn(),
}));

vi.mock('next/link', () => ({
    default: ({
        href,
        children,
        ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        href: string;
    }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

const useAuthMock = vi.mocked(useAuth);
const getAdminDashboardMetricsMock = vi.mocked(getAdminDashboardMetrics);

const MOCK_METRICS = {
    totalOrders: 12,
    confirmedSales: 1078.8,
    lowStockVariants: 3,
    outOfStockVariants: 2,
};

describe('AdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve exibir carregamento enquanto a autenticação está sendo verificada', () => {
        useAuthMock.mockReturnValue({
            user: null,
            isLoading: true,
        } as ReturnType<typeof useAuth>);

        render(<AdminPage />);

        expect(screen.getByText('Carregando...')).toBeInTheDocument();
        expect(getAdminDashboardMetricsMock).not.toHaveBeenCalled();
    });

    it('deve negar acesso a usuários que não são ADMIN', () => {
        useAuthMock.mockReturnValue({
            user: { role: 'CUSTOMER' },
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        render(<AdminPage />);

        expect(
            screen.getByRole('heading', {
                name: 'Acesso não autorizado',
            }),
        ).toBeInTheDocument();

        expect(getAdminDashboardMetricsMock).not.toHaveBeenCalled();
    });

    it('deve exibir as métricas do dashboard para ADMIN', async () => {
        useAuthMock.mockReturnValue({
            user: { role: 'ADMIN' },
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        getAdminDashboardMetricsMock.mockResolvedValue(MOCK_METRICS);

        render(<AdminPage />);

        expect(await screen.findByText('Total de pedidos')).toBeInTheDocument();
        expect(screen.getByText('Vendas confirmadas')).toBeInTheDocument();
        expect(screen.getByText('Estoque baixo')).toBeInTheDocument();
        expect(screen.getByText('Sem estoque')).toBeInTheDocument();

        expect(await screen.findByText('R$ 1.078,80')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();

        expect(getAdminDashboardMetricsMock).toHaveBeenCalledOnce();
    });

    it('deve exibir erro e permitir tentar novamente quando a requisição falhar', async () => {
        useAuthMock.mockReturnValue({
            user: { role: 'ADMIN' },
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        getAdminDashboardMetricsMock
            .mockRejectedValueOnce(new Error('Falha na API'))
            .mockResolvedValueOnce(MOCK_METRICS);

        render(<AdminPage />);

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent(
            'Não foi possível carregar as métricas do painel.',
        );

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Tentar novamente',
            }),
        );

        await waitFor(() => {
            expect(getAdminDashboardMetricsMock).toHaveBeenCalledTimes(2);
        });

        expect(await screen.findByText('Total de pedidos')).toBeInTheDocument();
        expect(
            screen.queryByRole('alert'),
        ).not.toBeInTheDocument();
    });

    it('deve manter os links para Pedidos e Produtos', async () => {
        useAuthMock.mockReturnValue({
            user: { role: 'ADMIN' },
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        getAdminDashboardMetricsMock.mockResolvedValue(MOCK_METRICS);

        render(<AdminPage />);

        expect(
            screen.getByRole('link', { name: /Pedidos/ }),
        ).toHaveAttribute('href', '/admin/orders');

        expect(
            screen.getByRole('link', { name: /Produtos/ }),
        ).toHaveAttribute('href', '/admin/products');
    });
});