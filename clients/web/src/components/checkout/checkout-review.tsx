import { Button } from '@/components/ui/button';

import type { CheckoutFormData } from '@/components/checkout/checkout-form';
import type { PaymentMethod } from '@/components/checkout/checkout-payment';

type CheckoutReviewProps = {
  formData: CheckoutFormData;
  onBack: () => void;
  paymentMethod: PaymentMethod;
};

export function CheckoutReview({
  formData,
  onBack,
  paymentMethod,
}: CheckoutReviewProps) {
  return (
    <section
      aria-labelledby="checkout-review-title"
      className="rounded-xl border border-border bg-surface p-6"
    >
      <h2
        id="checkout-review-title"
        className="text-xl font-semibold text-foreground"
      >
        Revisão do pedido
      </h2>

      <p className="mt-2 text-sm text-muted">
        Confira seus dados antes de finalizar.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        <div>
          <h3 className="font-semibold text-foreground">
            Dados de contato
          </h3>

          <p className="mt-2 text-sm text-muted">
            {formData.name}
          </p>

          <p className="text-sm text-muted">
            {formData.email}
          </p>

          <p className="text-sm text-muted">
            {formData.phone}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground">
            Endereço de entrega
          </h3>

          <p className="mt-2 text-sm text-muted">
            {formData.street}, {formData.number}
          </p>

          {formData.complement && (
            <p className="text-sm text-muted">
              {formData.complement}
            </p>
          )}

          <p className="text-sm text-muted">
            {formData.neighborhood}
          </p>

          <p className="text-sm text-muted">
            {formData.city} - {formData.state}
          </p>

          <p className="text-sm text-muted">
            CEP: {formData.zipCode}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground">
            Forma de pagamento
          </h3>

          <p className="mt-2 text-sm text-muted">
            {paymentMethod === 'pix'
              ? 'PIX'
              : 'Cartão de crédito'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Voltar para pagamento
        </Button>
      </div>
    </section>
  );
}