import type {
    Request,
    Response,
} from 'express';

import { AppError } from '../errors/app-error.js';

import {
    createProductVariant,
    getProductVariantById,
    listProductVariantsByProductId,
    updateProductVariant,
} from '../services/product-variant-service.js';

/**
 * Cria uma variante para um produto.
 *
 * O productId vem da URL, e não do body.
 * Dessa forma, a variante sempre será vinculada
 * ao produto indicado pela própria rota.
 */
export async function createProductVariantController(
    request: Request,
    response: Response,
) {
    const productId = Number(
        request.params.productId,
    );

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        throw new AppError(
            'Produto inválido.',
            400,
        );
    }

    const variant = await createProductVariant({
        ...request.body,
        productId,
    });

    return response.status(201).json(variant);
}

/**
 * Lista as variantes ativas de um produto.
 */
export async function listProductVariantsController(
    request: Request,
    response: Response,
) {
    const productId = Number(
        request.params.productId,
    );

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        throw new AppError(
            'Produto inválido.',
            400,
        );
    }

    const variants =
        await listProductVariantsByProductId(
            productId,
        );

    return response.status(200).json(variants);
}

/**
 * Busca uma variante específica.
 */
export async function getProductVariantByIdController(
    request: Request,
    response: Response,
) {
    const variantId = Number(
        request.params.variantId,
    );

    if (
        !Number.isInteger(variantId) ||
        variantId <= 0
    ) {
        throw new AppError(
            'Variante inválida.',
            400,
        );
    }

    const variant =
        await getProductVariantById(
            variantId,
        );

    if (!variant) {
        throw new AppError(
            'Variante não encontrada.',
            404,
        );
    }

    return response.status(200).json(variant);
}

/**
 * Atualiza os dados de uma variante.
 *
 * O productId não é alterado: ele serve apenas para
 * organizar a rota e identificar o recurso dentro do catálogo.
 */
export async function updateProductVariantController(
    request: Request,
    response: Response,
) {
    const variantId = Number(
        request.params.variantId,
    );

    if (
        !Number.isInteger(variantId) ||
        variantId <= 0
    ) {
        throw new AppError(
            'Variante inválida.',
            400,
        );
    }

    const variant =
        await updateProductVariant(
            variantId,
            request.body,
        );

    return response.status(200).json(variant);
}