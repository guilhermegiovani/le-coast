import type {
    Request,
    Response,
} from 'express';

import { AppError } from '../errors/app-error.js';

import {
    processPaymentWebhook,
} from '../services/payment-service.js';

import {
    validateWebhookSignature,
} from '../services/payment/payment-webhook.js';

import {
    MercadoPagoGateway,
} from '../services/payment/mercado-pago-gateway.js';

const mercadoPagoGateway = new MercadoPagoGateway();

const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

// Processa notificações de pagamento enviadas pelo Mercado Pago.
export async function paymentWebhookController(
    request: Request,
    response: Response,
) {
    if (!webhookSecret) {
        throw new AppError(
            'MERCADO_PAGO_WEBHOOK_SECRET não configurado.',
            500,
        );
    }

    const xSignature = request.headers['x-signature'];

    const xRequestId = request.headers['x-request-id'];

    const dataId = request.query['data.id'];

    if (
        typeof xSignature !== 'string' ||
        typeof xRequestId !== 'string' ||
        typeof dataId !== 'string'
    ) {
        throw new AppError(
            'Assinatura do webhook inválida.',
            401,
        );
    }

    const isValid =
        validateWebhookSignature({
            xSignature,
            xRequestId,
            dataId,
            secret: webhookSecret,
        });

    if (!isValid) {
        throw new AppError(
            'Assinatura do webhook inválida.',
            401,
        );
    }

    const result = await processPaymentWebhook(
        dataId,
        mercadoPagoGateway,
    );

    return response.status(200).json(result);
}