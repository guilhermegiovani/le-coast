'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PaymentMethod = 'card' | 'pix';

type CheckoutPaymentProps = {
  onBack: () => void;
  onContinue: (paymentMethod: PaymentMethod) => void;
};

const PAYMENT_METHODS = [
  {
    description:
      'Pagamento rápido com QR Code e confirmação em poucos minutos.',
    label: 'PIX',
    value: 'pix',
  },
  {
    description:
      'Pagamento com cartão de crédito. Os dados serão preenchidos na próxima etapa.',
    label: 'Cartão de crédito',
    value: 'card',
  },
] satisfies {
  description: string;
  label: string;
  value: PaymentMethod;
}[];

export function CheckoutPayment({
  onBack,
  onContinue,
}: CheckoutPaymentProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod | null>(null);

  function handleContinue() {
    if (!selectedMethod) {
      return;
    }

    onContinue(selectedMethod);
  }

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
        Escolha como deseja pagar pelo pedido.
      </p>

      <div
        role="radiogroup"
        aria-labelledby="checkout-payment-title"
        className="mt-6 flex flex-col gap-3"
      >
        {PAYMENT_METHODS.map(
          ({ description, label, value }) => {
            const isSelected = selectedMethod === value;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={cn(
                  'rounded-xl border p-4 text-left transition-colors duration-200 cursor-pointer',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-primary',
                )}
                onClick={() => setSelectedMethod(value)}
              >
                <span className="font-medium text-foreground">
                  {label}
                </span>

                <span className="mt-1 block text-sm leading-6 text-muted">
                  {description}
                </span>
              </button>
            );
          },
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Voltar para entrega
        </Button>

        <Button
          type="button"
          variant="primary"
          disabled={!selectedMethod}
          onClick={handleContinue}
        >
          Revisar pedido
        </Button>
      </div>
    </section>
  );
}