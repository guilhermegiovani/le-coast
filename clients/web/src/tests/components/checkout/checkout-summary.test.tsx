import { fireEvent, render, screen } from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  CheckoutSummary,
  type CheckoutStep,
} from '@/components/checkout/checkout-summary';

const {
  onFinalizeMock,
  useCartStoreMock,
} = vi.hoisted(() => ({
  onFinalizeMock: vi.fn(),
  useCartStoreMock: vi.fn(),
}));

const CART_ITEMS = [
  {
    productId: 1,
    productName: 'Top Essential',
    productSlug: 'top-essential',
    quantity: 2,
    variant: {
      color: {
        id: 1,
        name: 'Preto',
        slug: 'preto',
      },
      id: 1,
      price: 89.9,
      size: {
        id: 1,
        name: 'P',
        slug: 'p',
      },
      sku: 'TOP-ESS-P-PRE',
      stock: 8,
    },
  },
  {
    productId: 2,
    productName: 'Legging Move',
    productSlug: 'legging-move',
    quantity: 1,
    variant: {
      color: {
        id: 1,
        name: 'Preto',
        slug: 'preto',
      },
      id: 2,
      price: 149.9,
      size: {
        id: 2,
        name: 'M',
        slug: 'm',
      },
      sku: 'LEG-MOV-M-PRE',
      stock: 10,
    },
  },
];

vi.mock('@/stores/cart-store', () => ({
  useCartStore: (
    selector: (state: {
      items: typeof CART_ITEMS;
    }) => unknown,
  ) => useCartStoreMock(selector),
}));

function renderComponent(
  currentStep: CheckoutStep = 'delivery',
) {
  render(
    <CheckoutSummary
      currentStep={currentStep}
      onFinalize={onFinalizeMock}
    />,
  );
}

// Agrupa os testes do componente CheckoutSummary.
describe('CheckoutSummary', () => {
  beforeEach(() => {
    onFinalizeMock.mockClear();

    useCartStoreMock.mockImplementation((selector) =>
      selector({
        items: CART_ITEMS,
      }),
    );
  });

  // Garante que o título do resumo é exibido.
  it('deve renderizar o título do resumo', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {
        name: 'Resumo do pedido',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Garante que a quantidade total considera todas as unidades.
  it('deve renderizar a quantidade total de itens', () => {
    renderComponent();

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  // Garante que subtotal e total são calculados corretamente.
  it('deve renderizar o subtotal e o total do pedido', () => {
    renderComponent();

    expect(
      screen.getAllByText('R$ 329,70'),
    ).toHaveLength(2);
  });

  // Garante que o frete ainda depende do preenchimento do CEP.
  it('deve informar que o frete será calculado após o CEP', () => {
    renderComponent();

    expect(
      screen.getByText('Calculado após o CEP'),
    ).toBeInTheDocument();
  });

  // Garante que a etapa de entrega exibe sua orientação específica.
  it('deve orientar o preenchimento dos dados na etapa de entrega', () => {
    renderComponent('delivery');

    expect(
      screen.getByText(
        /o pagamento será liberado após preencher os dados de entrega/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Finalizar pedido',
      }),
    ).not.toBeInTheDocument();
  });

  // Garante que a etapa de pagamento exibe sua orientação específica.
  it('deve orientar a seleção do pagamento na etapa de pagamento', () => {
    renderComponent('payment');

    expect(
      screen.getByText(
        'Selecione uma forma de pagamento para continuar.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Finalizar pedido',
      }),
    ).not.toBeInTheDocument();
  });

  // Garante que a ação final aparece somente na revisão.
  it('deve renderizar o botão Finalizar pedido na revisão', () => {
    renderComponent('review');

    expect(
      screen.getByText(
        /confira os dados de entrega e pagamento antes de concluir/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Finalizar pedido',
      }),
    ).toBeEnabled();
  });

  // Garante que a ação final recebida é executada.
  it('deve chamar onFinalize ao finalizar o pedido', () => {
    renderComponent('review');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Finalizar pedido',
      }),
    );

    expect(onFinalizeMock).toHaveBeenCalledTimes(1);
  });

  // Garante que não é possível finalizar quando o carrinho está vazio.
  it('deve desabilitar a finalização quando o carrinho estiver vazio', () => {
    useCartStoreMock.mockImplementation((selector) =>
      selector({
        items: [],
      }),
    );

    renderComponent('review');

    expect(
      screen.getByRole('button', {
        name: 'Finalizar pedido',
      }),
    ).toBeDisabled();

    expect(
      screen.getAllByText('R$ 0,00'),
    ).toHaveLength(2);
  });
});