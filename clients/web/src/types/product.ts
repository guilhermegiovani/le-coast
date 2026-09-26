export type ProductCategory = {
    id: number;
    name: string;
    slug: string;
};

export type ProductSize = {
    id: number;
    name: string;
    slug: string;
};

export type ProductColor = {
    id: number;
    name: string;
    slug: string;
};

export type ProductVariant = {
    id: number;
    productId: number;
    sizeId: number;
    colorId: number;
    sku: string;
    price: number;
    stock: number;
    isActive: boolean;
    size: ProductSize;
    color: ProductColor;
};

export type Product = {
    id: number;
    categoryId: number;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category: ProductCategory;
    variants: ProductVariant[];
};