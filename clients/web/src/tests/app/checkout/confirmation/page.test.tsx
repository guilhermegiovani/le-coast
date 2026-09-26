import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import CheckoutConfirmationPage from '@/app/checkout/confirmation/page';

vi.mock('@/components/checkout/checkout-confirmation', () => ({
    CheckoutConfirmation: () => (
        <div>Conteúdo da confirmação do checkout</div>
    ),
}));

describe('CheckoutConfirmationPage', () => {
    it('deve renderizar o componente de confirmação dentro da página', () => {
        render(<CheckoutConfirmationPage />);

        expect(
            screen.getByText('Conteúdo da confirmação do checkout'),
        ).toBeInTheDocument();
    });
});