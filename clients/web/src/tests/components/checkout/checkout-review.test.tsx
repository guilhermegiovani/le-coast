import { fireEvent, render, screen } from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { CheckoutReview } from '@/components/checkout/checkout-review';

const onBackMock = vi.fn();

const FORM_DATA = {
  city: 'Ribeirão Preto',
  complement: 'Apartamento 12',
  email: 'guilherme@example.com',
  name: 'Guilherme Nobre',
  neighborhood: 'Centro',
  number: '123',
  phone: '(16) 99999-9999',
  state: 'SP',
  street: 'Rua das Flores',
  zipCode: '14000-000',
};

function renderComponent(
  paymentMethod: 'card' | 'pix' = 'pix',
) {
  render(
    <CheckoutReview
      formData={FORM_DATA}
      onBack={onBackMock}
      paymentMethod={paymentMethod}
    />,
  );
}

// Agrupa os testes do componente CheckoutReview.
describe('CheckoutReview', () => {
  beforeEach(() => {
    onBackMock.mockClear();
  });

  // Garante que o título da etapa de revisão é exibido.
  it('deve renderizar o título da revisão', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {
        name: 'Revisão do pedido',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Garante que os dados de contato aparecem na revisão.
  it('deve renderizar os dados de contato', () => {
    renderComponent();

    expect(
      screen.getByText('Guilherme Nobre'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('guilherme@example.com'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('(16) 99999-9999'),
    ).toBeInTheDocument();
  });

  // Garante que o endereço completo aparece na revisão.
  it('deve renderizar o endereço de entrega', () => {
    renderComponent();

    expect(
      screen.getByText('Rua das Flores, 123'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Apartamento 12'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Centro'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Ribeirão Preto - SP'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('CEP: 14000-000'),
    ).toBeInTheDocument();
  });

  // Garante que o complemento não é exibido quando estiver vazio.
  it('não deve renderizar complemento vazio', () => {
    render(
      <CheckoutReview
        formData={{
          ...FORM_DATA,
          complement: '',
        }}
        onBack={onBackMock}
        paymentMethod="pix"
      />,
    );

    expect(
      screen.queryByText('Apartamento 12'),
    ).not.toBeInTheDocument();
  });

  // Garante que PIX é apresentado corretamente.
  it('deve renderizar PIX como forma de pagamento', () => {
    renderComponent('pix');

    expect(screen.getByText('PIX')).toBeInTheDocument();
  });

  // Garante que cartão é apresentado corretamente.
  it('deve renderizar cartão de crédito como forma de pagamento', () => {
    renderComponent('card');

    expect(
      screen.getByText('Cartão de crédito'),
    ).toBeInTheDocument();
  });

  // Garante que o usuário pode retornar à etapa de pagamento.
  it('deve chamar onBack ao clicar em voltar', () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Voltar para pagamento',
      }),
    );

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });

  // Garante que a ação final não fica duplicada nesta etapa.
  it('não deve renderizar o botão Finalizar pedido', () => {
    renderComponent();

    expect(
      screen.queryByRole('button', {
        name: 'Finalizar pedido',
      }),
    ).not.toBeInTheDocument();
  });
});