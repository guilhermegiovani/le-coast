// import crypto from 'node:crypto';
// type ValidateWebhookSignatureInput = {
//     xSignature: string;
//     xRequestId: string;
//     dataId: string;
//     secret: string;
// };

// /**
//  * Valida a assinatura HMAC enviada pelo Mercado Pago.
//  *
//  * O Mercado Pago utiliza os valores de data.id e x-request-id
//  * para formar o manifest utilizado na geração da assinatura.
//  */
// export function validateWebhookSignature({
//     xSignature,
//     xRequestId,
//     dataId,
//     secret,
// }: ValidateWebhookSignatureInput): boolean {
//     const parts = xSignature.split(',');

//     const ts = parts
//         .find((part) => part.trim().startsWith('ts='))
//         ?.trim()
//         .replace('ts=', '');

//     const v1 = parts
//         .find((part) => part.trim().startsWith('v1='))
//         ?.trim()
//         .replace('v1=', '');

//     if (!ts || !v1) {
//         return false;
//     }


//     // O Mercado Pago exige data.id em letras minúsculas no manifesto.
//     const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;

//     console.log('[Webhook] Dados usados na assinatura:', {
//         dataId: dataId.toLowerCase(),
//         xRequestId,
//         ts,
//         manifest,
//         signatureLength: v1.length,
//     });

//     const generatedSignature = crypto
//         .createHmac('sha256', secret)
//         .update(manifest)
//         .digest('hex');

//     if (v1.length !== generatedSignature.length) {
//         return false;
//     }

//     return crypto.timingSafeEqual(
//         Buffer.from(generatedSignature),
//         Buffer.from(v1),
//     );
// }

import {
    WebhookSignatureValidator,
    InvalidWebhookSignatureError,
} from 'mercadopago';

type ValidateWebhookSignatureInput = {
    xSignature: string;
    xRequestId: string;
    dataId: string;
    secret: string;
};

export function validateWebhookSignature({
    xSignature,
    xRequestId,
    dataId,
    secret,
}: ValidateWebhookSignatureInput): boolean {
    try {
        WebhookSignatureValidator.validate({
            xSignature,
            xRequestId,
            dataId,
            secret,
        });

        return true;
    } catch (error) {
        if (error instanceof InvalidWebhookSignatureError) {
            console.log("----------------------- SERVICE --------------------------------------")
            console.error('[Webhook] Falha na assinatura:', {
                reason: error.reason,
                requestId: error.requestId,
                timestamp: error.timestamp,
            });

            console.log("-------------------------------------------------------------")

            console.error('[Webhook] Diagnóstico:', {
                reason: error.reason,
                // Registre somente os dados necessários para comparar a assinatura.
                dataId,
                xRequestId,
                timestamp: error.timestamp,
            });

            console.log("-------------------------------------------------------------")

            console.error('[Webhook] Assinatura recebida service:', {
                dataId,
                xRequestId,
                timestamp: error.timestamp,
                xSignature,
            });

            return false;
        }

        throw error;
    }
}

export type MercadoPagoPaymentWebhook = {
    type: string;
    action: string;
    data: {
        id: string;
    };
};