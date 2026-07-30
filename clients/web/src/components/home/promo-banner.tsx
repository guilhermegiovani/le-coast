import Link from 'next/link';

import { Container } from '@/components/layout/container';
import { buttonVariants } from '@/components/ui/button';

export function PromoBanner() {
  return (
    <section aria-labelledby="promo-banner-title" className="w-full py-12">
      <Container>
        <div className="grid grid-cols-1 items-center gap-6 rounded-lg bg-surface p-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-primary">Nova coleção</p>

            <h2
              id="promo-banner-title"
              className="mt-2 text-2xl font-bold text-foreground md:text-3xl"
            >
              Movimento, conforto e estilo
            </h2>

            <p className="mt-4 max-w-lg text-sm text-muted">
              Peças pensadas para quem busca desempenho e beleza — da academia
              à praia, com materiais leves e cortes que valorizam o movimento.
            </p>

            <div className="mt-6">
              <Link
                href="/products"
                className={buttonVariants({
                  size: 'md',
                  variant: 'primary',
                })}
              >
                Conheça a coleção
              </Link>
            </div>
          </div>

          <div className="w-full">
            <div
              aria-hidden="true"
              className="h-48 w-full rounded-md bg-muted md:h-64"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}