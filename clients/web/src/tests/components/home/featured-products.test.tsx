import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FeaturedProducts } from '@/components/home/featured-products';
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

describe('FeaturedProducts', () => {
  // Configura a resposta da API antes de cada teste.
  vi.mocked(getProducts).mockResolvedValue(PRODUCTS);

  it('deve renderizar o título da seção', async () => {
    const page = await FeaturedProducts();

    render(page);

    expect(
      screen.getByRole('heading', {
        name: 'Produtos em destaque',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar o link Ver todos', async () => {
    const page = await FeaturedProducts();

    render(page);

    expect(
      screen.getByRole('link', {
        name: 'Ver todos',
      }),
    ).toHaveAttribute('href', '/products');
  });

  it('deve renderizar os quatro produtos em destaque', async () => {
    const page = await FeaturedProducts();

    render(page);

    expect(
      screen.getAllByRole('heading', {
        level: 3,
      }),
    ).toHaveLength(4);
  });

  it.each(FEATURED_PRODUCTS)(
    'deve renderizar o produto "$name"',
    async ({ name }) => {
      const page = await FeaturedProducts();

      render(page);

      expect(
        screen.getByRole('heading', {
          name,
          level: 3,
        }),
      ).toBeInTheDocument();
    },
  );

  it.each(FEATURED_PRODUCTS)(
    'deve renderizar o link correto para "$name"',
    async ({ href, name }) => {
      const page = await FeaturedProducts();

      render(page);

      expect(
        screen.getByRole('link', {
          name: new RegExp(name, 'i'),
        }),
      ).toHaveAttribute('href', href);
    },
  );

  it.each(FEATURED_PRODUCTS)(
    'deve renderizar o preço de "$name"',
    async ({ price }) => {
      const page = await FeaturedProducts();

      render(page);

      expect(screen.getByText(price)).toBeInTheDocument();
    },
  );
});