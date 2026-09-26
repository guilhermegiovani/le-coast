import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ProductVariant } from '@/types/product';
import { addCartItem, getCart } from '@/services/cart-service';

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
  isLoading: boolean;
  loadCart: () => Promise<void>;
  addItem: (item: AddItemParams) => Promise<void>;
  clearCart: () => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (
    variantId: number,
    quantity: number,
  ) => void;
};

// Store responsável pelo estado compartilhado e persistente do carrinho.
export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isLoading: false,

      loadCart: async () => {
        set({ isLoading: true });

        try {
          const cart = await getCart();

          set({
            items: cart.items.map((item) => ({
              productId: item.variant.product.id,
              productName: item.variant.product.name,
              productSlug: item.variant.product.slug,
              quantity: item.quantity,
              variant: item.variant,
            })),
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Adiciona o item no backend e sincroniza a store com a resposta recebida.
      addItem: async ({
        productId,
        productName,
        productSlug,
        variant,
      }) => {
        set({ isLoading: true });

        try {
          const cartItem = await addCartItem({
            variantId: variant.id,
            quantity: 1,
          });

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
                      quantity: cartItem.quantity,
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
                  quantity: cartItem.quantity,
                  variant: cartItem.variant,
                },
              ],
            };
          });
        } finally {
          set({ isLoading: false });
        }
      },

      // Remove todos os itens do carrinho.
      clearCart: () => set({ items: [] }),

      // Remove uma variante específica do carrinho.
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.variant.id !== variantId,
          ),
        })),

      // Atualiza a quantidade respeitando o mínimo de 1 e o estoque disponível.
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
    }),
    {
      // Chave utilizada pelo Zustand para salvar o carrinho no localStorage.
      name: 'le-coast-cart',
    },
  ),
);