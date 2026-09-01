import {
  Router,
  type Router as ExpressRouter,
} from 'express';

import {
  createProductController,
  getProductByIdController,
  listProductsController,
  updateProductController,
} from '../controllers/product-controller.js';

import { authMiddleware } from '../middlewares/auth-middleware.js';
import { requireRole } from '../middlewares/role-middleware.js';

export const productRoutes: ExpressRouter = Router();

// Todas as operações desta rota exigem autenticação.
productRoutes.use(authMiddleware);

// Clientes autenticados podem consultar o catálogo.
productRoutes.get('/',listProductsController);

productRoutes.get('/:id',getProductByIdController);

// Somente administradores podem cadastrar produtos.
productRoutes.post('/', requireRole('ADMIN'), createProductController);

// Somente administradores podem alterar produtos.
productRoutes.patch('/:id', requireRole('ADMIN'), updateProductController);