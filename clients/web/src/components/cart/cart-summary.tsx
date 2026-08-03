'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';

// Formata valores no padrão monetário brasileiro.
const priceFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Soma todas as unidades existentes no carrinho.
  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Soma o preço de cada variante multiplicado por sua quantidade.
  const subtotal = items.reduce(
    (total, item) =>
      total + item.variant.price * item.quantity,
    0,
  );

  const isCartEmpty = items.length === 0;

  return (
    <aside
      aria-labelledby="cart-summary-title"
      className="rounded-xl border border-border bg-surface p-6"
    >
      <h2
        id="cart-summary-title"
        className="text-xl font-semibold text-foreground"
      >
        Resumo do pedido
      </h2>

      <dl className="mt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted">
            Itens
          </dt>

          <dd className="text-sm font-medium text-foreground">
            {totalItems}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted">
            Subtotal
          </dt>

          <dd className="text-sm font-medium text-foreground">
            {priceFormatter.format(subtotal)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted">
            Frete
          </dt>

          <dd className="text-sm text-muted">
            Calculado no checkout
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <dt className="font-semibold text-foreground">
            Total
          </dt>

          <dd className="font-semibold text-foreground">
            {priceFormatter.format(subtotal)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/checkout"
          aria-disabled={isCartEmpty}
          className={
            isCartEmpty
              ? 'pointer-events-none inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white opacity-50'
              : 'inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90'
          }
        >
          Finalizar compra
        </Link>

        <Button
          type="button"
          variant="ghost"
          disabled={isCartEmpty}
          onClick={clearCart}
        >
          Esvaziar carrinho
        </Button>
      </div>
    </aside>
  );
}