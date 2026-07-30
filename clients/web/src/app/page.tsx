import { Categories } from '@/components/home/categories';
import { FeaturedProducts } from '@/components/home/featured-products';
import { Hero } from '@/components/home/hero';
import { Newsletter } from '@/components/home/newsletter';
import { PromoBanner } from '@/components/home/promo-banner';

export default function Home() {
  return (
    <main>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <PromoBanner />
      <Newsletter />
    </main>
  );
}
