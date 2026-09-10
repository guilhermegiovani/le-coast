import { Router, type Router as ExpressRouter } from 'express';

import {
  createPaymentController,
} from '../controllers/payment-controller.js';

import { authMiddleware } from '../middlewares/auth-middleware.js';

export const paymentRoutes: ExpressRouter = Router();

paymentRoutes.post('/orders/:id/payment', authMiddleware, createPaymentController);