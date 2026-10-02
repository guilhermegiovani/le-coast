import { useRouter } from 'next/navigation';

import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import type { Order } from '@/services/order-service';

type OrderCardProps = {
    order: Order;
};

export function OrderCard({ order }: OrderCardProps) {
    const router = useRouter();

    const formattedDate = new Date(order.createdAt).toLocaleDateString('pt-BR');

    const statusLabels: Record<string, string> = {
        PENDING: 'Pendente',
        PROCESSING: 'Em processamento',
        SHIPPED: 'Enviado',
        DELIVERED: 'Entregue',
        CANCELLED: 'Cancelado',
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Pedido #{order.id}
                </CardTitle>

                <CardDescription>
                    {formattedDate} · {order.items.length} item(ns) · R$ {Number(order.totalAmount).toFixed(2)}
                </CardDescription>

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
            </CardHeader>

            <CardFooter>
                <Button
                    type="button"
                    variant="primary"
                    onClick={() => router.push(`/account/orders/${order.id}`)}
                >
                    Ver detalhes
                </Button>
            </CardFooter>
        </Card>
    );
}