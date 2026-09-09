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

describe('MercadoPagoGateway', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        PreferenceMock.mockImplementation(() => ({
            create: preferenceCreateMock,
        }) as never);

        PaymentMock.mockImplementation(() => ({
            get: paymentGetMock,
        }) as never);
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

        expect(
            preferenceCreateMock,
        ).toHaveBeenCalledWith({
            body: {
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
            status: 'approved',
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
            status: 'PAID',
        });
    });

    // Garante que pagamentos rejeitados ou cancelados
    // sejam tratados como falha no nosso domínio.
    it('deve mapear pagamento rejeitado para FAILED', async () => {
        paymentGetMock.mockResolvedValue({
            id: 123456,
            status: 'rejected',
        });

        const gateway =
            new MercadoPagoGateway();

        const result =
            await gateway.getPayment(
                '123456',
            );

        expect(result).toEqual({
            externalId: '123456',
            status: 'FAILED',
        });
    });

    it('deve mapear pagamento cancelado para FAILED', async () => {
        paymentGetMock.mockResolvedValue({
            id: 123456,
            status: 'cancelled',
        });

        const gateway =
            new MercadoPagoGateway();

        const result =
            await gateway.getPayment(
                '123456',
            );

        expect(result).toEqual({
            externalId: '123456',
            status: 'FAILED',
        });
    });

    // Garante que um pagamento reembolsado seja convertido
    // para o estado interno REFUNDED.
    it('deve mapear pagamento reembolsado para REFUNDED', async () => {
        paymentGetMock.mockResolvedValue({
            id: 123456,
            status: 'refunded',
        });

        const gateway =
            new MercadoPagoGateway();

        const result =
            await gateway.getPayment(
                '123456',
            );

        expect(result).toEqual({
            externalId: '123456',
            status: 'REFUNDED',
        });
    });

    // Garante que estados desconhecidos ou ainda não concluídos
    // permaneçam como PENDING.
    it('deve mapear status desconhecido para PENDING', async () => {
        paymentGetMock.mockResolvedValue({
            id: 123456,
            status: 'in_process',
        });

        const gateway =
            new MercadoPagoGateway();

        const result =
            await gateway.getPayment(
                '123456',
            );

        expect(result).toEqual({
            externalId: '123456',
            status: 'PENDING',
        });
    });
});