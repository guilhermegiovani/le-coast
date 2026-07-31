import { Container } from '@/components/layout/container';
import { ProductsFilters } from '@/components/products/products-filters';
import { ProductsGrid } from '@/components/products/products-grid';
import { ProductsHeader } from '@/components/products/products-header';
import { getProductPrice, PRODUCTS } from '@/data/products';

export default function ProductsPage() {
  // Adapta os dados completos dos produtos para o formato esperado pelo grid.
  const products = PRODUCTS.map((product) => ({
    href: `/products/${product.slug}`,
    id: product.id,
    name: product.name,
    price: getProductPrice(product),
  }));

  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="flex flex-col gap-8">
          <ProductsHeader productsCount={products.length} />

          <ProductsFilters />

          <ProductsGrid products={products} />
        </div>
      </Container>
    </main>
  );
}