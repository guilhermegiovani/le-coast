import { prisma } from '../config/prisma.js';

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