
import { getAdminOrderMetricsRepository } from '../repositories/order-repository.js';
import { getAdminStockMetricsRepository } from '../repositories/product-variant-repository.js';

/**
 * Reúne os indicadores utilizados pelo dashboard administrativo.
 *
 * O service coordena as consultas dos repositórios,
 * mantendo a lógica de acesso ao banco fora da camada HTTP.
 */
export async function getAdminDashboardMetrics() {
    const [orderMetrics, stockMetrics] = await Promise.all([
        getAdminOrderMetricsRepository(),
        getAdminStockMetricsRepository(),
    ]);

    return {
        ...orderMetrics,
        ...stockMetrics,
    };
}
