import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {
    MercadoPagoGateway,
} from '../../services/payment/mercado-pago-gateway.js';

import {
    Preference,
    Payment,
} from 'mercadopago';

// Simula o SDK do Mercado Pago para que os testes
// não façam requisições reais.
vi.mock('mercadopago', () => ({
    Preference: vi.fn(),
    Payment: vi.fn(),
}));

// Simula o cliente configurado do Mercado Pago.
vi.mock('../../lib/mercado-pago.js', () => ({
    mercadoPagoClient: {},
}));

const preferenceCreateMock = vi.fn();
const paymentGetMock = vi.fn();

const PreferenceMock = vi.mocked(
    Preference,
);

const PaymentMock = vi.mocked(
    Payment,
);

const VALID_PAYMENT_INPUT = {
    orderId: 1,
    amount: 159.8,
};

const SUCCESS_URL =
    'https://le-coast-web.vercel.app/checkout/confirmation';

const NOTIFICATION_URL =
    'https://le-coast-webhook.ngrok-free.app/webhooks/mercado-pago';

describe('MercadoPagoGateway', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        PreferenceMock.mockImplementation(() => ({
            create: preferenceCreateMock,
        }) as never);

        PaymentMock.mockImplementation(() => ({
            get: paymentGetMock,
        }) as never);

        process.env.MERCADO_PAGO_SUCCESS_URL = SUCCESS_URL;
        process.env.MERCADO_PAGO_PENDING_URL = SUCCESS_URL;
        process.env.MERCADO_PAGO_FAILURE_URL = SUCCESS_URL;
        process.env.MERCADO_PAGO_NOTIFICATION_URL = NOTIFICATION_URL;
    });

    // Garante que a criação do pagamento utilize os dados
    // corretos para criar a preferência no Mercado Pago.
    it('deve criar um pagamento e retornar os dados do checkout', async () => {
        preferenceCreateMock.mockResolvedValue({
            id: 'PREF-123',
            init_point: 'https://www.mercadopago.com.br/checkout/PREF-123',
        });

        const gateway = new MercadoPagoGateway();

        const result = await gateway.createPayment(
            VALID_PAYMENT_INPUT,
        );

        expect(preferenceCreateMock).toHaveBeenCalledWith({
            body: {
                notification_url: NOTIFICATION_URL,
                back_urls: {
                    success: SUCCESS_URL,
                    pending: SUCCESS_URL,
                    failure: SUCCESS_URL,
                },
                auto_return: 'approved',
                external_reference: '1',
                items: [
                    {
                        id: '1',
                        title: 'Pedido #1',
                        quantity: 1,
                        unit_price: 159.8,
                        currency_id: 'BRL',
                    },
                ],
            },
        });

        expect(result).toEqual({
            preferenceId: 'PREF-123',
            checkoutUrl: 'https://www.mercadopago.com.br/checkout/PREF-123',
        });
    });

    // Garante que a criação do pagamento falhe quando
    // o Mercado Pago não retornar os dados necessários
    // para iniciar o checkout.
    it('deve lançar erro quando o checkout não retornar os dados esperados', async () => {
        preferenceCreateMock.mockResolvedValue({
            id: 'PREF-123',
        });

        const gateway =
            new MercadoPagoGateway();

        await expect(
            gateway.createPayment(
                VALID_PAYMENT_INPUT,
            ),
        ).rejects.toThrow(
            'Mercado Pago não retornou os dados do checkout.',
        );
    });

    // Garante que o gateway consulte o pagamento no Mercado Pago
    // e converta o status retornado para o nosso padrão interno.
    it('deve buscar um pagamento e retornar seu status', async () => {
        paymentGetMock.mockResolvedValue({
            id: 123456,
            external_reference: '1',
            status: 'approved',
            transaction_amount: 159.8,
            currency_id: 'BRL',
        });

        const gateway =
            new MercadoPagoGateway();

        const result =
            await gateway.getPayment(
                '123456',
            );

        expect(
            paymentGetMock,
        ).toHaveBeenCalledWith({
            id: '123456',
        });

        expect(result).toEqual({
            externalId: '123456',
            externalReference: '1',
            status: 'PAID',
            amount: 159.8,
            currency: 'BRL',
        });
    });

    // Garante que pagamentos rejeitados ou cancelados
    // sejam tratados como falha no nosso domínio.
    it('deve mapear pagamento rejeitado para FAILED', async () => {
        paymentGetMock.mockResolvedValue({
            id: 123456,
            external_reference: '1',
            status: 'rejected',
            transaction_amount: 159.8,
            currency_id: 'BRL',
        });

        const gateway =
            new MercadoPagoGateway();

        const result =
            await gateway.getPayment(
                '123456',
            );

        expect(result).toEqual({
            externalId: '123456',
            externalReference: '1',
            status: 'FAILED',
            amount: 159.8,
            currency: 'BRL',
        });
    });

    it('deve mapear pagamento cancelado para FAILED', async () => {
        paymentGetMock.mockResolvedValue({
            id: 123456,
            external_reference: '1',
            status: 'cancelled',
            transaction_amount: 159.8,
            currency_id: 'BRL',
        });

        const gateway =
            new MercadoPagoGateway();

        const result =
            await gateway.getPayment(
                '123456',
            );

        expect(result).toEqual({
            externalId: '123456',
            externalReference: '1',
            status: 'FAILED',
            amount: 159.8,
            currency: 'BRL',
        });
    });

    // Garante que um pagamento reembolsado seja convertido
    // para o estado interno REFUNDED.
    it('deve mapear pagamento reembolsado para REFUNDED', async () => {
        paymentGetMock.mockResolvedValue({
            id: 123456,
            external_reference: '1',
            status: 'refunded',
            transaction_amount: 159.8,
            currency_id: 'BRL',
        });

        const gateway =
            new MercadoPagoGateway();

        const result =
            await gateway.getPayment(
                '123456',
            );

        expect(result).toEqual({
            externalId: '123456',
            externalReference: '1',
            status: 'REFUNDED',
            amount: 159.8,
            currency: 'BRL',
        });
    });

    // Garante que estados desconhecidos ou ainda não concluídos
    // permaneçam como PENDING.
    it('deve mapear status desconhecido para PENDING', async () => {
        paymentGetMock.mockResolvedValue({
            id: 123456,
            external_reference: '1',
            status: 'in_process',
            transaction_amount: 159.8,
            currency_id: 'BRL',
        });

        const gateway =
            new MercadoPagoGateway();

        const result =
            await gateway.getPayment(
                '123456',
            );

        expect(result).toEqual({
            externalId: '123456',
            externalReference: '1',
            status: 'PENDING',
            amount: 159.8,
            currency: 'BRL',
        });
    });
});
