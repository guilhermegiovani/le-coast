import crypto from 'node:crypto';

import {
    describe,
    expect,
    it,
} from 'vitest';

import {
    validateWebhookSignature,
} from '../../services/payment/payment-webhook.js';

const SECRET = 'test-secret';

const DATA_ID = '123456';

const REQUEST_ID = 'request-123';

const TIMESTAMP = '1700000000';

function generateSignature() {
    const manifest =
        `id:${DATA_ID};request-id:${REQUEST_ID};ts:${TIMESTAMP};`;

    return crypto
        .createHmac(
            'sha256',
            SECRET,
        )
        .update(manifest)
        .digest('hex');
}

describe('validateWebhookSignature', () => {
    it('deve aceitar uma assinatura válida', () => {
        const signature =
            generateSignature();

        const result =
            validateWebhookSignature({
                xSignature: `ts=${TIMESTAMP},v1=${signature}`,
                xRequestId: REQUEST_ID,
                dataId: DATA_ID,
                secret: SECRET,
            });

        expect(result).toBe(true);
    });

    it('deve rejeitar uma assinatura inválida', () => {
        const result =
            validateWebhookSignature({
                xSignature: `ts=${TIMESTAMP},v1=assinatura-invalida`,
                xRequestId: REQUEST_ID,
                dataId: DATA_ID,
                secret: SECRET,
            });

        expect(result).toBe(false);
    });

    it('deve rejeitar uma assinatura sem ts', () => {
        const result =
            validateWebhookSignature({
                xSignature: 'v1=assinatura',
                xRequestId: REQUEST_ID,
                dataId: DATA_ID,
                secret: SECRET,
            });

        expect(result).toBe(false);
    });

    it('deve rejeitar uma assinatura sem v1', () => {
        const result =
            validateWebhookSignature({
                xSignature: `ts=${TIMESTAMP}`,
                xRequestId: REQUEST_ID,
                dataId: DATA_ID,
                secret: SECRET,
            });

        expect(result).toBe(false);
    });
});