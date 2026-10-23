import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';
import { getAdminDashboardMetrics } from '@/services/admin-dashboard-service';

vi.mock('@/lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

const apiGetMock = vi.mocked(api.get);

const MOCK_METRICS = {
    totalOrders: 12,
    confirmedSales: 1078.8,
    lowStockVariants: 3,
    outOfStockVariants: 2,
};

describe('admin-dashboard-service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve buscar as métricas do dashboard e retornar os dados', async () => {
        apiGetMock.mockResolvedValue({
            data: MOCK_METRICS,
        } as never);

        const result = await getAdminDashboardMetrics();

        expect(apiGetMock).toHaveBeenCalledOnce();
        expect(apiGetMock).toHaveBeenCalledWith('/admin/dashboard');
        expect(result).toEqual(MOCK_METRICS);
    });

    it('deve propagar o erro quando a requisição falhar', async () => {
        const error = new Error('Erro ao buscar métricas');

        apiGetMock.mockRejectedValue(error);

        await expect(getAdminDashboardMetrics()).rejects.toBe(error);
    });
});