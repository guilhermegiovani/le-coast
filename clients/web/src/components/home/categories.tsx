import Link from 'next/link';

import { Container } from '@/components/layout/container';
import { Card } from '@/components/ui/card';

const categories = [
  {
    href: '/products?category=fitness',
    name: 'Fitness',
  },
  {
    href: '/products?category=beachwear',
    name: 'Beachwear',
  },
];

export function Categories() {
  return (
    <section aria-labelledby="categories-title" className="w-full py-12">
      <Container>
        <h2
          id="categories-title"
          className="text-2xl font-semibold text-foreground"
        >
          Compre por categoria
        </h2>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <li key={category.href}>
              <Link
                href={category.href}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Card className="p-4 transition-all duration-200 hover:ring-1 hover:ring-primary">
                  <div className="flex items-center gap-4">
                    <div
                      aria-hidden="true"
                      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-muted"
                    />

                    <h3 className="text-lg font-medium text-foreground">
                      {category.name}
                    </h3>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}