import { Router, type Router as ExpressRouter } from 'express';

import { paymentWebhookController } from '../controllers/payment-webhook-controller.js';

export const paymentWebhookRoutes: ExpressRouter = Router();

paymentWebhookRoutes.post('/mercado-pago', paymentWebhookController);