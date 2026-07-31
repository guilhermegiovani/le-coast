import { Button } from '@/components/ui/button';

type ProductInfoProps = {
  description: string;
  name: string;
  price: number;
};

// Formata o preço no padrão monetário brasileiro.
const priceFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export function ProductInfo({
  description,
  name,
  price,
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

      {/* As opções reais serão conectadas às variações do produto futuramente. */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">
          Tamanho
        </p>

        <div className="flex flex-wrap gap-2">
          {['P', 'M', 'G'].map((size) => (
            <Button
              key={size}
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Selecionar tamanho ${size}`}
            >
              {size}
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