import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';
import { createPayment } from '@/services/payment-service';

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('createPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar um pagamento para o pedido', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: {
        preferenceId: 'preference-123',
        checkoutUrl: 'https://mercadopago.com/checkout/123',
      },
    });

    const result = await createPayment(10);

    expect(api.post).toHaveBeenCalledOnce();
    expect(api.post).toHaveBeenCalledWith(
      '/orders/10/payment',
    );

    expect(result).toEqual({
      preferenceId: 'preference-123',
      checkoutUrl: 'https://mercadopago.com/checkout/123',
    });
  });
});