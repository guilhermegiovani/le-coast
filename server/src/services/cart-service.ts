import { AppError } from '../errors/app-error.js';

import {
  createCartRepository,
  findCartByUserIdRepository,
  findCartItemByVariantRepository,
  findCartItemByIdRepository,
  createCartItemRepository,
  updateCartItemRepository,
  deleteCartItemRepository,
} from '../repositories/cart-repository.js';

import {
  findActiveProductVariantsByIds,
} from '../repositories/product-variant-repository.js';

import {
  addCartItemSchema,
  type AddCartItemInput,
} from '../validators/cart-validator.js';

export async function getUserCart(
  userId: number,
) {
  // Cada usuário possui um único carrinho ativo.
  // Se ainda não existir, ele é criado automaticamente.
  const cart =
    await findCartByUserIdRepository(userId);

  if (cart) {
    return cart;
  }

  return createCartRepository(userId);
}

/**
 * Adiciona uma variante ao carrinho do usuário.
 *
 * O preço utilizado é obtido diretamente da variante ativa
 * no banco e armazenado no CartItem como snapshot.
 */
export async function addCartItem(
  userId: number,
  data: AddCartItemInput,
) {
  const input = addCartItemSchema.parse(data);

  // Obtém o carrinho existente ou cria um novo.
  let cart =
    await findCartByUserIdRepository(userId);

  if (!cart) {
    cart = await createCartRepository(userId);
  }

  // Busca a variante diretamente pelo repository de variantes.
  const variants =
    await findActiveProductVariantsByIds([
      input.variantId,
    ]);

  const variant = variants[0];

  if (!variant) {
    throw new AppError(
      'Variação do produto não encontrada ou está indisponível.',
      404,
    );
  }

  // A quantidade solicitada não pode ultrapassar
  // o estoque atualmente disponível.
  if (input.quantity > variant.stock) {
    throw new AppError(
      `Estoque insuficiente para a variação ${variant.sku}.`,
      400,
    );
  }

  // A mesma variante não pode aparecer duas vezes
  // dentro do mesmo carrinho.
  const existingItem =
    await findCartItemByVariantRepository(
      cart.id,
      input.variantId,
    );

  if (existingItem) {
    throw new AppError(
      'A variação já está no carrinho.',
      409,
    );
  }

  return createCartItemRepository({
    cartId: cart.id,
    variantId: variant.id,
    quantity: input.quantity,
    unitPrice: Number(variant.price),
  });
}

/**
 * Atualiza a quantidade de um item do carrinho.
 *
 * O item precisa pertencer ao carrinho do usuário e a nova
 * quantidade não pode ultrapassar o estoque disponível.
 */
export async function updateCartItem(
  userId: number,
  cartItemId: number,
  quantity: number,
) {
  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    throw new AppError(
      'A quantidade deve ser maior que zero.',
      400,
    );
  }

  const cart =
    await findCartByUserIdRepository(userId);

  if (!cart) {
    throw new AppError(
      'Carrinho não encontrado.',
      404,
    );
  }

  const cartItem =
    await findCartItemByIdRepository(
      cartItemId,
      cart.id,
    );

  if (!cartItem) {
    throw new AppError(
      'Item do carrinho não encontrado.',
      404,
    );
  }

  const variants =
    await findActiveProductVariantsByIds([
      cartItem.variantId,
    ]);

  const variant = variants[0];

  if (!variant) {
    throw new AppError(
      'Variação do produto não encontrada ou está indisponível.',
      404,
    );
  }

  if (quantity > variant.stock) {
    throw new AppError(
      `Estoque insuficiente para a variação ${variant.sku}.`,
      400,
    );
  }

  return updateCartItemRepository(
    cartItemId,
    quantity,
  );
}

/**
 * Remove um item do carrinho.
 *
 * Antes da remoção, garantimos que o item pertence
 * ao carrinho do usuário autenticado.
 */
export async function deleteCartItem(
  userId: number,
  cartItemId: number,
) {
  const cart =
    await findCartByUserIdRepository(userId);

  if (!cart) {
    throw new AppError(
      'Carrinho não encontrado.',
      404,
    );
  }

  const cartItem =
    await findCartItemByIdRepository(
      cartItemId,
      cart.id,
    );

  if (!cartItem) {
    throw new AppError(
      'Item do carrinho não encontrado.',
      404,
    );
  }

  return deleteCartItemRepository(
    cartItemId,
  );
}