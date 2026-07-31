import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ProductsPage from '@/app/products/page';

// Agrupa os testes da página de listagem de produtos.
describe('ProductsPage', () => {
  // Garante que o título principal da página é renderizado.
  it('deve renderizar o título da página', () => {
    render(<ProductsPage />);

    expect(
      screen.getByRole('heading', {
        name: 'Produtos',
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  // Garante que a quantidade total de produtos mockados é exibida.
  it('deve renderizar a quantidade de produtos', () => {
    render(<ProductsPage />);

    expect(
      screen.getByText('4 produtos encontrados'),
    ).toBeInTheDocument();
  });

  // Garante que os controles de filtro estão presentes na página.
  it('deve renderizar os filtros de produtos', () => {
    render(<ProductsPage />);

    expect(
      screen.getByRole('form', {
        name: 'Filtros de produtos',
      }),
    ).toBeInTheDocument();
  });

  // Garante que todos os produtos mockados são exibidos.
  it('deve renderizar os quatro produtos', () => {
    render(<ProductsPage />);

    expect(
      screen.getAllByRole('heading', {
        level: 3,
      }),
    ).toHaveLength(4);
  });

  // Garante que um produto importante da lista aponta para seu destino.
  it('deve renderizar o link do produto com o destino correto', () => {
    render(<ProductsPage />);

    expect(
      screen.getByRole('link', {
        name: /Top Essential/i,
      }),
    ).toHaveAttribute('href', '/products/top-essential');
  });
});