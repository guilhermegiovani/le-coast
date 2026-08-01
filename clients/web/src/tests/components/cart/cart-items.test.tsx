import { fireEvent, render, screen } from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { CartItems } from '@/components/cart/cart-items';

const {
  removeItemMock,
  updateQuantityMock,
  useCartStoreMock,
} = vi.hoisted(() => ({
  removeItemMock: vi.fn(),
  updateQuantityMock: vi.fn(),
  useCartStoreMock: vi.fn(),
}));

vi.mock('@/stores/cart-store', () => ({
  useCartStore: (
    selector: (state: {
      items: typeof CART_ITEMS;
      removeItem: typeof removeItemMock;
      updateQuantity: typeof updateQuantityMock;
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
];

describe('CartItems', () => {
  beforeEach(() => {
    removeItemMock.mockClear();
    updateQuantityMock.mockClear();

    useCartStoreMock.mockImplementation((selector) =>
      selector({
        items: CART_ITEMS,
        removeItem: removeItemMock,
        updateQuantity: updateQuantityMock,
      }),
    );
  });

  // Garante que o estado vazio é exibido quando não existem itens.
  it('deve renderizar a mensagem de carrinho vazio', () => {
    useCartStoreMock.mockImplementation((selector) =>
      selector({
        items: [],
        removeItem: removeItemMock,
        updateQuantity: updateQuantityMock,
      }),
    );

    render(<CartItems />);

    expect(
      screen.getByText('Seu carrinho está vazio.'),
    ).toBeInTheDocument();
  });

  // Garante que os dados do produto e da variante aparecem.
  it('deve renderizar os dados do item', () => {
    render(<CartItems />);

    expect(
      screen.getByRole('link', {
        name: 'Top Essential',
      }),
    ).toHaveAttribute(
      'href',
      '/products/top-essential',
    );

    expect(screen.getByText('Cor: Preto')).toBeInTheDocument();
    expect(screen.getByText('Tamanho: P')).toBeInTheDocument();

    expect(
      screen.getByText('Unitário: R$ 89,90'),
    ).toBeInTheDocument();
  });

  // Garante que o subtotal considera preço e quantidade.
  it('deve renderizar o subtotal do item', () => {
    render(<CartItems />);

    expect(
      screen.getByText('Subtotal: R$ 179,80'),
    ).toBeInTheDocument();
  });

  // Garante que a quantidade atual aparece para o usuário.
  it('deve renderizar a quantidade atual', () => {
    render(<CartItems />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  // Garante que o botão de aumentar envia a próxima quantidade.
  it('deve aumentar a quantidade do item', () => {
    render(<CartItems />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Aumentar quantidade de Top Essential',
      }),
    );

    expect(updateQuantityMock).toHaveBeenCalledWith(1, 3);
  });

  // Garante que o botão de diminuir envia a quantidade anterior.
  it('deve diminuir a quantidade do item', () => {
    render(<CartItems />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Diminuir quantidade de Top Essential',
      }),
    );

    expect(updateQuantityMock).toHaveBeenCalledWith(1, 1);
  });

  // Garante que o item pode ser removido do carrinho.
  it('deve remover o item', () => {
    render(<CartItems />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remover',
      }),
    );

    expect(removeItemMock).toHaveBeenCalledWith(1);
  });

  // Garante que não é possível diminuir abaixo de uma unidade.
  it('deve desabilitar o botão de diminuir quando a quantidade for 1', () => {
    useCartStoreMock.mockImplementation((selector) =>
      selector({
        items: [
          {
            ...CART_ITEMS[0],
            quantity: 1,
          },
        ],
        removeItem: removeItemMock,
        updateQuantity: updateQuantityMock,
      }),
    );

    render(<CartItems />);

    expect(
      screen.getByRole('button', {
        name: 'Diminuir quantidade de Top Essential',
      }),
    ).toBeDisabled();
  });

  // Garante que não é possível ultrapassar o estoque disponível.
  it('deve desabilitar o botão de aumentar no limite do estoque', () => {
    useCartStoreMock.mockImplementation((selector) =>
      selector({
        items: [
          {
            ...CART_ITEMS[0],
            quantity: CART_ITEMS[0].variant.stock,
          },
        ],
        removeItem: removeItemMock,
        updateQuantity: updateQuantityMock,
      }),
    );

    render(<CartItems />);

    expect(
      screen.getByRole('button', {
        name: 'Aumentar quantidade de Top Essential',
      }),
    ).toBeDisabled();
  });
});