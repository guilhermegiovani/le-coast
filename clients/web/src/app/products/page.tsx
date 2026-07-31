import { Container } from '@/components/layout/container';
import { ProductsFilters } from '@/components/products/products-filters';
import { ProductsGrid } from '@/components/products/products-grid';
import { ProductsHeader } from '@/components/products/products-header';

// Produtos temporários usados enquanto a página ainda não está conectada ao banco.
const PRODUCTS = [
  {
    href: '/products/top-essential',
    id: 1,
    name: 'Top Essential',
    price: 89.9,
  },
  {
    href: '/products/legging-move',
    id: 2,
    name: 'Legging Move',
    price: 149.9,
  },
  {
    href: '/products/maio-coast',
    id: 3,
    name: 'Maiô Coast',
    price: 179.9,
  },
  {
    href: '/products/biquini-sunset',
    id: 4,
    name: 'Biquíni Sunset',
    price: 139.9,
  },
  {
    href: '/products/top-flow',
    id: 5,
    name: 'Top Flow',
    price: 99.9,
  },
  {
    href: '/products/short-active',
    id: 6,
    name: 'Short Active',
    price: 119.9,
  },
  {
    href: '/products/saida-coast',
    id: 7,
    name: 'Saída Coast',
    price: 129.9,
  },
  {
    href: '/products/body-wave',
    id: 8,
    name: 'Body Wave',
    price: 189.9,
  },
];

export default function ProductsPage() {
  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="flex flex-col gap-8">
          <ProductsHeader productsCount={PRODUCTS.length} />

          <ProductsFilters />

          <ProductsGrid products={PRODUCTS} />
        </div>
      </Container>
    </main>
  );
}