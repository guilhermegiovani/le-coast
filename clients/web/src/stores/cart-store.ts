import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ProductVariant } from '@/types/product';
import {
  addCartItem,
  clearCartItems,
  deleteCartItem,
  getCart,
  updateCartItem,
} from '@/services/cart-service';

import { hasApiAccessToken } from '@/lib/api';

export type CartItem = {
  id: number;
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
  syncCartWithBackend: () => Promise<void>;
  addItem: (item: AddItemParams) => Promise<void>;
  clearCart: () => Promise<void>;
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

      // Busca o carrinho do usuário no backend e atualiza o Zustand
      // com os itens retornados pela API.
      loadCart: async () => {
        set({ isLoading: true });

        try {
          const cart = await getCart();

          set({
            items: cart.items.map((item) => ({
              id: item.id,
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

      // Mescla o carrinho persistido localmente com o carrinho do usuário no backend.
      // O backend continua sendo a fonte de verdade depois da sincronização.
      syncCartWithBackend: async () => {
        set({ isLoading: true });

        try {
          const backendCart = await getCart();

          const localItems = useCartStore.getState().items;

          for (const localItem of localItems) {
            const backendItem = backendCart.items.find(
              (item) => item.variantId === localItem.variant.id,
            );

            if (!backendItem) {
              await addCartItem({
                variantId: localItem.variant.id,
                quantity: Math.min(
                  localItem.quantity,
                  localItem.variant.stock,
                ),
              });

              continue;
            }

            const quantity = Math.min(
              backendItem.quantity + localItem.quantity,
              backendItem.variant.stock,
            );

            await updateCartItem(
              backendItem.id,
              quantity,
            );
          }

          // Recarrega o carrinho depois do merge para que o Zustand
          // fique exatamente alinhado com o estado persistido no backend.
          const synchronizedCart = await getCart();

          set({
            items: synchronizedCart.items.map((item) => ({
              id: item.id,
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
          if (!hasApiAccessToken()) {
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
                          variant.stock,
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
                    id: 0,
                    productId,
                    productName,
                    productSlug,
                    quantity: 1,
                    variant,
                  },
                ],
              };
            });

            return;
          }

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
                  id: cartItem.id,
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
      // Exclui os itens persistidos no backend antes de limpar o estado local.
      clearCart: async () => {
        if (hasApiAccessToken()) {
          await clearCartItems();
        }

        set({ items: [] });
      },

      // Remove uma variante específica do carrinho.

      // Remove uma variante do carrinho local e, quando autenticado,
      // também exclui o item persistido no backend.
      removeItem: async (variantId) => {
        const item = useCartStore.getState().items.find(
          (cartItem) => cartItem.variant.id === variantId,
        );

        if (!item) {
          return;
        }

        // Sem autenticação, a remoção acontece apenas no carrinho local.
        if (!hasApiAccessToken()) {
          set((state) => ({
            items: state.items.filter(
              (cartItem) => cartItem.variant.id !== variantId,
            ),
          }));

          return;
        }

        set({ isLoading: true });

        try {
          // Usa o ID do item do carrinho no backend, não o ID da variante.
          await deleteCartItem(item.id);

          set((state) => ({
            items: state.items.filter(
              (cartItem) => cartItem.variant.id !== variantId,
            ),
          }));
        } finally {
          set({ isLoading: false });
        }
      },


      // Atualiza a quantidade respeitando o mínimo de 1 e o estoque disponível.
      updateQuantity: async (variantId, quantity) => {
        const item = useCartStore.getState().items.find(
          (cartItem) => cartItem.variant.id === variantId,
        );

        if (!item) {
          return;
        }

        const nextQuantity = Math.min(
          Math.max(quantity, 1),
          item.variant.stock,
        );

        if (!hasApiAccessToken()) {
          set((state) => ({
            items: state.items.map((cartItem) =>
              cartItem.variant.id === variantId
                ? {
                  ...cartItem,
                  quantity: nextQuantity,
                }
                : cartItem,
            ),
          }));

          return;
        }

        set({ isLoading: true });

        try {
          const backendItem = await updateCartItem(
            item.id,
            nextQuantity,
          );

          set((state) => ({
            items: state.items.map((cartItem) =>
              cartItem.variant.id === variantId
                ? {
                  ...cartItem,
                  quantity: backendItem.quantity,
                  variant: backendItem.variant,
                }
                : cartItem,
            ),
          }));
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      // Chave utilizada pelo Zustand para salvar o carrinho no localStorage.
      name: 'le-coast-cart',
    },
  ),
);