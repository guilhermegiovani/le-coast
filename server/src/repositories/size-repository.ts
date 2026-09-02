import { prisma } from '../config/prisma.js';

/**
 * Busca um tamanho pelo identificador.
 *
 * A existência do tamanho é validada pelo service antes
 * da criação ou alteração de uma variante.
 */
export async function findSizeByIdRepository(
    sizeId: number,
) {
    return prisma.size.findUnique({
        where: {
            id: sizeId,
        },
    });
}