import { api } from '@/lib/api';

export type AdminDashboardMetrics = {
    totalOrders: number;
    confirmedSales: number;
    lowStockVariants: number;
    outOfStockVariants: number;
};

// Busca as métricas do painel administrativo.
// A rota do backend exige um usuário autenticado com perfil ADMIN.
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const response = await api.get<AdminDashboardMetrics>(
        '/admin/dashboard',
    );

    return response.data;
}
