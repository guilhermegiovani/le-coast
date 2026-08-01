'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import type { ProductVariant } from '@/types/product';

type ProductInfoProps = {
  description: string;
  name: string;
  productId: number;
  productSlug: string;
  variants: ProductVariant[];
};

// Formata o preço no padrão monetário brasileiro.
const priceFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export function ProductInfo({
  description,
  name,
  productId,
  productSlug,
  variants,
}: ProductInfoProps) {
  const colors = Array.from(
    new Map(
      variants.map((variant) => [
        variant.color.id,
        variant.color,
      ]),
    ).values(),
  );

  const sizes = Array.from(
    new Map(
      variants.map((variant) => [
        variant.size.id,
        variant.size,
      ]),
    ).values(),
  );

  // Usa a primeira variante para garantir uma combinação inicial válida.
  const firstVariant = variants[0];

  const [selectedColorId, setSelectedColorId] = useState(
    firstVariant.color.id,
  );

  const [selectedSizeId, setSelectedSizeId] = useState(
    firstVariant.size.id,
  );

  const addItem = useCartStore((state) => state.addItem);

  // Localiza a variante correspondente à cor e ao tamanho selecionados.
  const selectedVariant = useMemo(
    () =>
      variants.find(
        (variant) =>
          variant.color.id === selectedColorId &&
          variant.size.id === selectedSizeId,
      ),
    [selectedColorId, selectedSizeId, variants],
  );

  const price =
    selectedVariant?.price ?? variants[0]?.price ?? 0;

  // Seleciona uma cor e mantém o tamanho atual quando a combinação existir.
  // Caso contrário, escolhe o primeiro tamanho disponível para a nova cor.
  function handleColorSelect(colorId: number) {
    const variantWithCurrentSize = variants.find(
      (variant) =>
        variant.color.id === colorId &&
        variant.size.id === selectedSizeId &&
        variant.stock > 0,
    );

    const firstAvailableVariant = variants.find(
      (variant) =>
        variant.color.id === colorId &&
        variant.stock > 0,
    );

    const fallbackVariant = variants.find(
      (variant) => variant.color.id === colorId,
    );

    const nextVariant =
      variantWithCurrentSize ??
      firstAvailableVariant ??
      fallbackVariant;

    setSelectedColorId(colorId);

    if (nextVariant) {
      setSelectedSizeId(nextVariant.size.id);
    }
  }

  // Adiciona ao carrinho os dados do produto junto com a variante selecionada.
  function handleAddToCart() {
    if (!selectedVariant || selectedVariant.stock === 0) {
      return;
    }

    addItem({
      productId,
      productName: name,
      productSlug,
      variant: selectedVariant,
    });
  }

  return (
    <section
      aria-labelledby="product-title"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        <h1
          id="product-title"
          className="text-3xl font-bold text-foreground"
        >
          {name}
        </h1>

        <p className="text-xl font-semibold text-foreground">
          {priceFormatter.format(price)}
        </p>

        <p className="text-sm leading-6 text-muted">
          {description}
        </p>

        <p className="text-sm text-muted">
          {selectedVariant
            ? `${selectedVariant.stock} unidades disponíveis`
            : 'Combinação indisponível'}
        </p>
      </div>

      {/* Exibe os tamanhos disponíveis entre as variantes do produto. */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">
          Tamanho
        </p>

        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            // Verifica se este tamanho existe para a cor selecionada.
            const sizeVariant = variants.find(
              (variant) =>
                variant.color.id === selectedColorId &&
                variant.size.id === size.id,
            );

            const isUnavailable =
              !sizeVariant || sizeVariant.stock === 0;

            return (
              <Button
                key={size.id}
                type="button"
                variant={
                  selectedSizeId === size.id
                    ? 'primary'
                    : 'outline'
                }
                size="sm"
                aria-label={`Selecionar tamanho ${size.name}`}
                aria-pressed={selectedSizeId === size.id}
                disabled={isUnavailable}
                onClick={() => setSelectedSizeId(size.id)}
              >
                {size.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Exibe as cores disponíveis entre as variantes do produto. */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">
          Cor
        </p>

        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <Button
              key={color.id}
              type="button"
              variant={
                selectedColorId === color.id
                  ? 'primary'
                  : 'outline'
              }
              size="sm"
              aria-label={`Selecionar cor ${color.name}`}
              aria-pressed={selectedColorId === color.id}
              onClick={() => handleColorSelect(color.id)}
            >
              {color.name}
            </Button>
          ))}
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        disabled={!selectedVariant || selectedVariant.stock === 0}
        onClick={handleAddToCart}
      >
        Adicionar ao carrinho
      </Button>
    </section>
  );
}