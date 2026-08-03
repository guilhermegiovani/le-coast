'use client';

import { Button } from '@/components/ui/button';

type CheckoutPaymentProps = {
  onBack: () => void;
};

export function CheckoutPayment({
  onBack,
}: CheckoutPaymentProps) {
  return (
    <section
      aria-labelledby="checkout-payment-title"
      className="rounded-xl border border-border bg-surface p-6"
    >
      <h2
        id="checkout-payment-title"
        className="text-xl font-semibold text-foreground"
      >
        Pagamento
      </h2>

      <p className="mt-2 text-sm text-muted">
        A seleção da forma de pagamento será implementada nesta etapa.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Voltar para entrega
        </Button>

        <Button type="button">
          Revisar pedido
        </Button>
      </div>
    </section>
  );
}