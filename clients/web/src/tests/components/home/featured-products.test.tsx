import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FeaturedProducts } from '@/components/home/featured-products';

// Representa os produtos que esperamos encontrar no componente.
// Esses dados serão reutilizados nos testes com it.each.
const FEATURED_PRODUCTS = [
  {
    href: '/products/1',
    name: 'Top Essential',
    price: 'R$ 89,90',
  },
  {
    href: '/products/2',
    name: 'Legging Move',
    price: 'R$ 149,90',
  },
  {
    href: '/products/3',
    name: 'Maiô Coast',
    price: 'R$ 179,90',
  },
  {
    href: '/products/4',
    name: 'Biquíni Sunset',
    price: 'R$ 139,90',
  },
] as const;

// Agrupa todos os testes relacionados ao componente FeaturedProducts.
describe('FeaturedProducts', () => {
  // Renderiza o componente e verifica se o título da seção aparece como um h2.
  it('deve renderizar o heading da seção', () => {
    render(<FeaturedProducts />);

    const heading = screen.getByRole('heading', {
      name: 'Produtos em destaque',
      level: 2,
    });

    expect(heading).toBeInTheDocument();
  });

  // Verifica se o link "Ver todos" existe e aponta para a página de produtos.
  it('deve renderizar o link Ver todos com o destino correto', () => {
    render(<FeaturedProducts />);

    const link = screen.getByRole('link', {
      name: 'Ver todos',
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/products');
  });

  // Executa o mesmo teste para cada produto do array FEATURED_PRODUCTS.
  // Verifica se cada card é um link e se aponta para a página correta.
  it.each(FEATURED_PRODUCTS)(
    'deve renderizar o link do produto $name com o destino correto',
    ({ href, name }) => {
      render(<FeaturedProducts />);

      // O nome acessível do link contém o nome e o preço do produto.
      // Por isso usamos RegExp para procurar apenas pelo nome.
      const link = screen.getByRole('link', {
        name: new RegExp(name, 'i'),
      });

      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    },
  );

  // Executa o mesmo teste para cada produto e verifica se seu preço é exibido.
  it.each(FEATURED_PRODUCTS)(
    'deve renderizar o preço do produto $name',
    ({ price }) => {
      render(<FeaturedProducts />);

      const productPrice = screen.getByText(price);

      expect(productPrice).toBeInTheDocument();
    },
  );
});