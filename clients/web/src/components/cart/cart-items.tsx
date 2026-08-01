'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export function CartItems() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore(
    (state) => state.updateQuantity,
  );

  if (items.length === 0) {
    return (
      <p className="text-muted">
        Seu carrinho está vazio.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map(
        ({
          productName,
          productSlug,
          quantity,
          variant,
        }) => {
          const subtotal = variant.price * quantity;

          return (
            <li
              key={variant.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {/* Espaço temporário para a imagem da variante. */}
                <div
                  aria-hidden="true"
                  className="size-20 shrink-0 rounded-lg bg-muted"
                />

                <div className="flex flex-col gap-1">
                  <Link
                    href={`/products/${productSlug}`}
                    className="font-semibold text-foreground transition-colors duration-200 hover:text-primary"
                  >
                    {productName}
                  </Link>

                  <p className="text-sm text-muted">
                    Cor: {variant.color.name}
                  </p>

                  <p className="text-sm text-muted">
                    Tamanho: {variant.size.name}
                  </p>

                  <p className="text-sm text-muted">
                    Unitário:{' '}
                    {priceFormatter.format(variant.price)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                {/* Permite diminuir ou aumentar a quantidade sem ultrapassar o estoque. */}
                <div
                  aria-label={`Quantidade de ${productName}`}
                  className="flex items-center gap-2"
                  role="group"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Diminuir quantidade de ${productName}`}
                    disabled={quantity === 1}
                    onClick={() =>
                      updateQuantity(
                        variant.id,
                        quantity - 1,
                      )
                    }
                  >
                    -
                  </Button>

                  <span
                    aria-live="polite"
                    className="min-w-8 text-center text-sm font-medium text-foreground"
                  >
                    {quantity}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Aumentar quantidade de ${productName}`}
                    disabled={quantity === variant.stock}
                    onClick={() =>
                      updateQuantity(
                        variant.id,
                        quantity + 1,
                      )
                    }
                  >
                    +
                  </Button>
                </div>

                <p className="font-semibold text-foreground">
                  Subtotal: {priceFormatter.format(subtotal)}
                </p>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(variant.id)}
                >
                  Remover
                </Button>
              </div>
            </li>
          );
        },
      )}
    </ul>
  );
}