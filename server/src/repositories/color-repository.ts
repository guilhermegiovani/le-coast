import { prisma } from '../config/prisma.js';

/**
 * Busca uma cor pelo identificador.
 *
 * A existência da cor é validada pelo service antes
 * da criação ou alteração de uma variante.
 */
export async function findColorByIdRepository(
    colorId: number,
) {
    return prisma.color.findUnique({
        where: {
            id: colorId,
        },
    });
}