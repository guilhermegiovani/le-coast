// Controller responsável por receber as requisições HTTP
// relacionadas aos produtos e delegar as regras ao service.
import type {
    Request,
    Response,
} from 'express';

import { AppError } from '../errors/app-error.js';
import {
    createProduct,
    getProductById,
    listProducts,
    updateProduct,
} from '../services/product-service.js';

/**
 * Cria um novo produto.
 *
 * A autorização de ADMIN será aplicada na rota.
 * O controller fica responsável apenas pela camada HTTP.
 */
export async function createProductController(
    request: Request,
    response: Response,
) {
    const product = await createProduct(
        request.body,
    );

    return response.status(201).json(product);
}

/**
 * Lista os produtos disponíveis no catálogo.
 *
 * O repository já filtra produtos e variantes inativas,
 * portanto o controller apenas retorna o resultado.
 */
export async function listProductsController(
    _request: Request,
    response: Response,
) {
    const products = await listProducts();

    return response.status(200).json(products);
}

/**
 * Busca um produto específico pelo id.
 */
export async function getProductByIdController(
    request: Request,
    response: Response,
) {
    const productId = Number(request.params.id);

    // Evita que valores inválidos sejam enviados
    // para a camada de service/repository.
    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        throw new AppError(
            'Produto inválido.',
            400,
        );
    }

    const product =
        await getProductById(productId);

    if (!product) {
        throw new AppError(
            'Produto não encontrado.',
            404,
        );
    }

    return response.status(200).json(product);
}

/**
 * Atualiza os dados básicos de um produto.
 *
 * A autorização para alteração ficará restrita a ADMIN
 * na definição da rota.
 */
export async function updateProductController(
    request: Request,
    response: Response,
) {
    const productId = Number(request.params.id);

    // Garante que o identificador represente
    // um produto válido.
    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        throw new AppError(
            'Produto inválido.',
            400,
        );
    }

    const product = await updateProduct(
        productId,
        request.body,
    );

    return response.status(200).json(product);
}