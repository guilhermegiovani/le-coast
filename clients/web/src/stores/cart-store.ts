import { create } from 'zustand';

import type { ProductVariant } from '@/types/product';

export type CartItem = {
  productId: number;
  productName: string;
  productSlug: string;
  quantity: number;
  variant: ProductVariant;
};

type AddItemParams = {
  productId: number;
  productName: string;
  productSlug: string;
  variant: ProductVariant;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: AddItemParams) => void;
  clearCart: () => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
};

// Store responsável pelo estado compartilhado do carrinho.
export const useCartStore = create<CartStore>((set) => ({
  items: [],

  // Adiciona uma variante nova ou aumenta a quantidade caso ela já exista.
  addItem: ({
    productId,
    productName,
    productSlug,
    variant,
  }) =>
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.variant.id === variant.id,
      );

      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.variant.id === variant.id
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + 1,
                    item.variant.stock,
                  ),
                }
              : item,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            productId,
            productName,
            productSlug,
            quantity: 1,
            variant,
          },
        ],
      };
    }),

  clearCart: () => set({ items: [] }),

  removeItem: (variantId) =>
    set((state) => ({
      items: state.items.filter(
        (item) => item.variant.id !== variantId,
      ),
    })),

  updateQuantity: (variantId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.variant.id === variantId
          ? {
              ...item,
              quantity: Math.min(
                Math.max(quantity, 1),
                item.variant.stock,
              ),
            }
          : item,
      ),
    })),
}));