
import {
    Router,
    type Router as ExpressRouter,
} from 'express';

import { getAdminDashboardController } from '../controllers/admin-dashboard-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import { requireRole } from '../middlewares/role-middleware.js';

export const adminDashboardRoutes: ExpressRouter = Router();

// Todas as rotas deste módulo exigem autenticação.
adminDashboardRoutes.use(authMiddleware);

// Somente administradores podem consultar os indicadores.
adminDashboardRoutes.get(
    '/',
    requireRole('ADMIN'),
    getAdminDashboardController,
);
