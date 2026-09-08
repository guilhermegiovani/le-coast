import { AppError } from '../errors/app-error.js';

import {
    findProductByIdRepository,
} from '../repositories/product-repository.js';

import {
    createProductVariantRepository,
    findProductVariantByCombinationRepository,
    findProductVariantByIdRepository,
    findProductVariantBySkuRepository,
    findProductVariantsByProductIdRepository,
    updateProductVariantRepository,
} from '../repositories/product-variant-repository.js';

import {
    findSizeByIdRepository,
} from '../repositories/size-repository.js';

import {
    findColorByIdRepository,
} from '../repositories/color-repository.js';

import {
    createProductVariantSchema,
    type CreateProductVariantInput,
    updateProductVariantSchema,
    type UpdateProductVariantInput,
} from '../validators/product-variant-validator.js';

/**
 * Cria uma nova variante de produto.
 *
 * Antes da persistência, valida a existência das entidades
 * relacionadas e impede conflitos de SKU e combinação.
 */
export async function createProductVariant(
    data: CreateProductVariantInput,
) {
    const input =
        createProductVariantSchema.parse(data);

    // A variante precisa pertencer a um produto existente.
    const product = await findProductByIdRepository(input.productId);

    if (!product) {
        throw new AppError(
            'Produto não encontrado.',
            404,
        );
    }

    // O tamanho informado precisa existir.
    const size = await findSizeByIdRepository(input.sizeId);

    if (!size) {
        throw new AppError(
            'Tamanho não encontrado.',
            404,
        );
    }

    // A cor informada precisa existir.
    const color = await findColorByIdRepository(input.colorId);

    if (!color) {
        throw new AppError(
            'Cor não encontrada.',
            404,
        );
    }

    // SKU identifica a variante individualmente.
    const existingSku = await findProductVariantBySkuRepository(input.sku);

    if (existingSku) {
        throw new AppError(
            'Já existe uma variante com este SKU.',
            409,
        );
    }

    // A combinação produto + tamanho + cor também
    // precisa ser única.
    const existingCombination =
        await findProductVariantByCombinationRepository(
            input.productId,
            input.sizeId,
            input.colorId,
        );

    if (existingCombination) {
        throw new AppError(
            'Já existe uma variante com esta combinação de produto, tamanho e cor.',
            409,
        );
    }

    return createProductVariantRepository({
        productId: input.productId,
        sizeId: input.sizeId,
        colorId: input.colorId,
        sku: input.sku,
        price: input.price,
        ...(input.stock !== undefined && {
            stock: input.stock,
        }),
    });
}

/**
 * Busca uma variante específica.
 *
 * Produtos/variantes inativos continuam podendo ser consultados
 * internamente, por isso o filtro de disponibilidade fica separado.
 */
export async function getProductVariantById(
    variantId: number,
) {
    return findProductVariantByIdRepository(
        variantId,
    );
}

/**
 * Lista as variantes ativas de um produto.
 */
export async function listProductVariantsByProductId(
    productId: number,
) {
    const product = await findProductByIdRepository(productId);

    if (!product) {
        throw new AppError(
            'Produto não encontrado.',
            404,
        );
    }

    return findProductVariantsByProductIdRepository(
        productId,
    );
}

/**
 * Atualiza uma variante existente.
 *
 * productId não pode ser alterado; tamanho e cor podem,
 * desde que a nova combinação ainda seja única.
 */
export async function updateProductVariant(
    variantId: number,
    data: UpdateProductVariantInput,
) {
    const input = updateProductVariantSchema.parse(data);

    const variant = await findProductVariantByIdRepository(variantId);

    if (!variant) {
        throw new AppError(
            'Variante não encontrada.',
            404,
        );
    }

    // Se o tamanho foi alterado, ele precisa existir.
    if (input.sizeId !== undefined) {
        const size = await findSizeByIdRepository(input.sizeId);

        if (!size) {
            throw new AppError(
                'Tamanho não encontrado.',
                404,
            );
        }
    }

    // Se a cor foi alterada, ela precisa existir.
    if (input.colorId !== undefined) {
        const color = await findColorByIdRepository(input.colorId);

        if (!color) {
            throw new AppError(
                'Cor não encontrada.',
                404,
            );
        }
    }

    // Só precisamos consultar o SKU quando ele realmente mudou.
    if (
        input.sku !== undefined &&
        input.sku !== variant.sku
    ) {
        const existingSku = await findProductVariantBySkuRepository(input.sku);

        if (existingSku) {
            throw new AppError(
                'Já existe uma variante com este SKU.',
                409,
            );
        }
    }

    const newSizeId = input.sizeId ?? variant.sizeId;

    const newColorId = input.colorId ?? variant.colorId;

    // Se tamanho ou cor mudaram, verifica a nova combinação.
    if (
        newSizeId !== variant.sizeId ||
        newColorId !== variant.colorId
    ) {
        const existingCombination =
            await findProductVariantByCombinationRepository(
                variant.productId,
                newSizeId,
                newColorId,
            );

        // A variante atual não deve ser considerada um conflito
        // caso a consulta retorne o próprio registro.
        if (
            existingCombination &&
            existingCombination.id !== variant.id
        ) {
            throw new AppError(
                'Já existe uma variante com esta combinação de produto, tamanho e cor.',
                409,
            );
        }
    }

    return updateProductVariantRepository(
        variantId,
        {
            ...(input.sizeId !== undefined && {
                sizeId: input.sizeId,
            }),
            ...(input.colorId !== undefined && {
                colorId: input.colorId,
            }),
            ...(input.sku !== undefined && {
                sku: input.sku,
            }),
            ...(input.price !== undefined && {
                price: input.price,
            }),
            ...(input.stock !== undefined && {
                stock: input.stock,
            }),
            ...(input.isActive !== undefined && {
                isActive: input.isActive,
            }),
        },
    );
}