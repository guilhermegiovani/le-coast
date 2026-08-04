import { fireEvent, render, screen } from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  CheckoutPayment,
  type PaymentMethod,
} from '@/components/checkout/checkout-payment';

const onBackMock = vi.fn();
const onContinueMock = vi.fn();

function renderComponent() {
  render(
    <CheckoutPayment
      onBack={onBackMock}
      onContinue={onContinueMock}
    />,
  );
}

// Agrupa os testes do componente CheckoutPayment.
describe('CheckoutPayment', () => {
  beforeEach(() => {
    onBackMock.mockClear();
    onContinueMock.mockClear();
  });

  // Garante que as formas de pagamento são exibidas.
  it('deve renderizar as opções de pagamento', () => {
    renderComponent();

    expect(
      screen.getByRole('radio', {
        name: /pix/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('radio', {
        name: /cartão de crédito/i,
      }),
    ).toBeInTheDocument();
  });

  // Garante que nenhuma opção inicia selecionada.
  it('deve iniciar sem método de pagamento selecionado', () => {
    renderComponent();

    expect(
      screen.getByRole('button', {
        name: 'Revisar pedido',
      }),
    ).toBeDisabled();
  });

  // Garante que selecionar PIX habilita o botão.
  it('deve habilitar o botão ao selecionar PIX', () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('radio', {
        name: /pix/i,
      }),
    );

    expect(
      screen.getByRole('radio', {
        name: /pix/i,
      }),
    ).toHaveAttribute('aria-checked', 'true');

    expect(
      screen.getByRole('button', {
        name: 'Revisar pedido',
      }),
    ).toBeEnabled();
  });

  // Garante que apenas uma opção permanece selecionada.
  it('deve trocar a seleção ao escolher cartão', () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('radio', {
        name: /pix/i,
      }),
    );

    fireEvent.click(
      screen.getByRole('radio', {
        name: /cartão de crédito/i,
      }),
    );

    expect(
      screen.getByRole('radio', {
        name: /pix/i,
      }),
    ).toHaveAttribute('aria-checked', 'false');

    expect(
      screen.getByRole('radio', {
        name: /cartão de crédito/i,
      }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  // Garante que o método selecionado é enviado ao continuar.
  it.each([
    ['PIX', 'pix'],
    ['Cartão de crédito', 'card'],
  ])(
    'deve chamar onContinue com %s',
    (label, value) => {
      renderComponent();

      fireEvent.click(
        screen.getByRole('radio', {
          name: new RegExp(label, 'i'),
        }),
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Revisar pedido',
        }),
      );

      expect(onContinueMock).toHaveBeenCalledTimes(1);

      expect(onContinueMock).toHaveBeenCalledWith(
        value as PaymentMethod,
      );
    },
  );

  // Garante que o botão voltar executa a ação recebida.
  it('deve chamar onBack ao clicar em voltar', () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Voltar para entrega',
      }),
    );

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });
});