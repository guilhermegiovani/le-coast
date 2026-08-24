import { Router, type Router as ExpressRouter, } from 'express';

import {
  createAddressController,
  deleteAddressController,
  listAddressesController,
  setDefaultAddressController,
  updateAddressController,
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

// Atualiza os dados de um endereço pertencente
// ao usuário autenticado.
addressRoutes.patch('/:id', updateAddressController);

// Define um endereço pertencente ao usuário
// autenticado como seu endereço padrão.
addressRoutes.patch('/:id/default', setDefaultAddressController);

// Exclui um endereço pertencente ao usuário autenticado.
//
// Caso seja o endereço padrão, o service garante que
// outro endereço seja promovido quando necessário.
addressRoutes.delete('/:id',deleteAddressController);