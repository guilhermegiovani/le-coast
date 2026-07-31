import type {
  Product,
  ProductColor,
  ProductSize,
} from '@/types/product';

// Cores reutilizadas pelas variantes dos produtos.
const COLORS: Record<string, ProductColor> = {
  black: {
    id: 1,
    name: 'Preto',
    slug: 'preto',
  },
  blue: {
    id: 2,
    name: 'Azul-marinho',
    slug: 'azul-marinho',
  },
  pink: {
    id: 3,
    name: 'Rosa',
    slug: 'rosa',
  },
  sand: {
    id: 4,
    name: 'Areia',
    slug: 'areia',
  },
};

// Tamanhos reutilizados pelas variantes dos produtos.
const SIZES: Record<string, ProductSize> = {
  p: {
    id: 1,
    name: 'P',
    slug: 'p',
  },
  m: {
    id: 2,
    name: 'M',
    slug: 'm',
  },
  g: {
    id: 3,
    name: 'G',
    slug: 'g',
  },
};

// Fonte temporária única de produtos enquanto o banco ainda não está conectado.
export const PRODUCTS: Product[] = [
  {
    category: 'fitness',
    description:
      'Top fitness com sustentação, tecido confortável e modelagem pensada para acompanhar seus movimentos.',
    featured: true,
    id: 1,
    name: 'Top Essential',
    slug: 'top-essential',
    variants: [
      {
        color: COLORS.black,
        id: 1,
        price: 89.9,
        size: SIZES.p,
        sku: 'TOP-ESS-P-PRE',
        stock: 8,
      },
      {
        color: COLORS.black,
        id: 2,
        price: 89.9,
        size: SIZES.m,
        sku: 'TOP-ESS-M-PRE',
        stock: 12,
      },
      {
        color: COLORS.pink,
        id: 3,
        price: 89.9,
        size: SIZES.p,
        sku: 'TOP-ESS-P-ROS',
        stock: 5,
      },
      {
        color: COLORS.pink,
        id: 4,
        price: 89.9,
        size: SIZES.m,
        sku: 'TOP-ESS-M-ROS',
        stock: 7,
      },
    ],
  },
  {
    category: 'fitness',
    description:
      'Legging de cintura alta, ajuste confortável e tecido flexível para treinos e uso diário.',
    featured: true,
    id: 2,
    name: 'Legging Move',
    slug: 'legging-move',
    variants: [
      {
        color: COLORS.black,
        id: 5,
        price: 149.9,
        size: SIZES.p,
        sku: 'LEG-MOV-P-PRE',
        stock: 10,
      },
      {
        color: COLORS.black,
        id: 6,
        price: 149.9,
        size: SIZES.m,
        sku: 'LEG-MOV-M-PRE',
        stock: 9,
      },
      {
        color: COLORS.blue,
        id: 7,
        price: 149.9,
        size: SIZES.m,
        sku: 'LEG-MOV-M-AZU',
        stock: 6,
      },
      {
        color: COLORS.blue,
        id: 8,
        price: 149.9,
        size: SIZES.g,
        sku: 'LEG-MOV-G-AZU',
        stock: 4,
      },
    ],
  },
  {
    category: 'beachwear',
    description:
      'Maiô com modelagem elegante, confortável e ideal para praia ou piscina.',
    featured: true,
    id: 3,
    name: 'Maiô Coast',
    slug: 'maio-coast',
    variants: [
      {
        color: COLORS.black,
        id: 9,
        price: 179.9,
        size: SIZES.p,
        sku: 'MAI-COA-P-PRE',
        stock: 5,
      },
      {
        color: COLORS.black,
        id: 10,
        price: 179.9,
        size: SIZES.m,
        sku: 'MAI-COA-M-PRE',
        stock: 8,
      },
      {
        color: COLORS.sand,
        id: 11,
        price: 179.9,
        size: SIZES.m,
        sku: 'MAI-COA-M-ARE',
        stock: 3,
      },
      {
        color: COLORS.sand,
        id: 12,
        price: 179.9,
        size: SIZES.g,
        sku: 'MAI-COA-G-ARE',
        stock: 2,
      },
    ],
  },
  {
    category: 'beachwear',
    description:
      'Biquíni de modelagem confortável, com acabamento delicado e tecido de secagem rápida.',
    featured: true,
    id: 4,
    name: 'Biquíni Sunset',
    slug: 'biquini-sunset',
    variants: [
      {
        color: COLORS.pink,
        id: 13,
        price: 139.9,
        size: SIZES.p,
        sku: 'BIQ-SUN-P-ROS',
        stock: 7,
      },
      {
        color: COLORS.pink,
        id: 14,
        price: 139.9,
        size: SIZES.m,
        sku: 'BIQ-SUN-M-ROS',
        stock: 6,
      },
      {
        color: COLORS.sand,
        id: 15,
        price: 139.9,
        size: SIZES.m,
        sku: 'BIQ-SUN-M-ARE',
        stock: 4,
      },
      {
        color: COLORS.sand,
        id: 16,
        price: 139.9,
        size: SIZES.g,
        sku: 'BIQ-SUN-G-ARE',
        stock: 3,
      },
    ],
  },
];

// Retorna o menor preço disponível entre as variantes do produto.
export function getProductPrice(product: Product) {
  return Math.min(...product.variants.map((variant) => variant.price));
}

// Localiza um produto pelo slug usado na rota dinâmica.
export function getProductBySlug(slug: string) {
  return PRODUCTS.find((product) => product.slug === slug);
}