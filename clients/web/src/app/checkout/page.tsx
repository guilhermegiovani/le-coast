import { CheckoutContent } from '@/components/checkout/checkout-content';
import { Container } from '@/components/layout/container';

export default function CheckoutPage() {
  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-foreground">
              Checkout
            </h1>

            <p className="text-muted">
              Confira seus dados e finalize seu pedido.
            </p>
          </header>

          <CheckoutContent />
        </div>
      </Container>
    </main>
  );
}