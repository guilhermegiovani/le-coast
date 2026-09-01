import { prisma } from '../config/prisma.js';

/**
 * Cria um produto associado a uma categoria.
 */
export async function createProductRepository(data: {
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
}) {
  return prisma.product.create({
    data,
  });
}

/**
 * Busca um produto pelo id.
 *
 * As variantes também são carregadas porque fazem parte
 * das informações necessárias para exibir um produto completo.
 */
export async function findProductByIdRepository(
  productId: number,
) {
  return prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
      variants: {
        where: {
          isActive: true,
        },
        include: {
          size: true,
          color: true,
        },
      },
    },
  });
}

/**
 * Lista os produtos disponíveis para o catálogo.
 *
 * Produtos inativos não devem aparecer para clientes.
 */
export async function findProductsRepository() {
  return prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      category: true,
      variants: {
        where: {
          isActive: true,
        },
        include: {
          size: true,
          color: true,
        },
      },
    },
  });
}

/**
 * Atualiza os dados básicos de um produto.
 */
export async function updateProductRepository(
  productId: number,
  data: {
    categoryId?: number;
    name?: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
  },
) {
  return prisma.product.update({
    where: {
      id: productId,
    },
    data,
  });
}

/**
 * Busca um produto pelo slug.
 *
 * O service utiliza essa consulta para tratar explicitamente
 * conflitos de slug antes de tentar persistir o produto.
 */
export async function findProductBySlugRepository(
  slug: string,
) {
  return prisma.product.findUnique({
    where: {
      slug,
    },
  });
}