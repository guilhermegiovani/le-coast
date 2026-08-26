import {
  Router,
  type Router as ExpressRouter,
} from 'express';

import { createOrderController, getOrderByIdController, listOrdersController } from '../controllers/order-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

// Define explicitamente o tipo do router para evitar
// inferências não-portáveis das tipagens internas do Express.
export const orderRoutes: ExpressRouter = Router();

// Todas as rotas de pedidos exigem autenticação.
orderRoutes.use(authMiddleware);

// Cria um novo pedido para o usuário autenticado.
orderRoutes.post('/', createOrderController);

// Lista todos os pedidos pertencentes
// ao usuário autenticado.
orderRoutes.get('/', listOrdersController);

// Busca um pedido específico pertencente
// ao usuário autenticado.
orderRoutes.get('/:id', getOrderByIdController);