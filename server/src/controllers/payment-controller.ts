import type {
    Request,
    Response,
} from 'express';

import { AppError } from '../errors/app-error.js';

import {
    createPaymentForOrder,
} from '../services/payment-service.js';

import {
    MercadoPagoGateway,
} from '../services/payment/mercado-pago-gateway.js';

const mercadoPagoGateway = new MercadoPagoGateway();

// Cria o pagamento de um pedido do usuário autenticado.
export async function createPaymentController(
    request: Request,
    response: Response,
) {
    if (!request.user) {
        throw new AppError(
            'Usuário não autenticado.',
            401,
        );
    }

    const orderId = Number(request.params.id);

    if (
        !Number.isInteger(orderId) ||
        orderId <= 0
    ) {
        throw new AppError(
            'Pedido inválido.',
            400,
        );
    }

    const payment = await createPaymentForOrder(
        orderId,
        mercadoPagoGateway,
        'MERCADO_PAGO',
    );

    return response.status(201).json(payment);
}