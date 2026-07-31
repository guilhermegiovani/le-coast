import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductsFilters } from '@/components/products/products-filters';

// Agrupa os testes das responsabilidades do componente ProductsFilters.
describe('ProductsFilters', () => {
  // Garante que o formulário possui um nome acessível.
  it('deve renderizar o formulário de filtros', () => {
    render(<ProductsFilters />);

    expect(
      screen.getByRole('form', {
        name: 'Filtros de produtos',
      }),
    ).toBeInTheDocument();
  });

  // Garante que o campo de busca é renderizado com os atributos esperados.
  it('deve renderizar o campo de busca', () => {
    render(<ProductsFilters />);

    const searchInput = screen.getByRole('searchbox', {
      name: 'Buscar produtos',
    });

    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('name', 'search');
    expect(searchInput).toHaveAttribute(
      'placeholder',
      'Digite o nome do produto',
    );
  });

  // Garante que o filtro de categoria possui as opções disponíveis.
  it('deve renderizar o filtro de categoria', () => {
    render(<ProductsFilters />);

    const categorySelect = screen.getByRole('combobox', {
      name: 'Categoria',
    });

    expect(categorySelect).toBeInTheDocument();
    expect(categorySelect).toHaveAttribute('name', 'category');

    expect(
      screen.getByRole('option', {
        name: 'Todas as categorias',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'Fitness',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'Beachwear',
      }),
    ).toBeInTheDocument();
  });

  // Garante que o controle de ordenação possui as opções disponíveis.
  it('deve renderizar o controle de ordenação', () => {
    render(<ProductsFilters />);

    const sortSelect = screen.getByRole('combobox', {
      name: 'Ordenar por',
    });

    expect(sortSelect).toBeInTheDocument();
    expect(sortSelect).toHaveAttribute('name', 'sort');

    expect(
      screen.getByRole('option', {
        name: 'Destaques',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'Menor preço',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'Maior preço',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('option', {
        name: 'Nome',
      }),
    ).toBeInTheDocument();
  });

  // Garante que os valores iniciais dos filtros estão corretos.
  it('deve iniciar com os valores padrão', () => {
    render(<ProductsFilters />);

    expect(
      screen.getByRole('combobox', {
        name: 'Categoria',
      }),
    ).toHaveValue('');

    expect(
      screen.getByRole('combobox', {
        name: 'Ordenar por',
      }),
    ).toHaveValue('featured');
  });
});