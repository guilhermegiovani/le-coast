import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductsGrid } from '@/components/products/products-grid';

// Representa produtos fictícios utilizados nos testes.
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
];

// Agrupa os testes das responsabilidades do componente ProductsGrid.
describe('ProductsGrid', () => {
  // Garante que todos os produtos recebidos são renderizados.
  it('deve renderizar todos os produtos', () => {
    render(<ProductsGrid products={PRODUCTS} />);

    PRODUCTS.forEach(({ name }) => {
      expect(
        screen.getByRole('heading', {
          name,
          level: 3,
        }),
      ).toBeInTheDocument();
    });
  });

  // Garante que cada produto aponta para sua página de detalhes.
  it.each(PRODUCTS)(
    'deve renderizar o link correto para "$name"',
    ({ href, name }) => {
      render(<ProductsGrid products={PRODUCTS} />);

      expect(
        screen.getByRole('link', {
          name: new RegExp(name, 'i'),
        }),
      ).toHaveAttribute('href', href);
    },
  );

  // Garante que o componente renderiza corretamente quando não há produtos.
  it('deve renderizar a lista vazia quando não houver produtos', () => {
    render(<ProductsGrid products={[]} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});