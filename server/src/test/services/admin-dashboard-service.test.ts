
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {
    getAdminOrderMetricsRepository,
} from '../../repositories/order-repository.js';

import {
    getAdminStockMetricsRepository,
} from '../../repositories/product-variant-repository.js';

import {
    getAdminDashboardMetrics,
} from '../../services/admin-dashboard-service.js';

// Simula os repositories para que os testes do service
// não utilizem o banco de dados real.
vi.mock('../../repositories/order-repository.js', () => ({
    getAdminOrderMetricsRepository: vi.fn(),
}));

vi.mock('../../repositories/product-variant-repository.js', () => ({
    getAdminStockMetricsRepository: vi.fn(),
}));

// Mantém referências tipadas aos mocks, seguindo
// o padrão utilizado nos testes de order-service.
const getAdminOrderMetricsRepositoryMock = vi.mocked(
    getAdminOrderMetricsRepository,
);

const getAdminStockMetricsRepositoryMock = vi.mocked(
    getAdminStockMetricsRepository,
);

const ORDER_METRICS = {
    totalOrders: 12,
    confirmedSales: 1078.8,
};

const STOCK_METRICS = {
    lowStockVariants: 3,
    outOfStockVariants: 2,
};

describe('getAdminDashboardMetrics', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que o service reúna as métricas
    // de pedidos e estoque em um único objeto.
    it('deve combinar as métricas de pedidos e estoque', async () => {
        getAdminOrderMetricsRepositoryMock.mockResolvedValue(
            ORDER_METRICS,
        );

        getAdminStockMetricsRepositoryMock.mockResolvedValue(
            STOCK_METRICS,
        );

        const result = await getAdminDashboardMetrics();

        expect(result).toEqual({
            ...ORDER_METRICS,
            ...STOCK_METRICS,
        });

        expect(
            getAdminOrderMetricsRepositoryMock,
        ).toHaveBeenCalledOnce();

        expect(
            getAdminStockMetricsRepositoryMock,
        ).toHaveBeenCalledOnce();
    });

    // Garante que o erro de consulta dos pedidos
    // seja propagado pelo service.
    it('deve propagar o erro quando a consulta de pedidos falhar', async () => {
        getAdminOrderMetricsRepositoryMock.mockRejectedValue(
            new Error('Falha ao consultar pedidos'),
        );

        getAdminStockMetricsRepositoryMock.mockResolvedValue(
            STOCK_METRICS,
        );

        await expect(
            getAdminDashboardMetrics(),
        ).rejects.toThrow('Falha ao consultar pedidos');
    });

    // Garante que o erro de consulta do estoque
    // seja propagado pelo service.
    it('deve propagar o erro quando a consulta de estoque falhar', async () => {
        getAdminOrderMetricsRepositoryMock.mockResolvedValue(
            ORDER_METRICS,
        );

        getAdminStockMetricsRepositoryMock.mockRejectedValue(
            new Error('Falha ao consultar estoque'),
        );

        await expect(
            getAdminDashboardMetrics(),
        ).rejects.toThrow('Falha ao consultar estoque');
    });
});
