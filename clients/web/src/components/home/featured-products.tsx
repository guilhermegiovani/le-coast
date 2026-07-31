import Link from 'next/link';

import { Container } from '@/components/layout/container';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getProductPrice, PRODUCTS } from '@/data/products';

// Seleciona apenas os produtos marcados para aparecer na vitrine da Home.
const featuredProducts = PRODUCTS.filter(
  (product) => product.featured,
);

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

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
                href={`/products/${product.slug}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Card className="overflow-hidden transition-all duration-200 hover:ring-1 hover:ring-primary">
                  {/* Espaço temporário para a imagem do produto. */}
                  <div
                    aria-hidden="true"
                    className="h-40 w-full bg-muted"
                  />

                  <CardContent className="pt-6">
                    <CardTitle>{product.name}</CardTitle>

                    <p className="mt-2 text-sm text-foreground">
                      {priceFormatter.format(
                        getProductPrice(product),
                      )}
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