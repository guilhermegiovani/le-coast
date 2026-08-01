import { beforeEach, describe, expect, it } from 'vitest';

import { useCartStore } from '@/stores/cart-store';

const FIRST_VARIANT = {
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
  stock: 3,
};

const SECOND_VARIANT = {
  color: {
    id: 2,
    name: 'Rosa',
    slug: 'rosa',
  },
  id: 2,
  price: 99.9,
  size: {
    id: 2,
    name: 'M',
    slug: 'm',
  },
  sku: 'TOP-ESS-M-ROS',
  stock: 5,
};

const FIRST_ITEM = {
  productId: 1,
  productName: 'Top Essential',
  productSlug: 'top-essential',
  variant: FIRST_VARIANT,
};

const SECOND_ITEM = {
  productId: 1,
  productName: 'Top Essential',
  productSlug: 'top-essential',
  variant: SECOND_VARIANT,
};

describe('useCartStore', () => {
  // Limpa o estado da store antes de cada teste para evitar interferência.
  beforeEach(() => {
    useCartStore.setState({
      items: [],
    });
  });

  // Garante que uma nova variante é adicionada com quantidade inicial 1.
  it('deve adicionar um novo item ao carrinho', () => {
    useCartStore.getState().addItem(FIRST_ITEM);

    expect(useCartStore.getState().items).toEqual([
      {
        ...FIRST_ITEM,
        quantity: 1,
      },
    ]);
  });

  // Garante que adicionar a mesma variante aumenta a quantidade.
  it('deve aumentar a quantidade quando a variante já existir', () => {
    useCartStore.getState().addItem(FIRST_ITEM);
    useCartStore.getState().addItem(FIRST_ITEM);

    expect(useCartStore.getState().items).toHaveLength(1);

    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  // Garante que a quantidade não ultrapassa o estoque ao adicionar.
  it('deve respeitar o estoque ao adicionar repetidamente', () => {
    useCartStore.getState().addItem(FIRST_ITEM);
    useCartStore.getState().addItem(FIRST_ITEM);
    useCartStore.getState().addItem(FIRST_ITEM);
    useCartStore.getState().addItem(FIRST_ITEM);

    expect(useCartStore.getState().items[0].quantity).toBe(
      FIRST_VARIANT.stock,
    );
  });

  // Garante que variantes diferentes são armazenadas como itens distintos.
  it('deve adicionar variantes diferentes como itens separados', () => {
    useCartStore.getState().addItem(FIRST_ITEM);
    useCartStore.getState().addItem(SECOND_ITEM);

    expect(useCartStore.getState().items).toHaveLength(2);
  });

  // Garante que um item pode ser removido pelo ID da variante.
  it('deve remover um item do carrinho', () => {
    useCartStore.getState().addItem(FIRST_ITEM);
    useCartStore.getState().addItem(SECOND_ITEM);

    useCartStore
      .getState()
      .removeItem(FIRST_VARIANT.id);

    expect(useCartStore.getState().items).toEqual([
      {
        ...SECOND_ITEM,
        quantity: 1,
      },
    ]);
  });

  // Garante que a quantidade pode ser atualizada diretamente.
  it('deve atualizar a quantidade de um item', () => {
    useCartStore.getState().addItem(FIRST_ITEM);

    useCartStore
      .getState()
      .updateQuantity(FIRST_VARIANT.id, 2);

    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  // Garante que a quantidade nunca fica abaixo de 1.
  it('deve limitar a quantidade mínima a 1', () => {
    useCartStore.getState().addItem(FIRST_ITEM);

    useCartStore
      .getState()
      .updateQuantity(FIRST_VARIANT.id, 0);

    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  // Garante que a quantidade nunca ultrapassa o estoque da variante.
  it('deve limitar a quantidade máxima ao estoque', () => {
    useCartStore.getState().addItem(FIRST_ITEM);

    useCartStore
      .getState()
      .updateQuantity(FIRST_VARIANT.id, 10);

    expect(useCartStore.getState().items[0].quantity).toBe(
      FIRST_VARIANT.stock,
    );
  });

  // Garante que todos os itens podem ser removidos de uma vez.
  it('deve limpar o carrinho', () => {
    useCartStore.getState().addItem(FIRST_ITEM);
    useCartStore.getState().addItem(SECOND_ITEM);

    useCartStore.getState().clearCart();

    expect(useCartStore.getState().items).toEqual([]);
  });
});