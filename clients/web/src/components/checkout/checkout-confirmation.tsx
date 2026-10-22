
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    CircleAlert,
    CheckCircle2,
    Clock3,
    LoaderCircle,
    MapPin,
    Package,
    PackageCheck,
    PackageSearch,
    RotateCcw,
    ShoppingBag,
    UserRound,
    XCircle,
} from 'lucide-react';

import { Container } from '@/components/layout/container';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { getOrderById, type Order } from '@/services/order-service';
import { useAuth } from '@/contexts/auth-context';

const orderStatusLabels: Record<string, string> = {
    PENDING: 'Pendente',
    PROCESSING: 'Em processamento',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregue',
    CANCELLED: 'Cancelado',
};

const paymentStatusLabels: Record<string, string> = {
    PAID: 'Pagamento aprovado',
    PENDING: 'Pagamento pendente',
    FAILED: 'Pagamento recusado',
    REFUNDED: 'Pagamento reembolsado',
};

function formatCurrency(value: number | string) {
    return Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Data indisponível';
    }

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function getOrderStatusVariant(
    status: string,
): 'success' | 'error' | 'warning' | 'default' {
    if (status === 'DELIVERED') return 'success';
    if (status === 'CANCELLED') return 'error';
    if (status === 'PENDING') return 'warning';

    return 'default';
}

function getPaymentStatusVariant(
    status: string,
): 'success' | 'error' | 'warning' | 'default' {
    if (status === 'PAID') return 'success';
    if (status === 'FAILED') return 'error';

    if (status === 'PENDING' || status === 'REFUNDED') {
        return 'warning';
    }

    return 'default';
}

function getPaymentMessage(status: string) {
    switch (status) {
        case 'PAID':
            return {
                title: 'Pagamento aprovado!',
                description:
                    'Recebemos seu pagamento. Seu pedido está seguindo para processamento.',
                icon: CheckCircle2,
                iconStyle: 'bg-success/10 text-success',
            };

        case 'PENDING':
            return {
                title: 'Pagamento pendente',
                description:
                    'Seu pagamento ainda está sendo processado. Você pode consultar os detalhes do pedido para acompanhar a situação.',
                icon: Clock3,
                iconStyle: 'bg-warning/10 text-warning',
            };

        case 'FAILED':
            return {
                title: 'Pagamento não concluído',
                description:
                    'Não foi possível confirmar seu pagamento. Consulte os detalhes do pedido para verificar a situação.',
                icon: XCircle,
                iconStyle: 'bg-error/10 text-error',
            };

        case 'REFUNDED':
            return {
                title: 'Pagamento reembolsado',
                description:
                    'O pagamento deste pedido foi reembolsado. Consulte os detalhes para obter mais informações.',
                icon: RotateCcw,
                iconStyle: 'bg-warning/10 text-warning',
            };

        default:
            return {
                title: 'Pedido recebido',
                description:
                    'Consulte os detalhes do pedido para verificar o status atual do pagamento.',
                icon: PackageCheck,
                iconStyle: 'bg-secondary text-foreground',
            };
    }
}

