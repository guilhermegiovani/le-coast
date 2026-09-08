import { prisma } from '../config/prisma.js';

/**
 * Busca uma categoria pelo seu identificador.
 *
 * O service utiliza essa consulta para garantir que um produto
 * não seja associado a uma categoria inexistente.
 */
export async function findCategoryByIdRepository(
    categoryId: number,
) {
    return prisma.category.findUnique({
        where: {
            id: categoryId,
        },
    });
}