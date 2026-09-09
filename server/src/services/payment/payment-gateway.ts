export type CreatePaymentInput = {
    orderId: number;
    amount: number;
};

export type CreatePaymentResult = {
    preferenceId: string;
    checkoutUrl: string;
};

export type PaymentStatus =
    | 'PENDING'
    | 'PAID'
    | 'FAILED'
    | 'REFUNDED';

export type PaymentResult = {
    externalId: string;
    status: PaymentStatus;
};

export interface PaymentGateway {
    createPayment(
        data: CreatePaymentInput,
    ): Promise<CreatePaymentResult>;

    getPayment(
        externalId: string,
    ): Promise<PaymentResult>;
}