import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section aria-label="Hero" className="w-full py-12 md:py-20">
      <Container>
        <div className="flex flex-col items-center md:grid md:grid-cols-2 md:gap-8">
          <div className="w-full">
            <h1 className="text-2xl font-extrabold text-foreground md:text-4xl">
              Moda Fitness & Beachwear
            </h1>

            <p className="mt-4 max-w-xl text-sm text-muted">
              Peças criadas para acompanhar seu treino, seus momentos de lazer
              e sua rotina com conforto e estilo.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button>Comprar agora</Button>

              <Button>Ver coleção</Button>
            </div>
          </div>

          <div className="mt-8 w-full md:mt-0">
            <div
              aria-hidden="true"
              className="flex h-64 w-full items-center justify-center rounded-lg bg-surface md:h-80"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}