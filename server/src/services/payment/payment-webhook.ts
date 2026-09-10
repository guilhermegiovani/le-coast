import crypto from 'node:crypto';

type ValidateWebhookSignatureInput = {
    xSignature: string;
    xRequestId: string;
    dataId: string;
    secret: string;
};

/**
 * Valida a assinatura HMAC enviada pelo Mercado Pago.
 *
 * O Mercado Pago utiliza os valores de data.id e x-request-id
 * para formar o manifest utilizado na geração da assinatura.
 */
export function validateWebhookSignature({
    xSignature,
    xRequestId,
    dataId,
    secret,
}: ValidateWebhookSignatureInput): boolean {
    const parts = xSignature.split(',');

    const ts = parts.find((part) => part.trim().startsWith('ts='))?.trim().replace('ts=', '');

    const v1 = parts.find((part) => part.trim().startsWith('v1='))?.trim().replace('v1=', '');

    if (!ts || !v1) {
        return false;
    }

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    const generatedSignature = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

    if (v1.length !== generatedSignature.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(v1),
    );
}

export type MercadoPagoPaymentWebhook = {
    type: string;
    action: string;
    data: {
        id: string;
    };
};