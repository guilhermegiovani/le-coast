'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { getOrderById, type Order } from '@/services/order-service';
import { useAuth } from '@/contexts/auth-context';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

export default function OrderDetailsPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isAuthLoading || !isAuthenticated) {
            return;
        }

        async function loadOrder() {
            try {
                const orderId = Number(params.id);
                const data = await getOrderById(orderId);

                setOrder(data);
            } finally {
                setIsLoading(false);
            }
        }

        void loadOrder();
    }, [params.id, isAuthLoading, isAuthenticated]);

    if (isLoading) {
        return (
            <Container className="py-8">
                <p className="text-muted">Carregando pedido...</p>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container className="py-8">
                <p className="text-muted">Pedido não encontrado.</p>
            </Container>
        );
    }

    return (
        <Container className="py-8">
            <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/account/orders')}
            >
                ← Voltar para meus pedidos
            </Button>

            <h1 className="text-2xl font-semibold text-foreground mt-4">
                Pedido #{order.id}
            </h1>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Resumo do pedido</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-wrap items-center gap-3">
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
                            Status do pedido: {order.status}
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
                            Pagamento: {order.paymentStatus}
                        </Badge>

                        <span className="text-sm text-muted">
                            Realizado em{' '}
                            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                    </div>

                    <p className="mt-4 text-lg font-semibold text-foreground">
                        Total: R$ {Number(order.totalAmount).toFixed(2)}
                    </p>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Itens do pedido</CardTitle>
                    <CardDescription>
                        Produtos incluídos neste pedido.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col gap-2 border-b border-border pb-4 last:border-0 last:pb-0"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium text-foreground">
                                        {item.productName}
                                    </p>

                                    <p className="font-semibold text-foreground">
                                        R$ {Number(item.unitPrice).toFixed(2)}
                                    </p>
                                </div>

                                <p className="text-sm text-muted">
                                    Tamanho: {item.sizeName} · Cor: {item.colorName} · Quantidade: {item.quantity}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Endereço de entrega</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="space-y-1 text-sm text-muted">
                        <p className="font-medium text-foreground">
                            {order.address.name}
                        </p>

                        <p>
                            {order.address.street}, {order.address.number}
                            {order.address.complement
                                ? ` - ${order.address.complement}`
                                : ''}
                        </p>

                        <p>
                            {order.address.neighborhood} · {order.address.city} -{' '}
                            {order.address.state}
                        </p>

                        <p>CEP: {order.address.zipCode}</p>
                    </div>
                </CardContent>
            </Card>
        </Container>
    );
}