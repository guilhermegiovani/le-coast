import Link from 'next/link';

import { Container } from '@/components/layout/container';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

const featuredProducts = [
  {
    href: '/products/1',
    id: 1,
    name: 'Top Essential',
    price: 'R$ 89,90',
  },
  {
    href: '/products/2',
    id: 2,
    name: 'Legging Move',
    price: 'R$ 149,90',
  },
  {
    href: '/products/3',
    id: 3,
    name: 'Maiô Coast',
    price: 'R$ 179,90',
  },
  {
    href: '/products/4',
    id: 4,
    name: 'Biquíni Sunset',
    price: 'R$ 139,90',
  },
];

export function FeaturedProducts() {
  return (
    <section
      aria-labelledby="featured-products-title"
      className="w-full py-12"
    >
      <Container>
        <div className="flex items-center justify-between">
          <h2
            id="featured-products-title"
            className="text-2xl font-semibold text-foreground"
          >
            Produtos em destaque
          </h2>

          <Link
            href="/products"
            className="text-sm text-primary transition-opacity duration-200 hover:opacity-90"
          >
            Ver todos
          </Link>
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <li key={product.id}>
              <Link
                href={product.href}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Card className="overflow-hidden transition-all duration-200 hover:ring-1 hover:ring-primary">
                  <div
                    aria-hidden="true"
                    className="h-40 w-full bg-muted"
                  />

                  <CardContent className="pt-6">
                    <CardTitle>{product.name}</CardTitle>

                    <p className="mt-2 text-sm text-foreground">
                      {product.price}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}