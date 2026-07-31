export type ProductColor = {
  id: number;
  name: string;
  slug: string;
};

export type ProductSize = {
  id: number;
  name: string;
  slug: string;
};

export type ProductVariant = {
  id: number;
  color: ProductColor;
  price: number;
  size: ProductSize;
  sku: string;
  stock: number;
};

export type Product = {
  category: 'fitness' | 'beachwear';
  description: string;
  featured: boolean;
  id: number;
  name: string;
  slug: string;
  variants: ProductVariant[];
};