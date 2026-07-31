import Link from 'next/link';

import {
  Card,
  CardContent,
  CardTitle,
} from '@/components/ui/card';

type ProductCardProps = {
  href: string;
  name: string;
  price: number;
};

// Formata o preço numérico para o padrão monetário brasileiro.
const priceFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export function ProductCard({
  href,
  name,
  price,
}: ProductCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card className="h-full overflow-hidden transition-all duration-200 hover:ring-1 hover:ring-primary">
        {/* Espaço temporário que será substituído pela imagem real do produto. */}
        <div
          aria-hidden="true"
          className="aspect-[3/4] w-full bg-muted"
        />

        <CardContent className="pt-6">
          <CardTitle>{name}</CardTitle>

          <p className="mt-2 text-sm font-medium text-foreground">
            {priceFormatter.format(price)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}