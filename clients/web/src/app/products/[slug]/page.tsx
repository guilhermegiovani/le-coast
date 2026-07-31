import { notFound } from 'next/navigation';

import { Container } from '@/components/layout/container';
import { ProductGallery } from '@/components/products/product-gallery';
import { ProductInfo } from '@/components/products/product-info';

type ProductDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Produtos temporários usados até conectarmos a página ao banco de dados.
const PRODUCTS = [
  {
    description:
      'Top fitness com sustentação, tecido confortável e modelagem pensada para acompanhar seus movimentos.',
    name: 'Top Essential',
    price: 89.9,
    slug: 'top-essential',
  },
  {
    description:
      'Legging de cintura alta, ajuste confortável e tecido flexível para treinos e uso diário.',
    name: 'Legging Move',
    price: 149.9,
    slug: 'legging-move',
  },
  {
    description:
      'Maiô com modelagem elegante, confortável e ideal para praia ou piscina.',
    name: 'Maiô Coast',
    price: 179.9,
    slug: 'maio-coast',
  },
];

// Busca um produto pelo slug recebido na URL.
function getProductBySlug(slug: string) {
  return PRODUCTS.find((product) => product.slug === slug);
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  // Exibe a página padrão de não encontrado quando o produto não existe.
  if (!product) {
    notFound();
  }

  return (
    <main className="py-10 md:py-14">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery productName={product.name} />

          <ProductInfo
            description={product.description}
            name={product.name}
            price={product.price}
          />
        </div>
      </Container>
    </main>
  );
}