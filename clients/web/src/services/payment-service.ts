import { api } from '@/lib/api';

export type CreatePaymentResult = {
  preferenceId: string;
  checkoutUrl: string;
};

export async function createPayment(
  orderId: number,
): Promise<CreatePaymentResult> {
  const response = await api.post<CreatePaymentResult>(
    `/orders/${orderId}/payment`,
  );

  return response.data;
}