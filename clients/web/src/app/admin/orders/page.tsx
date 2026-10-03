'use client';

import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import {
    getOrders,
    updateOrderStatus,
    type Order,
} from '@/services/order-service';
import { Badge } from '@/components/ui/badge';

export default function AdminOrdersPage() {
    const { user, isLoading } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isOrdersLoading, setIsOrdersLoading] = useState(true);
    const [updatingOrderIds, setUpdatingOrderIds] = useState<number[]>([]);

    useEffect(() => {
        if (isLoading || !user || user.role !== 'ADMIN') {
            return;
        }

        async function loadOrders() {
            try {
                const data = await getOrders();
                setOrders(data);
            } finally {
                setIsOrdersLoading(false);
            }
        }

        void loadOrders();
    }, [isLoading, user]);

    async function handleStatusChange(
        orderId: number,
        status: string,
    ) {
        setUpdatingOrderIds((currentIds) => [
            ...currentIds,
            orderId,
        ]);

        try {
            const updatedOrder = await updateOrderStatus(
                orderId,
                status,
            );

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === updatedOrder.id
                        ? updatedOrder
                        : order,
                ),
            );
        } catch (error) {
            console.error(
                'Erro ao atualizar status do pedido:',
                error,
            );
        } finally {
            setUpdatingOrderIds((currentIds) =>
                currentIds.filter((id) => id !== orderId),
            );
        }
    }

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
                    </CardContent>
                </Card>
            </Container>
        );
    }

    const statusLabels: Record<string, string> = {
        PENDING: 'Pendente',
        PROCESSING: 'Em processamento',
        SHIPPED: 'Enviado',
        DELIVERED: 'Entregue',
        CANCELLED: 'Cancelado',
    };

    return (
        <Container className="py-8">
            <h1 className="text-2xl font-semibold text-foreground">
                Pedidos
            </h1>

            <p className="mt-2 text-muted">
                Gerencie os pedidos realizados pelos clientes.
            </p>

            <div className="mt-6">
                {isOrdersLoading && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Carregando pedidos...</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <p className="text-muted">
                                Aguarde enquanto buscamos os pedidos.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {!isOrdersLoading && orders.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Nenhum pedido encontrado</CardTitle>
                        </CardHeader>
                    </Card>
                )}

                {!isOrdersLoading && orders.length > 0 && (
                    <Card className="border-foreground/20">
                        <CardHeader>
                            <CardTitle>
                                Pedidos ({orders.length})
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-4">
                                {orders.map((order) => {
                                    const isUpdating = updatingOrderIds.includes(order.id);

                                    return (
                                        <div
                                            key={order.id}
                                            className="border-b border-foreground/20 pb-4 last:border-0 last:pb-0"
                                        >
                                            <p className="font-medium text-foreground">
                                                Pedido #{order.id}
                                            </p>

                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <p className="text-sm text-muted">
                                                    R$ {Number(order.totalAmount).toFixed(2)}
                                                </p>

                                                <Badge
                                                    variant={
                                                        order.status === 'DELIVERED'
                                                            ? 'success'
                                                            : order.status === 'CANCELLED'
                                                                ? 'error'
                                                                : order.status === 'PENDING'
                                                                    ? 'warning'
                                                                    : 'default'
                                                    }
                                                >
                                                    {statusLabels[order.status] ?? order.status}
                                                </Badge>

                                                <Badge
                                                    variant={
                                                        order.paymentStatus === 'PAID'
                                                            ? 'success'
                                                            : order.paymentStatus === 'FAILED'
                                                                ? 'error'
                                                                : order.paymentStatus === 'REFUNDED'
                                                                    ? 'warning'
                                                                    : 'default'
                                                    }
                                                >
                                                    {order.paymentStatus === 'PAID'
                                                        ? 'Pagamento aprovado'
                                                        : order.paymentStatus === 'FAILED'
                                                            ? 'Pagamento recusado'
                                                            : order.paymentStatus === 'REFUNDED'
                                                                ? 'Pagamento reembolsado'
                                                                : 'Pagamento pendente'}
                                                </Badge>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {order.status === 'PENDING' && (
                                                    <>
                                                        {order.paymentStatus === 'PAID' && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                disabled={isUpdating}
                                                                onClick={() =>
                                                                    handleStatusChange(
                                                                        order.id,
                                                                        'PROCESSING',
                                                                    )
                                                                }
                                                            >
                                                                {isUpdating
                                                                    ? 'Atualizando...'
                                                                    : 'Iniciar processamento'}
                                                            </Button>
                                                        )}

                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="danger"
                                                            disabled={isUpdating}
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    order.id,
                                                                    'CANCELLED',
                                                                )
                                                            }
                                                        >
                                                            {isUpdating
                                                                ? 'Atualizando...'
                                                                : 'Cancelar pedido'}
                                                        </Button>
                                                    </>
                                                )}

                                                {order.status === 'PROCESSING' && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        disabled={isUpdating}
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                order.id,
                                                                'SHIPPED',
                                                            )
                                                        }
                                                    >
                                                        {isUpdating
                                                            ? 'Atualizando...'
                                                            : 'Marcar como enviado'}
                                                    </Button>
                                                )}

                                                {order.status === 'SHIPPED' && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        disabled={isUpdating}
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                order.id,
                                                                'DELIVERED',
                                                            )
                                                        }
                                                    >
                                                        {isUpdating
                                                            ? 'Atualizando...'
                                                            : 'Marcar como entregue'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Container>
    );
}