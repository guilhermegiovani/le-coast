import { Router, type Router as ExpressRouter, } from 'express';

import {
  createAddressController,
  listAddressesController,
} from '../controllers/address-controller.js';

import { authMiddleware } from '../middlewares/auth-middleware.js';

export const addressRoutes: ExpressRouter = Router();

// Todas as rotas de endereço exigem
// que o usuário esteja autenticado.
addressRoutes.use(authMiddleware);

// Cria um novo endereço para
// o usuário autenticado.
addressRoutes.post('/', createAddressController);

// Lista todos os endereços
// pertencentes ao usuário autenticado.
addressRoutes.get('/', listAddressesController);