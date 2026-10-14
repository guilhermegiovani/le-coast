import { api } from '@/lib/api';
import type { ProductVariant } from '@/types/product';

type CartProduct = {
  id: number;
  name: string;
  slug: string;
};

type CartVariant = ProductVariant & {
  product: CartProduct;
};

/**
 * Representa um item persistido no carrinho do usuário.
 *
 * O id pertence ao CartItem no banco e será utilizado
 * para atualizar ou remover o item posteriormente.
 */
export type CartItem = {
  id: number;
  cartId: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  variant: CartVariant;
};

/**
 * Representa o carrinho retornado pela API.
 */
export type Cart = {
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Dados necessários para adicionar uma variante ao carrinho.
 */
export type AddCartItemInput = {
  variantId: number;
  quantity: number;
};

/**
 * Busca o carrinho do usuário autenticado.
 *
 * O backend cria o carrinho automaticamente caso ele ainda
 * não exista para o usuário.
 */
export async function getCart(): Promise<Cart> {
  const response = await api.get<Cart>('/cart');

  return response.data;
}

/**
 * Adiciona uma variante ao carrinho do usuário autenticado.
 */
export async function addCartItem(
  data: AddCartItemInput,
): Promise<CartItem> {
  const response = await api.post<CartItem>(
    '/cart/items',
    data,
  );

  return response.data;
}

/**
 * Atualiza a quantidade de um item já existente no carrinho.
 */
export async function updateCartItem(
  cartItemId: number,
  quantity: number,
): Promise<CartItem> {
  const response = await api.patch<CartItem>(
    `/cart/items/${cartItemId}`,
    { quantity },
  );

  return response.data;
}

/**
 * Remove um item específico do carrinho.
 */
export async function deleteCartItem(
  cartItemId: number,
): Promise<void> {
  await api.delete(`/cart/items/${cartItemId}`);
}

/**
 * Remove todos os itens do carrinho do usuário autenticado.
 */
export async function clearCartItems(): Promise<void> {
  await api.delete('/cart/items');
}