import { fireEvent, render, screen } from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { CheckoutContent } from '@/components/checkout/checkout-content';

const useCartStoreMock = vi.fn();

vi.mock('@/stores/cart-store', () => ({
  useCartStore: (
    selector: (state: {
      items: unknown[];
    }) => unknown,
  ) => useCartStoreMock(selector),
}));

const CART_ITEMS = [
  {
    productId: 1,
    productName: 'Top Essential',
    productSlug: 'top-essential',
    quantity: 1,
    variant: {
      id: 1,
      price: 89.9,
      sku: 'TOP',
      stock: 8,
      color: {
        id: 1,
        name: 'Preto',
        slug: 'preto',
      },
      size: {
        id: 1,
        name: 'P',
        slug: 'p',
      },
    },
  },
];

function renderComponent() {
  render(<CheckoutContent />);
}

describe('CheckoutContent', () => {
  beforeEach(() => {
    useCartStoreMock.mockImplementation((selector) =>
      selector({
        items: CART_ITEMS,
      }),
    );
  });

  // Garante que o fluxo inicia pela etapa de entrega.
  it('deve iniciar na etapa de entrega', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {
        name: 'Dados para entrega',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Garante que é possível navegar até a etapa de pagamento.
  it('deve avançar para pagamento', () => {
    renderComponent();

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: 'Continuar para pagamento',
        })
        .closest('form')!,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Pagamento',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Garante que o usuário consegue chegar até a revisão.
  it('deve avançar até a revisão', () => {
    renderComponent();

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: 'Continuar para pagamento',
        })
        .closest('form')!,
    );

    fireEvent.click(
      screen.getByRole('radio', {
        name: /pix/i,
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Revisar pedido',
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: 'Revisão do pedido',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Garante que o usuário consegue retornar à etapa de pagamento.
  it('deve voltar da revisão para pagamento', () => {
    renderComponent();

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: 'Continuar para pagamento',
        })
        .closest('form')!,
    );

    fireEvent.click(
      screen.getByRole('radio', {
        name: /pix/i,
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Revisar pedido',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Voltar para pagamento',
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: 'Pagamento',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Garante que os dados permanecem preenchidos ao retornar para entrega.
  it('deve manter os dados ao voltar para entrega', () => {
    renderComponent();

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Nome completo',
      }),
      {
        target: {
          value: 'Guilherme Nobre',
        },
      },
    );

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: 'Continuar para pagamento',
        })
        .closest('form')!,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Voltar para entrega',
      }),
    );

    expect(
      screen.getByRole('textbox', {
        name: 'Nome completo',
      }),
    ).toHaveValue('Guilherme Nobre');
  });
});