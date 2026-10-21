
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

// Evita expor o identificador completo do pagamento nos logs.
function maskPaymentId(paymentId: string): string {
    if (paymentId.length <= 4) {
        return '****';
    }

    return `${'*'.repeat(paymentId.length - 4)}${paymentId.slice(-4)}`;
}

// Processa notificações de pagamento enviadas pelo Mercado Pago.
export async function paymentWebhookController(
    request: Request,
    response: Response,
) {
    const requestId = request.headers['x-request-id'];
    const xSignature = request.headers['x-signature'];

    const modernDataId = request.query['data.id'];
    const modernType = request.query.type;

    const legacyId = request.query.id;
    const legacyTopic = request.query.topic;

    // Registra apenas metadados úteis para diagnóstico.
    // Não registrar a assinatura, o segredo ou o corpo completo.
    console.info('[MP Webhook] Notificação recebida', {
        method: request.method,
        path: request.path,
        modernDataIdPresent: typeof modernDataId === 'string',
        modernType:
            typeof modernType === 'string' ? modernType : 'ausente',
        legacyIdPresent: typeof legacyId === 'string',
        legacyTopic:
            typeof legacyTopic === 'string' ? legacyTopic : 'ausente',
        requestIdPresent: typeof requestId === 'string',
        signaturePresent: typeof xSignature === 'string',
        action:
            typeof request.body?.action === 'string'
                ? request.body.action
                : 'ausente',
    });

    if (!webhookSecret) {
        console.error(
            '[MP Webhook] Configuração ausente: webhook secret não definido.',
        );

        throw new AppError(
            'MERCADO_PAGO_WEBHOOK_SECRET não configurado.',
            500,
        );
    }

    let paymentId: string;

    if (typeof modernDataId === 'string') {
        console.info(
            '[MP Webhook] Formato moderno detectado.',
        );

        if (
            typeof xSignature !== 'string' ||
            typeof requestId !== 'string'
        ) {
            console.warn(
                '[MP Webhook] Rejeitado: cabeçalho de assinatura ausente.',
                {
                    signaturePresent: typeof xSignature === 'string',
                    requestIdPresent: typeof requestId === 'string',
                },
            );

            throw new AppError(
                'Assinatura do webhook inválida.',
                401,
            );
        }

        const isValid = validateWebhookSignature({
            xSignature,
            xRequestId: requestId,
            dataId: modernDataId,
            secret: webhookSecret,
        });

        console.info(
            '[MP Webhook] Resultado da validação da assinatura.',
            { valid: isValid },
        );

        if (!isValid) {
            console.warn(
                '[MP Webhook] Rejeitado: assinatura inválida.',
            );

            throw new AppError(
                'Assinatura do webhook inválida.',
                401,
            );
        }

        if (modernType !== 'payment') {
            console.info(
                '[MP Webhook] Notificação ignorada: tipo não suportado.',
                { type: modernType ?? 'ausente' },
            );

            return response.status(200).json({
                message: 'Notificação ignorada.',
            });
        }

        const action = request.body?.action;

        if (
            action !== 'payment.created' &&
            action !== 'payment.updated'
        ) {
            console.info(
                '[MP Webhook] Notificação ignorada: ação não suportada.',
                {
                    action:
                        typeof action === 'string' ? action : 'ausente',
                },
            );

            return response.status(200).json({
                message: 'Notificação ignorada.',
            });
        }

        paymentId = modernDataId;
    } else if (
        typeof legacyId === 'string' &&
        legacyTopic === 'payment'
    ) {
        // IPN legado: a consulta autenticada ao gateway e as validações
        // do serviço continuam sendo responsáveis pela confirmação.
        console.info(
            '[MP Webhook] Formato legado IPN detectado.',
        );

        paymentId = legacyId;
    } else {
        console.info(
            '[MP Webhook] Notificação ignorada: formato não reconhecido.',
        );

        return response.status(200).json({
            message: 'Notificação ignorada.',
        });
    }

    console.info(
        '[MP Webhook] Encaminhando pagamento para o serviço.',
        {
            paymentId: maskPaymentId(paymentId),
        },
    );

    try {
        const result = await processPaymentWebhook(
            paymentId,
            mercadoPagoGateway,
        );

        console.info(
            '[MP Webhook] Serviço de pagamento concluído.',
            {
                paymentId: maskPaymentId(paymentId),
                resultStatus:
                    typeof result?.paymentStatus === 'string'
                        ? result.paymentStatus
                        : 'verificar resposta do serviço',
            },
        );

        return response.status(200).json(result);
    } catch (error) {
        console.error(
            '[MP Webhook] Erro ao processar pagamento.',
            {
                paymentId: maskPaymentId(paymentId),
                error:
                    error instanceof Error
                        ? error.message
                        : 'Erro desconhecido',
            },
        );

        throw error;
    }
}
