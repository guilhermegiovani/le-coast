import { prisma } from '../config/prisma.js';

/**
 * Busca o carrinho pertencente a um usuário.
 *
 * Os itens e suas variantes são carregados junto para que
 * o service tenha as informações necessárias do catálogo.
 */
export async function findCartByUserIdRepository(
  userId: number,
) {
  return prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        orderBy: {
          id: 'asc',
        },
        include: {
          variant: {
            include: {
              product: true,
              size: true,
              color: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Cria o carrinho do usuário quando ele ainda não possui um.
 */
export async function createCartRepository(
  userId: number,
) {
  return prisma.cart.create({
    data: {
      userId,
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
              size: true,
              color: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Busca um item específico dentro de um carrinho.
 *
 * A busca utiliza cartId + variantId porque uma mesma variante
 * não pode aparecer mais de uma vez no mesmo carrinho.
 */
export async function findCartItemByVariantRepository(
  cartId: number,
  variantId: number,
) {
  return prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId,
        variantId,
      },
    },
  });
}

/**
 * Adiciona uma variante ao carrinho.
 *
 * O preço é recebido pelo service a partir da ProductVariant
 * e armazenado como snapshot no momento da inclusão.
 */
export async function createCartItemRepository(data: {
  cartId: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
}) {
  return prisma.cartItem.create({
    data,
    include: {
      variant: {
        include: {
          product: true,
          size: true,
          color: true,
        },
      },
    },
  });
}

/**
 * Busca um item pelo seu id dentro de um carrinho.
 *
 * O cartId também é utilizado para garantir que o usuário
 * só manipule itens pertencentes ao próprio carrinho.
 */
export async function findCartItemByIdRepository(
  cartItemId: number,
  cartId: number,
) {
  return prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cartId,
    },
  });
}

/**
 * Atualiza a quantidade de um item existente.
 */
export async function updateCartItemRepository(
  cartItemId: number,
  quantity: number,
) {
  return prisma.cartItem.update({
    where: {
      id: cartItemId,
    },
    data: {
      quantity,
    },
    include: {
      variant: {
        include: {
          product: true,
          size: true,
          color: true,
        },
      },
    },
  });
}

/**
 * Remove um item do carrinho.
 */
export async function deleteCartItemRepository(
  cartItemId: number,
) {
  return prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });
}