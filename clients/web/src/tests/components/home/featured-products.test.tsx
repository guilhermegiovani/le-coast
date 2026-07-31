import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FeaturedProducts } from '@/components/home/featured-products';

// Representa os produtos marcados como destaque na fonte centralizada.
const FEATURED_PRODUCTS = [
  {
    href: '/products/top-essential',
    name: 'Top Essential',
    price: 'R$ 89,90',
  },
  {
    href: '/products/legging-move',
    name: 'Legging Move',
    price: 'R$ 149,90',
  },
  {
    href: '/products/maio-coast',
    name: 'Maiô Coast',
    price: 'R$ 179,90',
  },
  {
    href: '/products/biquini-sunset',
    name: 'Biquíni Sunset',
    price: 'R$ 139,90',
  },
];

// Agrupa os testes das responsabilidades do componente FeaturedProducts.
describe('FeaturedProducts', () => {
  // Garante que o título da seção é renderizado como heading de nível 2.
  it('deve renderizar o título da seção', () => {
    render(<FeaturedProducts />);

    expect(
      screen.getByRole('heading', {
        name: 'Produtos em destaque',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Garante que o link para a listagem completa de produtos está disponível.
  it('deve renderizar o link Ver todos', () => {
    render(<FeaturedProducts />);

    expect(
      screen.getByRole('link', {
        name: 'Ver todos',
      }),
    ).toHaveAttribute('href', '/products');
  });

  // Garante que todos os produtos destacados são exibidos na Home.
  it('deve renderizar os quatro produtos em destaque', () => {
    render(<FeaturedProducts />);

    expect(
      screen.getAllByRole('heading', {
        level: 3,
      }),
    ).toHaveLength(4);
  });

  // Garante que cada produto exibe seu nome.
  it.each(FEATURED_PRODUCTS)(
    'deve renderizar o produto "$name"',
    ({ name }) => {
      render(<FeaturedProducts />);

      expect(
        screen.getByRole('heading', {
          name,
          level: 3,
        }),
      ).toBeInTheDocument();
    },
  );

  // Garante que cada card aponta para a página correta de detalhes.
  it.each(FEATURED_PRODUCTS)(
    'deve renderizar o link correto para "$name"',
    ({ href, name }) => {
      render(<FeaturedProducts />);

      expect(
        screen.getByRole('link', {
          name: new RegExp(name, 'i'),
        }),
      ).toHaveAttribute('href', href);
    },
  );

  // Garante que os preços vindos das variantes são formatados em reais.
  it.each(FEATURED_PRODUCTS)(
    'deve renderizar o preço de "$name"',
    ({ price }) => {
      render(<FeaturedProducts />);

      expect(screen.getByText(price)).toBeInTheDocument();
    },
  );
});