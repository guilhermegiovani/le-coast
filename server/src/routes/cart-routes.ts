import {
    Router,
    type Router as ExpressRouter,
} from 'express';

import {
    addCartItemController,
    deleteCartItemController,
    getUserCartController,
    updateCartItemController,
} from '../controllers/cart-controller.js';

import { authMiddleware } from '../middlewares/auth-middleware.js';

export const cartRoutes: ExpressRouter = Router();

// Todas as operações do carrinho exigem autenticação.
cartRoutes.use(authMiddleware);

// Retorna o carrinho do usuário autenticado.
cartRoutes.get('/', getUserCartController);

// Adiciona uma variante ao carrinho.
cartRoutes.post('/items', addCartItemController);

// Atualiza a quantidade de um item do carrinho.
cartRoutes.patch('/items/:id', updateCartItemController);

// Remove um item do carrinho.
cartRoutes.delete('/items/:id', deleteCartItemController);