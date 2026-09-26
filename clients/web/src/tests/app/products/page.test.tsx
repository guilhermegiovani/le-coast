import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductsPage from '@/app/products/page';
import { getProducts } from '@/services/product-service';
import type { Product } from '@/types/product';

vi.mock('@/services/product-service', () => ({
  getProducts: vi.fn(),
}));

const PRODUCTS: Product[] = [
  {
    id: 1,
    categoryId: 1,
    name: 'Top Essential',
    slug: 'top-essential',
    description: 'Top esportivo feminino.',
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
        sku: 'LC-TEST-PRETO-M',
        price: 89.9,
        stock: 10,
        isActive: true,
        size: {
          id: 1,
          name: 'M',
          slug: 'm',
        },
        color: {
          id: 1,
          name: 'Preto',
          slug: 'preto',
        },
      },
    ],
  },
  {
    id: 2,
    categoryId: 1,
    name: 'Legging Move',
    slug: 'legging-move',
    description: 'Legging esportiva feminina.',
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
        id: 2,
        productId: 2,
        sizeId: 1,
        colorId: 1,
        sku: 'LC-TEST-LEGGING-M',
        price: 149.9,
        stock: 10,
        isActive: true,
        size: {
          id: 1,
          name: 'M',
          slug: 'm',
        },
        color: {
          id: 1,
          name: 'Preto',
          slug: 'preto',
        },
      },
    ],
  },
  {
    id: 3,
    categoryId: 2,
    name: 'Maiô Coast',
    slug: 'maio-coast',
    description: 'Maiô feminino.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    category: {
      id: 2,
      name: 'Beachwear',
      slug: 'beachwear',
    },
    variants: [
      {
        id: 3,
        productId: 3,
        sizeId: 1,
        colorId: 1,
        sku: 'LC-TEST-MAIO-M',
        price: 179.9,
        stock: 10,
        isActive: true,
        size: {
          id: 1,
          name: 'M',
          slug: 'm',
        },
        color: {
          id: 1,
          name: 'Preto',
          slug: 'preto',
        },
      },
    ],
  },
  {
    id: 4,
    categoryId: 2,
    name: 'Biquíni Sunset',
    slug: 'biquini-sunset',
    description: 'Biquíni feminino.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    category: {
      id: 2,
      name: 'Beachwear',
      slug: 'beachwear',
    },
    variants: [
      {
        id: 4,
        productId: 4,
        sizeId: 1,
        colorId: 1,
        sku: 'LC-TEST-BIQUINI-M',
        price: 139.9,
        stock: 10,
        isActive: true,
        size: {
          id: 1,
          name: 'M',
          slug: 'm',
        },
        color: {
          id: 1,
          name: 'Preto',
          slug: 'preto',
        },
      },
    ],
  },
];

describe('ProductsPage', () => {
  // Configura a resposta da API antes de cada teste.
  vi.mocked(getProducts).mockResolvedValue(PRODUCTS);

  it('deve renderizar o título da página', async () => {
    const page = await ProductsPage();

    render(page);

    expect(
      screen.getByRole('heading', {
        name: 'Produtos',
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar a quantidade de produtos', async () => {
    const page = await ProductsPage();

    render(page);

    expect(
      screen.getByText('4 produtos encontrados'),
    ).toBeInTheDocument();
  });

  it('deve renderizar os filtros de produtos', async () => {
    const page = await ProductsPage();

    render(page);

    expect(
      screen.getByRole('form', {
        name: 'Filtros de produtos',
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar os quatro produtos', async () => {
    const page = await ProductsPage();

    render(page);

    expect(
      screen.getAllByRole('heading', {
        level: 3,
      }),
    ).toHaveLength(4);
  });

  it('deve renderizar o link do produto com o destino correto', async () => {
    const page = await ProductsPage();

    render(page);

    expect(
      screen.getByRole('link', {
        name: /Top Essential/i,
      }),
    ).toHaveAttribute('href', '/products/top-essential');
  });
});