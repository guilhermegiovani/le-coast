import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductsHeader } from '@/components/products/products-header';

// Agrupa os testes das responsabilidades do componente ProductsHeader.
describe('ProductsHeader', () => {
  // Garante que o título principal da página é exibido.
  it('deve renderizar o título da página', () => {
    render(<ProductsHeader productsCount={8} />);

    expect(
      screen.getByRole('heading', {
        name: 'Produtos',
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  // Garante que o componente exibe corretamente o texto no singular.
  it('deve renderizar a quantidade no singular', () => {
    render(<ProductsHeader productsCount={1} />);

    expect(
      screen.getByText('1 produto encontrado'),
    ).toBeInTheDocument();
  });

  // Garante que o componente exibe corretamente o texto no plural.
  it('deve renderizar a quantidade no plural', () => {
    render(<ProductsHeader productsCount={8} />);

    expect(
      screen.getByText('8 produtos encontrados'),
    ).toBeInTheDocument();
  });
});