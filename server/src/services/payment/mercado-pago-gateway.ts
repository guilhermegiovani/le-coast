import { Payment, Preference } from 'mercadopago';

import { mercadoPagoClient } from '../../lib/mercado-pago.js';

import type {
    CreatePaymentInput,
    CreatePaymentResult,
    PaymentGateway,
    PaymentResult,
} from './payment-gateway.js';

export class MercadoPagoGateway
    implements PaymentGateway {
    private readonly preference: Preference;
    private readonly payment: Payment;

    constructor() {
        this.preference = new Preference(mercadoPagoClient);

        this.payment = new Payment(mercadoPagoClient);
    }

    async createPayment(
        data: CreatePaymentInput,
    ): Promise<CreatePaymentResult> {
        const successUrl = process.env.MERCADO_PAGO_SUCCESS_URL;
        const pendingUrl = process.env.MERCADO_PAGO_PENDING_URL;
        const failureUrl = process.env.MERCADO_PAGO_FAILURE_URL;
        const notificationUrl = process.env.MERCADO_PAGO_NOTIFICATION_URL;

        if (!successUrl || !pendingUrl || !failureUrl || !notificationUrl) {
            throw new Error('URLs de retorno do Mercado Pago não configuradas.');
        }

        const preference =
            await this.preference.create({
                body: {
                    notification_url: notificationUrl,
                    back_urls: {
                        success: successUrl,
                        pending: pendingUrl,
                        failure: failureUrl
                    },
                    auto_return: 'approved',
                    external_reference: String(data.orderId),
                    items: [
                        {
                            id: String(data.orderId),
                            title: `Pedido #${data.orderId}`,
                            quantity: 1,
                            unit_price: data.amount,
                            currency_id: 'BRL',
                        },
                    ],
                },
            });

        if (
            !preference.id ||
            !preference.init_point
        ) {
            throw new Error(
                'Mercado Pago não retornou os dados do checkout.',
            );
        }

        return {
            preferenceId: preference.id,
            checkoutUrl: preference.init_point,
        };
    }

    async getPayment(
        externalId: string,
    ): Promise<PaymentResult> {
        const payment = await this.payment.get({ id: externalId });


        return {
            externalId: String(payment.id),
            externalReference: payment.external_reference ?? '',
            status: this.mapPaymentStatus(payment.status),
            amount: Number(payment.transaction_amount),
            currency: payment.currency_id ?? '',
        };

    }

    private mapPaymentStatus(
        status: string | null | undefined,
    ): PaymentResult['status'] {
        switch (status) {
            case 'approved':
                return 'PAID';

            case 'rejected':
            case 'cancelled':
                return 'FAILED';

            case 'refunded':
                return 'REFUNDED';

            default:
                return 'PENDING';
        }
    }
}