export function CheckoutConfirmation() {
    const {
        isAuthenticated,
        isLoading: isAuthLoading,
    } = useAuth();

    const router = useRouter();
    const searchParams = useSearchParams();

    const orderId = searchParams.get('external_reference');
    const parsedOrderId = Number(orderId);

    const isValidOrderId =
        orderId !== null &&
        orderId.trim() !== '' &&
        Number.isInteger(parsedOrderId) &&
        parsedOrderId > 0;

    const [order, setOrder] = useState<Order | null>(null);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(isValidOrderId);

    useEffect(() => {
        // Aguarda a restauração da sessão antes de consultar o pedido.
        if (!isValidOrderId || isAuthLoading) {
            return;
        }

        // A consulta do pedido exige uma sessão autenticada.
        if (!isAuthenticated) {
            return;
        }

        let cancelled = false;

        async function loadOrder() {
            try {
                const data = await getOrderById(parsedOrderId);

                if (!cancelled) {
                    setOrder(data);
                    setHasError(false);
                }
            } catch {
                if (!cancelled) {
                    setHasError(true);
                    setOrder(null);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadOrder();

        // Impede atualizações de estado após a limpeza do efeito.
        return () => {
            cancelled = true;
        };
    }, [
        isValidOrderId,
        parsedOrderId,
        isAuthLoading,
        isAuthenticated,
    ]);

    if (!isValidOrderId) {
        return (
            <main className="py-12 md:py-16">
                <Container>
                    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
                        <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
                            <PackageSearch size={30} />
                        </div>

                        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                            Pedido não encontrado
                        </h1>

                        <p className="text-muted">
                            Não encontramos um identificador de pedido válido
                            nesta página.
                        </p>

                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => router.push('/')}
                        >
                            Continuar comprando
                        </Button>
                    </div>
                </Container>
            </main>
        );
    }

    // Preserva o fluxo de carregamento que corrigimos anteriormente.
    if (isLoading && (isAuthLoading || isAuthenticated)) {
        return (
            <main className="py-12 md:py-16">
                <Container>
                    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-8 text-center">
                        <LoaderCircle
                            size={36}
                            className="animate-spin text-primary"
                        />

                        <h1 className="text-2xl font-bold text-foreground">
                            Carregando seu pedido...
                        </h1>

                        <p className="text-muted">
                            Estamos consultando os dados da sua compra.
                        </p>
                    </div>
                </Container>
            </main>
        );
    }

    if (!isAuthLoading && !isAuthenticated) {
        return (
            <main className="py-12 md:py-16">
                <Container>
                    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
                        <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
                            <UserRound size={30} />
                        </div>

                        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                            Entre na sua conta
                        </h1>

                        <p className="text-muted">
                            Para consultar os dados do pedido, entre na sua
                            conta e tente novamente.
                        </p>

                        <Button
                            type="button"
                            onClick={() => router.push('/account')}
                        >
                            Acessar minha conta
                        </Button>
                    </div>
                </Container>
            </main>
        );
    }

    if (!order) {
        return (
            <main className="py-12 md:py-16">
                <Container>
                    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
                        <div className="flex size-16 items-center justify-center rounded-full bg-error/10 text-error">
                            <CircleAlert size={30} />
                        </div>

                        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                            {hasError
                                ? 'Não foi possível carregar o pedido'
                                : 'Pedido não encontrado'}
                        </h1>

                        <p className="text-muted">
                            {hasError
                                ? 'Ocorreu um problema ao consultar seu pedido. Tente novamente acessando seus pedidos.'
                                : 'Não encontramos os dados deste pedido.'}
                        </p>

                        <Button
                            type="button"
                            onClick={() => router.push('/account/orders')}
                        >
                            Consultar meus pedidos
                        </Button>
                    </div>
                </Container>
            </main>
        );
    }

    const paymentMessage = getPaymentMessage(order.paymentStatus);
    const PaymentIcon = paymentMessage.icon;

    const paymentLabel =
        paymentStatusLabels[order.paymentStatus] ??
        `Status: ${order.paymentStatus}`;

    const orderLabel =
        orderStatusLabels[order.status] ?? order.status;

    return (
        <main className="py-10 md:py-16">
            <Container>
                <div className="mx-auto max-w-3xl space-y-8">
                    {/* Cabeçalho da confirmação */}
                    <section className="flex flex-col items-center gap-4 text-center">
                        <div
                            className={`flex size-20 items-center justify-center rounded-full ${paymentMessage.iconStyle}`}
                        >
                            <PaymentIcon size={38} />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium uppercase tracking-wider text-muted">
                                Confirmação do pedido
                            </p>

                            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                                {paymentMessage.title}
                            </h1>

                            <p className="mx-auto max-w-xl text-muted">
                                {paymentMessage.description}
                            </p>
                        </div>
                    </section>

                    {/* Resumo geral */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pedido #{order.id}</CardTitle>

                            <CardDescription>
                                Realizado em {formatDate(order.createdAt)}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted">
                                        Status do pedido
                                    </p>

                                    <Badge
                                        variant={getOrderStatusVariant(order.status)}
                                    >
                                        {orderLabel}
                                    </Badge>
                                </div>

                                <div className="space-y-2 sm:text-right">
                                    <p className="text-sm text-muted">
                                        Status do pagamento
                                    </p>

                                    <Badge
                                        variant={getPaymentStatusVariant(order.paymentStatus)}
                                    >
                                        {paymentLabel}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-muted">
                                    Total da compra
                                </span>

                                <span className="text-xl font-bold text-foreground">
                                    {formatCurrency(order.totalAmount)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Produtos comprados */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo dos produtos</CardTitle>

                            <CardDescription>
                                {order.items.length}{' '}
                                {order.items.length === 1
                                    ? 'item no pedido'
                                    : 'itens no pedido'}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="divide-y divide-border">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <p className="font-semibold text-foreground">
                                                {item.productName}
                                            </p>

                                            <p className="text-sm text-muted">
                                                Cor: {item.colorName}
                                                {' · '}
                                                Tamanho: {item.sizeName}
                                            </p>

                                            <p className="text-sm text-muted">
                                                Quantidade: {item.quantity}
                                            </p>
                                        </div>

                                        <div className="shrink-0 sm:text-right">
                                            <p className="font-semibold text-foreground">
                                                {formatCurrency(
                                                    item.unitPrice * item.quantity,
                                                )}
                                            </p>

                                            <p className="text-xs text-muted">
                                                {formatCurrency(item.unitPrice)} cada
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Endereço de entrega */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <MapPin size={20} />

                                <CardTitle>Endereço de entrega</CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold text-foreground">
                                    {order.address.name}
                                </p>

                                <p className="text-muted">
                                    {order.address.street}, {order.address.number}
                                    {order.address.complement
                                        ? ` — ${order.address.complement}`
                                        : ''}
                                </p>

                                <p className="text-muted">
                                    {order.address.neighborhood}
                                    {' · '}
                                    {order.address.city} - {order.address.state}
                                </p>

                                <p className="text-muted">
                                    CEP: {order.address.zipCode}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Próximas ações */}
                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <Button
                            type="button"
                            variant="primary"
                            className="gap-2"
                            onClick={() =>
                                router.push(`/account/orders/${order.id}`)
                            }
                        >
                            <Package size={18} />
                            Ver detalhes do pedido
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            onClick={() => router.push('/')}
                        >
                            <ShoppingBag size={18} />
                            Continuar comprando
                        </Button>
                    </div>
                </div>
            </Container>
        </main>
    );
}
