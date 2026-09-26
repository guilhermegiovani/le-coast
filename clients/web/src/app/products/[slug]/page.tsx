import { notFound } from 'next/navigation';

import { Container } from '@/components/layout/container';
import { ProductGallery } from '@/components/products/product-gallery';
import { ProductInfo } from '@/components/products/product-info';
import { getProducts } from '@/services/product-service';

type ProductDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params;

  const products = await getProducts();

  // A rota utiliza o slug, então localizamos o produto retornado pela API.
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery productName={product.name} />
          <ProductInfo
            description={product.description ?? ''}
            name={product.name}
            productId={product.id}
            productSlug={product.slug}
            variants={product.variants}
          />
        </div>
      </Container>
    </main>
  );
}