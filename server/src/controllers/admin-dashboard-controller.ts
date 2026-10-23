
import type {
    Request,
    Response,
} from 'express';

import { getAdminDashboardMetrics } from '../services/admin-dashboard-service.js';

/**
 * Retorna os indicadores gerais do painel administrativo.
 *
 * A autorização fica na rota, por meio dos middlewares
 * de autenticação e verificação de papel.
 */
export async function getAdminDashboardController(
    _request: Request,
    response: Response,
) {
    const metrics = await getAdminDashboardMetrics();

    return response.status(200).json(metrics);
}
