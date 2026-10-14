'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Container } from '@/components/layout/container';
import { getOrderById, type Order } from '@/services/order-service';
import { useAuth } from '@/contexts/auth-context';

export function CheckoutConfirmation() {
    const {
        isAuthenticated,
        isLoading: isAuthLoading,
    } = useAuth();

    const searchParams = useSearchParams();
    const orderId = searchParams.get('external_reference');
    const parsedOrderId = Number(orderId);

    const isValidOrderId = Number.isInteger(parsedOrderId) && parsedOrderId > 0;

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

                // Evita atualizar o estado se o componente já foi desmontado.
                if (!cancelled) {
                    setOrder(data);
                }
            } catch {
                if (!cancelled) {
                    setHasError(true);
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
            <main className="py-10 md:py-14">
                <Container>
                    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
                        <h1 className="text-3xl font-bold text-foreground">
                            Pedido não encontrado
                        </h1>

                        <p className="text-muted">
                            Não foi possível localizar os dados do seu pedido.
                        </p>
                    </div>
                </Container>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="py-10 md:py-14">
                <Container>
                    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
                        <h1 className="text-3xl font-bold text-foreground">
                            Carregando pedido...
                        </h1>
                    </div>
                </Container>
            </main>
        );
    }

    if (!isAuthLoading && !isAuthenticated) {
        return (
            <main className="py-10 md:py-14">
                <Container>
                    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
                        <h1 className="text-3xl font-bold text-foreground">
                            Faça login para consultar seu pedido
                        </h1>

                        <p className="text-muted">
                            Sua sessão não está autenticada. Entre na sua conta para consultar os dados do pedido.
                        </p>
                    </div>
                </Container>
            </main>
        );
    }

    if (!order) {
        return (
            <main className="py-10 md:py-14">
                <Container>
                    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
                        <h1 className="text-3xl font-bold text-foreground">
                            {hasError
                                ? 'Não foi possível carregar o pedido'
                                : 'Pedido não encontrado'}
                        </h1>

                        <p className="text-muted">
                            {hasError
                                ? 'Não foi possível consultar seu pedido. Verifique sua sessão e tente novamente.'
                                : 'Não foi possível localizar os dados do seu pedido.'}
                        </p>
                    </div>
                </Container>
            </main>
        );
    }

    const title =
        order.paymentStatus === 'PAID'
            ? 'Pagamento aprovado'
            : order.paymentStatus === 'PENDING'
                ? 'Pagamento pendente'
                : 'Pagamento não concluído';

    const description =
        order.paymentStatus === 'PAID'
            ? 'Recebemos seu pagamento e seu pedido está sendo processado.'
            : order.paymentStatus === 'PENDING'
                ? 'Seu pagamento ainda está sendo processado. Você poderá acompanhar o status do pedido em seus pedidos.'
                : 'Não foi possível concluir o pagamento. Você pode tentar novamente.';

    return (
        <main className="py-10 md:py-14">
            <Container>
                <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
                    <h1 className="text-3xl font-bold text-foreground">
                        {title}
                    </h1>

                    <p className="text-muted">{description}</p>

                    <p className="text-sm text-muted">Pedido #{order.id}</p>
                </div>
            </Container>
        </main>
    );
}