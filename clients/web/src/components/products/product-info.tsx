import { Button } from '@/components/ui/button';
import type {
  ProductColor,
  ProductSize,
} from '@/types/product';

type ProductInfoProps = {
  colors: ProductColor[];
  description: string;
  name: string;
  price: number;
  sizes: ProductSize[];
};

// Formata o preço no padrão monetário brasileiro.
const priceFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export function ProductInfo({
  colors,
  description,
  name,
  price,
  sizes,
}: ProductInfoProps) {
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
      </div>

      {/* Exibe os tamanhos disponíveis entre as variantes do produto. */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">
          Tamanho
        </p>

        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size.id}
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Selecionar tamanho ${size.name}`}
            >
              {size.name}
            </Button>
          ))}
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
              variant="outline"
              size="sm"
              aria-label={`Selecionar cor ${color.name}`}
            >
              {color.name}
            </Button>
          ))}
        </div>
      </div>

      <Button type="button" size="lg">
        Adicionar ao carrinho
      </Button>
    </section>
  );
}