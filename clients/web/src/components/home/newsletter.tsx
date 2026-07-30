'use client';

import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Newsletter() {
  return (
    <section aria-labelledby="newsletter-title" className="w-full py-12">
      <Container>
        <div className="max-w-3xl">
          <h2
            id="newsletter-title"
            className="text-2xl font-semibold text-foreground"
          >
            Receba novidades da Le Coast
          </h2>

          <p className="mt-2 text-sm text-muted">
            Inscreva-se para receber novidades, lançamentos e promoções direto
            no seu e-mail.
          </p>

          <form className="mt-4 w-full">
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <div className="w-full flex-1">
                <Input
                  autoComplete="email"
                  label="Seu e-mail"
                  name="email"
                  placeholder="voce@exemplo.com"
                  required
                  type="email"
                />
              </div>

              <Button
                type="submit"
                className="w-full shrink-0 sm:w-auto sm:self-end"
              >
                Quero receber
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
}