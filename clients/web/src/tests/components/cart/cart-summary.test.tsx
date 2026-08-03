import { fireEvent, render, screen } from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { CartSummary } from '@/components/cart/cart-summary';

const { clearCartMock, useCartStoreMock } = vi.hoisted(() => ({
  clearCartMock: vi.fn(),
  useCartStoreMock: vi.fn(),
}));

vi.mock('@/stores/cart-store', () => ({
  useCartStore: (
    selector: (state: {
      items: typeof CART_ITEMS;
      clearCart: typeof clearCartMock;
    }) => unknown,
  ) => useCartStoreMock(selector),
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

describe('CartSummary', () => {
  beforeEach(() => {
    clearCartMock.mockClear();

    useCartStoreMock.mockImplementation((selector) =>
      selector({
        items: CART_ITEMS,
        clearCart: clearCartMock,
      }),
    );
  });

  it('deve renderizar o título do resumo', () => {
    render(<CartSummary />);

    expect(
      screen.getByRole('heading', {
        name: 'Resumo do pedido',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar a quantidade total de unidades', () => {
    render(<CartSummary />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('deve calcular e renderizar o subtotal', () => {
    render(<CartSummary />);

    expect(
      screen.getAllByText('R$ 329,70'),
    ).toHaveLength(2);
  });

  it('deve informar que o frete será calculado no checkout', () => {
    render(<CartSummary />);

    expect(
      screen.getByText('Calculado no checkout'),
    ).toBeInTheDocument();
  });

  it('deve renderizar o link de finalizar compra', () => {
    render(<CartSummary />);

    expect(
      screen.getByRole('link', {
        name: 'Finalizar compra',
      }),
    ).toHaveAttribute('href', '/checkout');
  });

  it('deve limpar o carrinho ao clicar em Esvaziar carrinho', () => {
    render(<CartSummary />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Esvaziar carrinho',
      }),
    );

    expect(clearCartMock).toHaveBeenCalledTimes(1);
  });

  it('deve desabilitar as ações quando o carrinho estiver vazio', () => {
    useCartStoreMock.mockImplementation((selector) =>
      selector({
        items: [],
        clearCart: clearCartMock,
      }),
    );

    render(<CartSummary />);

    expect(
      screen.getByRole('link', {
        name: 'Finalizar compra',
      }),
    ).toHaveAttribute('aria-disabled', 'true');

    expect(
      screen.getByRole('button', {
        name: 'Esvaziar carrinho',
      }),
    ).toBeDisabled();

    expect(
      screen.getAllByText('R$ 0,00'),
    ).toHaveLength(2);
  });
});