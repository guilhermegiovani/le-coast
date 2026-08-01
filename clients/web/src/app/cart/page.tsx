import { Container } from '@/components/layout/container';
import { CartItems } from '@/components/cart/cart-items';

export default function CartPage() {
  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-bold text-foreground">
            Carrinho
          </h1>

          <CartItems />
        </div>
      </Container>
    </main>
  );
}