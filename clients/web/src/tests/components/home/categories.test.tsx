import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Categories } from '@/components/home/categories';

// Representa as categorias que esperamos encontrar no componente.
// Esses dados serão reutilizados no teste parametrizado com it.each.
const CATEGORY_LINKS = [
  ['Fitness', '/products?category=fitness'],
  ['Beachwear', '/products?category=beachwear'],
] as const;

// Agrupa todos os testes relacionados ao componente Categories.
describe('Categories', () => {
  // Verifica se o título da seção é renderizado como um heading de nível 2.
  it('deve renderizar o heading da seção', () => {
    render(<Categories />);

    expect(
      screen.getByRole('heading', {
        name: 'Compre por categoria',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Executa o mesmo teste para cada categoria do array CATEGORY_LINKS.
  // Verifica se cada categoria é renderizada como um link e aponta para a rota correta.
  it.each(CATEGORY_LINKS)(
    'deve renderizar o link da categoria %s',
    (name, href) => {
      render(<Categories />);

      const link = screen.getByRole('link', { name });

      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    },
  );
});