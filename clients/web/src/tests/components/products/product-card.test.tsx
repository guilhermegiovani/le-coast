import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductCard } from '@/components/products/product-card';

// Agrupa os testes das responsabilidades do componente ProductCard.
describe('ProductCard', () => {
  // Garante que o nome do produto aparece como título do card.
  it('deve renderizar o nome do produto', () => {
    render(
      <ProductCard
        href="/products/top-essential"
        name="Top Essential"
        price={89.9}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Top Essential',
        level: 3,
      }),
    ).toBeInTheDocument();
  });

  // Garante que o preço é exibido no formato monetário brasileiro.
  it('deve renderizar o preço formatado em reais', () => {
    render(
      <ProductCard
        href="/products/top-essential"
        name="Top Essential"
        price={89.9}
      />,
    );

    expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
  });

  // Garante que o card direciona para a página correta do produto.
  it('deve renderizar o link com o destino correto', () => {
    render(
      <ProductCard
        href="/products/top-essential"
        name="Top Essential"
        price={89.9}
      />,
    );

    const link = screen.getByRole('link', {
      name: /Top Essential/i,
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/products/top-essential');
  });
});