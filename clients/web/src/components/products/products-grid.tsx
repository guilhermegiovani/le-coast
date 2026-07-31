import { ProductCard } from '@/components/products/product-card';

type Product = {
  href: string;
  id: number;
  name: string;
  price: number;
};

type ProductsGridProps = {
  products: Product[];
};

export function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            href={product.href}
            name={product.name}
            price={product.price}
          />
        </li>
      ))}
    </ul>
  );
}