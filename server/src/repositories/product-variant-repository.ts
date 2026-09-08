import { prisma } from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';

/**
 * Busca variações ativas pelos seus identificadores.
 *
 * Também carrega produto, tamanho e cor porque essas
 * informações serão utilizadas para criar o snapshot
 * histórico dos itens do pedido.
 */
export async function findActiveProductVariantsByIds(
  variantIds: number[],
) {
  return prisma.productVariant.findMany({
    where: {
      id: {
        in: variantIds,
      },
      isActive: true,

      // Um produto inativo não deve continuar sendo vendido
      // mesmo que sua variação ainda esteja ativa.
      product: {
        isActive: true,
      },
    },
    include: {
      product: true,
      size: true,
      color: true,
    },
  });
}

// Cria uma nova variante de produto.
export async function createProductVariantRepository(data: {
  productId: number;
  sizeId: number;
  colorId: number;
  sku: string;
  price: number;
  stock?: number;
}) {
  return prisma.productVariant.create({
    data,
    include: {
      product: true,
      size: true,
      color: true,
    },
  });
}

/**
 * Busca uma variante específica pelo id.
 *
 * Produto, tamanho e cor são carregados porque essas
 * informações fazem parte da representação da variante.
 */
export async function findProductVariantByIdRepository(
  variantId: number,
) {
  return prisma.productVariant.findUnique({
    where: {
      id: variantId,
    },
    include: {
      product: true,
      size: true,
      color: true,
    },
  });
}

/**
 * Lista as variantes ativas de um produto.
 *
 * Somente variantes ativas devem aparecer no catálogo público.
 */
export async function findProductVariantsByProductIdRepository(
  productId: number,
) {
  return prisma.productVariant.findMany({
    where: {
      productId,
      isActive: true,
    },
    orderBy: {
      id: 'asc',
    },
    include: {
      size: true,
      color: true,
    },
  });
}

/**
 * Busca uma variante pelo SKU.
 *
 * O service utiliza essa consulta para detectar
 * conflitos de SKU antes da criação ou atualização.
 */
export async function findProductVariantBySkuRepository(
  sku: string,
) {
  return prisma.productVariant.findUnique({
    where: {
      sku,
    },
  });
}

/**
 * Busca uma variante pela combinação de produto,
 * tamanho e cor.
 *
 * A mesma combinação não pode existir duas vezes,
 * conforme a constraint UNIQUE do schema.
 */
export async function findProductVariantByCombinationRepository(
  productId: number,
  sizeId: number,
  colorId: number,
) {
  return prisma.productVariant.findUnique({
    where: {
      productId_sizeId_colorId: {
        productId,
        sizeId,
        colorId,
      },
    },
  });
}

/**
 * Atualiza os dados de uma variante existente.
 */
export async function updateProductVariantRepository(
  variantId: number,
  data: {
    sizeId?: number;
    colorId?: number;
    sku?: string;
    price?: number;
    stock?: number;
    isActive?: boolean;
  },
) {
  return prisma.productVariant.update({
    where: {
      id: variantId,
    },
    data,
    include: {
      product: true,
      size: true,
      color: true,
    },
  });
}

/**
 * Baixa o estoque de uma variante de forma atômica.
 *
 * A condição stock >= quantity impede que uma atualização
 * reduza o estoque abaixo de zero mesmo em operações concorrentes.
 */
export async function decrementProductVariantStockRepository(
  variantId: number,
  quantity: number,
  transaction?: Prisma.TransactionClient,
) {
  const transactionClient = transaction ?? prisma;

  return transactionClient.productVariant.updateMany({
    where: {
      id: variantId,
      stock: {
        gte: quantity,
      },
    },
    data: {
      stock: {
        decrement: quantity,
      },
    },
  });
}