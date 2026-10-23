'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '@/contexts/auth-context';
import { Container } from '@/components/layout/container';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    getAdminDashboardMetrics,
    type AdminDashboardMetrics,
} from '@/services/admin-dashboard-service';

const ADMIN_SECTIONS = [
    {
        title: 'Pedidos',
        description: 'Consulte os pedidos dos clientes e gerencie seus status.',
        href: '/admin/orders',
    },
    {
        title: 'Produtos',
        description: 'Acesse o gerenciamento dos produtos do catálogo.',
        href: '/admin/products',
    },
];

const DASHBOARD_METRICS = [
    {
        key: 'totalOrders',
        title: 'Total de pedidos',
        description: 'Pedidos registrados na plataforma.',
        format: (value: number) => value.toLocaleString('pt-BR'),
    },
    {
        key: 'confirmedSales',
        title: 'Vendas confirmadas',
        description: 'Valor total de pedidos pagos não cancelados.',
        format: (value: number) =>
            value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }),
    },
    {
        key: 'lowStockVariants',
        title: 'Estoque baixo',
        description: 'Variantes ativas com estoque entre 1 e 5 unidades.',
        format: (value: number) => value.toLocaleString('pt-BR'),
    },
    {
        key: 'outOfStockVariants',
        title: 'Sem estoque',
        description: 'Variantes ativas sem unidades disponíveis.',
        format: (value: number) => value.toLocaleString('pt-BR'),
    },
] as const;

export default function AdminPage() {
    const { user, isLoading } = useAuth();

    const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
    const [metricsError, setMetricsError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        if (isLoading || user?.role !== 'ADMIN') {
            return;
        }

        let isActive = true;

        async function fetchMetrics() {
            try {
                const data = await getAdminDashboardMetrics();

                if (isActive) {
                    setMetrics(data);
                    setMetricsError(null);
                }
            } catch {
                if (isActive) {
                    setMetricsError(
                        'Não foi possível carregar as métricas do painel.',
                    );
                }
            } finally {
                if (isActive) {
                    setIsLoadingMetrics(false);
                }
            }
        }

        void fetchMetrics();

        return () => {
            isActive = false;
        };
    }, [isLoading, user?.role, retryKey]);

    if (isLoading) {
        return (
            <Container className="py-8">
                <p className="text-muted">Carregando...</p>
            </Container>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return (
            <Container className="py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Acesso não autorizado</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-muted">
                            Você não tem permissão para acessar esta área.
                        </p>

                        <Link
                            href="/"
                            className="mt-4 inline-block text-primary hover:underline"
                        >
                            Voltar para o início
                        </Link>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-8">
            <h1 className="text-2xl font-semibold text-foreground">
                Painel administrativo
            </h1>

            <p className="mt-2 text-muted">
                Acompanhe os principais indicadores da Le Coast.
            </p>

            <section
                aria-labelledby="dashboard-metrics-title"
                className="mt-6"
            >
                <h2
                    id="dashboard-metrics-title"
                    className="mb-4 text-lg font-semibold text-foreground"
                >
                    Visão geral
                </h2>

                {isLoadingMetrics && (
                    <p role="status" className="text-muted">
                        Carregando métricas...
                    </p>
                )}

                {!isLoadingMetrics && metricsError && (
                    <div role="alert" className="space-y-3">
                        <p className="text-error">{metricsError}</p>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRetryKey((current) => current + 1)}
                        >
                            Tentar novamente
                        </Button>
                    </div>
                )}

                {!isLoadingMetrics && !metricsError && metrics && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {DASHBOARD_METRICS.map((metric) => (
                            <Card key={metric.key}>
                                <CardHeader>
                                    <CardTitle>{metric.title}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-2xl font-semibold text-foreground">
                                        {metric.format(metrics[metric.key])}
                                    </p>

                                    <p className="mt-2 text-sm text-muted">
                                        {metric.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            <section aria-labelledby="admin-sections-title" className="mt-10">
                <h2
                    id="admin-sections-title"
                    className="mb-4 text-lg font-semibold text-foreground"
                >
                    Gerenciamento
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {ADMIN_SECTIONS.map((section) => (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            <Card className="h-full transition-colors hover:border-primary/50">
                                <CardHeader>
                                    <CardTitle>{section.title}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-muted">
                                        {section.description}
                                    </p>

                                    <span className="mt-4 inline-block font-medium text-primary">
                                        Acessar →
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </Container>
    );
}
