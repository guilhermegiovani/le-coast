import type {
    Request,
    Response,
} from 'express';

import { AppError } from '../errors/app-error.js';

import {
    addCartItem,
    deleteCartItem,
    getUserCart,
    updateCartItem,
} from '../services/cart-service.js';


function getAuthenticatedUserId(
    request: Request,
) {
    if (!request.user) {
        throw new AppError(
            'Usuário não autenticado.',
            401,
        );
    }

    return request.user.id;
}

/**
 * Retorna o carrinho do usuário autenticado.
 *
 * Caso o usuário ainda não possua um carrinho,
 * o service cria um automaticamente.
 */
export async function getUserCartController(
    request: Request,
    response: Response,
) {
    const userId = getAuthenticatedUserId(request);

    const cart = await getUserCart(userId,);

    return response.status(200).json(cart);
}

/**
 * Adiciona uma variante ao carrinho do usuário autenticado.
 *
 * O userId vem do JWT e a validação dos dados
 * fica na camada de service.
 */
export async function addCartItemController(
    request: Request,
    response: Response,
) {
    const userId = getAuthenticatedUserId(request);

    const cartItem = await addCartItem(
        userId,
        request.body,
    );

    return response.status(201).json(cartItem);
}

/**
 * Atualiza a quantidade de um item do carrinho.
 */
export async function updateCartItemController(
    request: Request,
    response: Response,
) {
    const cartItemId = Number(
        request.params.id,
    );

    if (
        !Number.isInteger(cartItemId) ||
        cartItemId <= 0
    ) {
        throw new AppError(
            'Item do carrinho inválido.',
            400,
        );
    }

    const { quantity } = request.body;

    if (
        typeof quantity !== 'number' ||
        !Number.isInteger(quantity)
    ) {
        throw new AppError(
            'A quantidade deve ser um número inteiro.',
            400,
        );
    }

    const userId = getAuthenticatedUserId(request);

    const cartItem = await updateCartItem(
        userId,
        cartItemId,
        quantity,
    );

    return response.status(200).json(cartItem);
}

/**
 * Remove um item do carrinho do usuário autenticado.
 */
export async function deleteCartItemController(
    request: Request,
    response: Response,
) {
    const cartItemId = Number(
        request.params.id,
    );

    if (
        !Number.isInteger(cartItemId) ||
        cartItemId <= 0
    ) {
        throw new AppError(
            'Item do carrinho inválido.',
            400,
        );
    }

    const userId = getAuthenticatedUserId(request);

    await deleteCartItem(
        userId,
        cartItemId,
    );

    return response.status(204).send();
}