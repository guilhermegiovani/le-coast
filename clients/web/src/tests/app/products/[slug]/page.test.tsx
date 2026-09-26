import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductDetailsPage from '@/app/products/[slug]/page';
import { getProducts } from '@/services/product-service';
import type { Product } from '@/types/product';

const mockedNotFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => mockedNotFound(),
}));

vi.mock('@/services/product-service', () => ({
  getProducts: vi.fn(),
}));

const PRODUCTS: Product[] = [
  {
    id: 1,
    categoryId: 1,
    name: 'Top Essential',
    slug: 'top-essential',
    description:
      'Top fitness com sustentação, tecido confortável e modelagem pensada para acompanhar seus movimentos.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    category: {
      id: 1,
      name: 'Fitness',
      slug: 'fitness',
    },
    variants: [
      {
        id: 1,
        productId: 1,
        sizeId: 1,
        colorId: 1,
        sku: 'LC-TEST-PRETO-P',
        price: 89.9,
        stock: 8,
        isActive: true,
        size: {
          id: 1,
          name: 'P',
          slug: 'p',
        },
        color: {
          id: 1,
          name: 'Preto',
          slug: 'preto',
        },
      },
      {
        id: 2,
        productId: 1,
        sizeId: 2,
        colorId: 1,
        sku: 'LC-TEST-PRETO-M',
        price: 89.9,
        stock: 10,
        isActive: true,
        size: {
          id: 2,
          name: 'M',
          slug: 'm',
        },
        color: {
          id: 1,
          name: 'Preto',
          slug: 'preto',
        },
      },
      {
        id: 3,
        productId: 1,
        sizeId: 1,
        colorId: 2,
        sku: 'LC-TEST-ROSA-P',
        price: 89.9,
        stock: 10,
        isActive: true,
        size: {
          id: 1,
          name: 'P',
          slug: 'p',
        },
        color: {
          id: 2,
          name: 'Rosa',
          slug: 'rosa',
        },
      },
      {
        id: 4,
        productId: 1,
        sizeId: 2,
        colorId: 2,
        sku: 'LC-TEST-ROSA-M',
        price: 89.9,
        stock: 10,
        isActive: true,
        size: {
          id: 2,
          name: 'M',
          slug: 'm',
        },
        color: {
          id: 2,
          name: 'Rosa',
          slug: 'rosa',
        },
      },
    ],
  },
];

describe('ProductDetailsPage', () => {
  // Configura o produto retornado pela API antes de cada teste.
  vi.mocked(getProducts).mockResolvedValue(PRODUCTS);

  it('deve renderizar os detalhes do produto', async () => {
    const page = await ProductDetailsPage({
      params: Promise.resolve({
        slug: 'top-essential',
      }),
    });

    render(page);

    expect(
      screen.getByRole('heading', {
        name: 'Top Essential',
        level: 1,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('R$ 89,90')).toBeInTheDocument();

    expect(
      screen.getByText(
        'Top fitness com sustentação, tecido confortável e modelagem pensada para acompanhar seus movimentos.',
      ),
    ).toBeInTheDocument();
  });

  it('deve renderizar a galeria do produto', async () => {
    const page = await ProductDetailsPage({
      params: Promise.resolve({
        slug: 'top-essential',
      }),
    });

    render(page);

    expect(
      screen.getByRole('region', {
        name: 'Galeria de imagens de Top Essential',
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar os tamanhos disponíveis', async () => {
    const page = await ProductDetailsPage({
      params: Promise.resolve({
        slug: 'top-essential',
      }),
    });

    render(page);

    expect(
      screen.getByRole('button', {
        name: 'Selecionar tamanho P',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Selecionar tamanho M',
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Selecionar tamanho G',
      }),
    ).not.toBeInTheDocument();
  });

  it('deve renderizar as cores disponíveis', async () => {
    const page = await ProductDetailsPage({
      params: Promise.resolve({
        slug: 'top-essential',
      }),
    });

    render(page);

    expect(
      screen.getByRole('button', {
        name: 'Selecionar cor Preto',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Selecionar cor Rosa',
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Selecionar cor Azul-marinho',
      }),
    ).not.toBeInTheDocument();
  });

  it('deve renderizar o botão Adicionar ao carrinho habilitado', async () => {
    const page = await ProductDetailsPage({
      params: Promise.resolve({
        slug: 'top-essential',
      }),
    });

    render(page);

    expect(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    ).toBeEnabled();
  });

  it('deve chamar notFound quando o produto não existir', async () => {
    mockedNotFound.mockClear();

    await expect(
      ProductDetailsPage({
        params: Promise.resolve({
          slug: 'produto-inexistente',
        }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(mockedNotFound).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar o estoque da variante inicial', async () => {
    const page = await ProductDetailsPage({
      params: Promise.resolve({
        slug: 'top-essential',
      }),
    });

    render(page);

    expect(
      screen.getByText('8 unidades disponíveis'),
    ).toBeInTheDocument();
  });
});