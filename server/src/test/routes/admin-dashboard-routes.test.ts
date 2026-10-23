
import request from 'supertest';

import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { app } from '../../app.js';
import { generateAccessToken } from '../../lib/jwt.js';

import {
    getAdminDashboardMetrics,
} from '../../services/admin-dashboard-service.js';

// Simula o service para que os testes HTTP
// não acessem os repositories nem o banco real.
vi.mock('../../services/admin-dashboard-service.js', () => ({
    getAdminDashboardMetrics: vi.fn(),
}));

const getAdminDashboardMetricsMock = vi.mocked(
    getAdminDashboardMetrics,
);

const MOCK_DASHBOARD_METRICS = {
    totalOrders: 12,
    confirmedSales: 1078.8,
    lowStockVariants: 3,
    outOfStockVariants: 2,
};

describe('GET /admin/dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que usuários sem autenticação
    // não possam acessar o dashboard administrativo.
    it('deve retornar 401 quando o token não for informado', async () => {
        await request(app)
            .get('/admin/dashboard')
            .expect(401);

        expect(
            getAdminDashboardMetricsMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que clientes comuns não possam
    // consultar os indicadores administrativos.
    it('deve retornar 403 quando o usuário não for ADMIN', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        await request(app)
            .get('/admin/dashboard')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(403);

        expect(
            getAdminDashboardMetricsMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que administradores autenticados
    // recebam os indicadores do dashboard.
    it('deve retornar as métricas para ADMIN', async () => {
        const accessToken = generateAccessToken({
            id: 1,
            role: 'ADMIN',
        });

        getAdminDashboardMetricsMock.mockResolvedValue(
            MOCK_DASHBOARD_METRICS,
        );

        const response = await request(app)
            .get('/admin/dashboard')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(200);

        expect(
            getAdminDashboardMetricsMock,
        ).toHaveBeenCalledOnce();

        expect(response.body).toEqual(
            MOCK_DASHBOARD_METRICS,
        );
    });
});
