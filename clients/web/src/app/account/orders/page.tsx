'use client';

import { useEffect, useState } from 'react';

import { Container } from '@/components/layout/container';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { OrderCard } from '@/components/account/orders/order-card';
import {
    getOrders,
    type Order,
} from '@/services/order-service';

import { useAuth } from '@/contexts/auth-context';

export default function OrdersPage() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isAuthLoading || !isAuthenticated) {
            return;
        }

        async function loadOrders() {
            try {
                const data = await getOrders();
                setOrders(data);
            } finally {
                setIsLoading(false);
            }
        }

        void loadOrders();
    }, [isAuthLoading, isAuthenticated]);

    return (
        <Container className="py-8">
            <h1 className="text-2xl font-semibold text-foreground">
                Meus pedidos
            </h1>

            <p className="mt-2 text-muted">
                Consulte seus pedidos e acompanhe o status de cada compra.
            </p>

            <div className="mt-8">
                {isLoading && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Carregando pedidos...</CardTitle>
                            <CardDescription>
                                Aguarde enquanto buscamos seu histórico de pedidos.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {!isLoading && orders.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Nenhum pedido encontrado</CardTitle>
                            <CardDescription>
                                Seus pedidos realizados aparecerão aqui.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {!isLoading && orders.length > 0 && (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}