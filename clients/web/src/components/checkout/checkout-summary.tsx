'use client';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';

export type CheckoutStep = 'delivery' | 'payment' | 'review';

type CheckoutSummaryProps = {
  currentStep: CheckoutStep;
  onFinalize: () => void;
};

// Formata valores no padrão monetário brasileiro.
const priceFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export function CheckoutSummary({
  currentStep,
  onFinalize,
}: CheckoutSummaryProps) {
  const items = useCartStore((state) => state.items);

  // Soma todas as unidades existentes no pedido.
  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Soma o valor total do pedido.
  const subtotal = items.reduce(
    (total, item) =>
      total + item.variant.price * item.quantity,
    0,
  );

  return (
    <aside
      aria-labelledby="checkout-summary-title"
      className="rounded-xl border border-border bg-surface p-6"
    >
      <h2
        id="checkout-summary-title"
        className="text-xl font-semibold text-foreground"
      >
        Resumo do pedido
      </h2>

      <dl className="mt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <dt className="text-sm text-muted">
            Itens
          </dt>

          <dd className="text-sm font-medium text-foreground">
            {totalItems}
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-sm text-muted">
            Subtotal
          </dt>

          <dd className="text-sm font-medium text-foreground">
            {priceFormatter.format(subtotal)}
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-sm text-muted">
            Frete
          </dt>

          <dd className="text-sm text-muted">
            Calculado após o CEP
          </dd>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <dt className="font-semibold text-foreground">
            Total
          </dt>

          <dd className="font-semibold text-foreground">
            {priceFormatter.format(subtotal)}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        {currentStep === 'delivery' && (
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-muted">
              O pagamento será liberado após preencher os dados de
              entrega.
            </p>
          </div>
        )}

        {currentStep === 'payment' && (
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-muted">
              Selecione uma forma de pagamento para continuar.
            </p>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-sm text-muted">
                Confira os dados de entrega e pagamento antes de
                concluir.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={items.length === 0}
              onClick={onFinalize}
            >
              Finalizar pedido
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}