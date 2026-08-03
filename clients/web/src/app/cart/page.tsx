import { Container } from '@/components/layout/container';
import { CartItems } from '@/components/cart/cart-items';
import { CartSummary } from '@/components/cart/cart-summary';

export default function CartPage() {
  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-foreground">
              Carrinho
            </h1>

            <p className="text-muted">
              Revise seus produtos antes de finalizar a compra.
            </p>
          </header>

          <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-start">
            <CartItems />

            <CartSummary />
          </div>
        </div>
      </Container>
    </main>
  );
}