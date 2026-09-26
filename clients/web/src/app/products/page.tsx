import { Container } from '@/components/layout/container';
import { ProductsFilters } from '@/components/products/products-filters';
import { ProductsGrid } from '@/components/products/products-grid';
import { ProductsHeader } from '@/components/products/products-header';
import { getProducts } from '@/services/product-service';

export default async function ProductsPage() {
  const products = await getProducts();

  // Adapta os dados da API para o formato esperado pelo grid.
  const productsForGrid = products.map((product) => ({
    href: `/products/${product.slug}`,
    id: product.id,
    name: product.name,
    price: Math.min(...product.variants.map((variant) => variant.price)),
  }));

  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="flex flex-col gap-8">
          <ProductsHeader productsCount={productsForGrid.length} />

          <ProductsFilters />

          <ProductsGrid products={productsForGrid} />
        </div>
      </Container>
    </main>
  );
}