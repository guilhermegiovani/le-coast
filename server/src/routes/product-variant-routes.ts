import {
  Router,
  type Router as ExpressRouter,
} from 'express';

import {
  createProductVariantController,
  getProductVariantByIdController,
  listProductVariantsController,
  updateProductVariantController,
} from '../controllers/product-variant-controller.js';

import { authMiddleware } from '../middlewares/auth-middleware.js';
import { requireRole } from '../middlewares/role-middleware.js';

// Permite que o router de variantes acesse os parâmetros
// definidos pela rota pai, como o productId.
export const productVariantRoutes: ExpressRouter = Router({mergeParams: true});

// Todas as operações de variantes exigem autenticação.
productVariantRoutes.use(authMiddleware);

// Clientes autenticados podem consultar as variantes.
productVariantRoutes.get('/', listProductVariantsController,);

productVariantRoutes.get('/:variantId', getProductVariantByIdController);

// Somente administradores podem criar variantes.
productVariantRoutes.post('/', requireRole('ADMIN'), createProductVariantController);

// Somente administradores podem alterar variantes.
productVariantRoutes.patch('/:variantId', requireRole('ADMIN') ,updateProductVariantController);