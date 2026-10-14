import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore } from '@/stores/cart-store';
import {
  getCart,
  addCartItem,
  clearCartItems,
  deleteCartItem,
  updateCartItem,
} from '@/services/cart-service';
import { hasApiAccessToken } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  hasApiAccessToken: vi.fn(),
}));

vi.mock('@/services/cart-service', () => ({
  getCart: vi.fn(),
  addCartItem: vi.fn(),
  clearCartItems: vi.fn(),
  deleteCartItem: vi.fn(),
  updateCartItem: vi.fn(),
}));

const FIRST_VARIANT = {
  color: {
    id: 1,
    name: 'Preto',
    slug: 'preto',
  },
  colorId: 1,
  id: 1,
  isActive: true,
  price: 89.9,
  productId: 1,
  size: {
    id: 1,
    name: 'P',
    slug: 'p',
  },
  sizeId: 1,
  sku: 'TOP-ESS-P-PRE',
  stock: 3,
};

const SECOND_VARIANT = {
  color: {
    id: 2,
    name: 'Rosa',
    slug: 'rosa',
  },
  colorId: 2,
  id: 2,
  isActive: true,
  price: 99.9,
  productId: 1,
  size: {
    id: 2,
    name: 'M',
    slug: 'm',
  },
  sizeId: 2,
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
    vi.clearAllMocks();
    vi.mocked(hasApiAccessToken).mockReturnValue(true);
    useCartStore.setState({
      items: [],
      isLoading: false,
    });
  });

  // Garante que uma nova variante é adicionada com quantidade inicial 1.
  it('deve adicionar um novo item ao carrinho', async () => {
    vi.mocked(addCartItem).mockResolvedValue({
      id: 1,
      cartId: 1,
      variantId: FIRST_VARIANT.id,
      quantity: 1,
      unitPrice: FIRST_VARIANT.price,
      variant: {
        ...FIRST_VARIANT,
        product: {
          id: FIRST_ITEM.productId,
          name: FIRST_ITEM.productName,
          slug: FIRST_ITEM.productSlug,
        },
      },
    });

    await useCartStore.getState().addItem(FIRST_ITEM);
    expect(useCartStore.getState().items).toEqual([
      {
        id: 1,
        ...FIRST_ITEM,
        quantity: 1,
        variant: {
          ...FIRST_VARIANT,
          product: {
            id: FIRST_ITEM.productId,
            name: FIRST_ITEM.productName,
            slug: FIRST_ITEM.productSlug,
          },
        },
      },
    ]);
  });

  // Garante que adicionar a mesma variante aumenta a quantidade.
  it('deve aumentar a quantidade quando a variante já existir', async () => {
    vi.mocked(addCartItem)
      .mockResolvedValueOnce({
        id: 1,
        cartId: 1,
        variantId: FIRST_VARIANT.id,
        quantity: 1,
        unitPrice: FIRST_VARIANT.price,
        variant: {
          ...FIRST_VARIANT,
          product: {
            id: FIRST_ITEM.productId,
            name: FIRST_ITEM.productName,
            slug: FIRST_ITEM.productSlug,
          },
        },
      })
      .mockResolvedValueOnce({
        id: 1,
        cartId: 1,
        variantId: FIRST_VARIANT.id,
        quantity: 2,
        unitPrice: FIRST_VARIANT.price,
        variant: {
          ...FIRST_VARIANT,
          product: {
            id: FIRST_ITEM.productId,
            name: FIRST_ITEM.productName,
            slug: FIRST_ITEM.productSlug,
          },
        },
      });

    await useCartStore.getState().addItem(FIRST_ITEM);
    await useCartStore.getState().addItem(FIRST_ITEM);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });
  // Garante que a quantidade não ultrapassa o estoque ao adicionar.
  it('deve respeitar o estoque ao adicionar repetidamente', async () => {
    const cartItem = {
      id: 1,
      cartId: 1,
      variantId: FIRST_VARIANT.id,
      unitPrice: FIRST_VARIANT.price,
      variant: {
        ...FIRST_VARIANT,
        product: {
          id: FIRST_ITEM.productId,
          name: FIRST_ITEM.productName,
          slug: FIRST_ITEM.productSlug,
        },
      },
    };

    vi.mocked(addCartItem)
      .mockResolvedValueOnce({
        ...cartItem,
        quantity: 1,
      })
      .mockResolvedValueOnce({
        ...cartItem,
        quantity: 2,
      })
      .mockResolvedValueOnce({
        ...cartItem,
        quantity: 3,
      });

    await useCartStore.getState().addItem(FIRST_ITEM);
    await useCartStore.getState().addItem(FIRST_ITEM);
    await useCartStore.getState().addItem(FIRST_ITEM);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  // Garante que variantes diferentes são armazenadas como itens distintos.
  it('deve adicionar variantes diferentes como itens separados', async () => {
    vi.mocked(addCartItem)
      .mockResolvedValueOnce({
        id: 1,
        cartId: 1,
        variantId: FIRST_VARIANT.id,
        quantity: 1,
        unitPrice: FIRST_VARIANT.price,
        variant: {
          ...FIRST_VARIANT,
          product: {
            id: FIRST_ITEM.productId,
            name: FIRST_ITEM.productName,
            slug: FIRST_ITEM.productSlug,
          },
        },
      })
      .mockResolvedValueOnce({
        id: 2,
        cartId: 1,
        variantId: SECOND_VARIANT.id,
        quantity: 1,
        unitPrice: SECOND_VARIANT.price,
        variant: {
          ...SECOND_VARIANT,
          product: {
            id: SECOND_ITEM.productId,
            name: SECOND_ITEM.productName,
            slug: SECOND_ITEM.productSlug,
          },
        },
      });

    await useCartStore.getState().addItem(FIRST_ITEM);
    await useCartStore.getState().addItem(SECOND_ITEM);
    expect(useCartStore.getState().items).toHaveLength(2);
    expect(useCartStore.getState().items).toEqual([
      {
        id: 1,
        ...FIRST_ITEM,
        quantity: 1,
        variant: {
          ...FIRST_VARIANT,
          product: {
            id: FIRST_ITEM.productId,
            name: FIRST_ITEM.productName,
            slug: FIRST_ITEM.productSlug,
          },
        },
      },
      {
        id: 2,
        ...SECOND_ITEM,
        quantity: 1,
        variant: {
          ...SECOND_VARIANT,
          product: {
            id: SECOND_ITEM.productId,
            name: SECOND_ITEM.productName,
            slug: SECOND_ITEM.productSlug,
          },
        },
      },
    ]);
  });

  // Garante que um item pode ser removido pelo ID da variante.

  // Garante que o item seja excluído no backend antes de removê-lo da store.
  it('deve remover um item do carrinho usando o backend', async () => {
    useCartStore.setState({
      items: [
        { id: 1, ...FIRST_ITEM, quantity: 1 },
        { id: 2, ...SECOND_ITEM, quantity: 1 },
      ],
    });

    vi.mocked(deleteCartItem).mockResolvedValue(undefined);

    await useCartStore.getState().removeItem(FIRST_VARIANT.id);

    expect(deleteCartItem).toHaveBeenCalledOnce();
    expect(deleteCartItem).toHaveBeenCalledWith(1);
    expect(useCartStore.getState().items).toEqual([
      { id: 2, ...SECOND_ITEM, quantity: 1 },
    ]);
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  // Garante que, sem autenticação, o item seja removido apenas localmente.
  it('deve remover um item localmente sem autenticação', async () => {
    vi.mocked(hasApiAccessToken).mockReturnValue(false);

    useCartStore.setState({
      items: [
        { id: 1, ...FIRST_ITEM, quantity: 1 },
        { id: 2, ...SECOND_ITEM, quantity: 1 },
      ],
    });

    await useCartStore.getState().removeItem(FIRST_VARIANT.id);

    expect(deleteCartItem).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toEqual([
      { id: 2, ...SECOND_ITEM, quantity: 1 },
    ]);
  });

  // Garante que uma falha na API não remova o item da store.
  it('deve manter o item no carrinho quando a remoção no backend falhar', async () => {
    useCartStore.setState({
      items: [{ id: 1, ...FIRST_ITEM, quantity: 1 }],
    });

    vi.mocked(deleteCartItem).mockRejectedValue(
      new Error('Falha ao remover o item.'),
    );

    await expect(
      useCartStore.getState().removeItem(FIRST_VARIANT.id),
    ).rejects.toThrow('Falha ao remover o item.');

    expect(useCartStore.getState().items).toEqual([
      { id: 1, ...FIRST_ITEM, quantity: 1 },
    ]);
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  // Garante que um item inexistente não provoque uma chamada à API.
  it('não deve chamar o backend quando o item não existir', async () => {
    await useCartStore.getState().removeItem(FIRST_VARIANT.id);

    expect(deleteCartItem).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toEqual([]);
  });


  // Garante que a quantidade pode ser atualizada diretamente.
  it('deve atualizar a quantidade de um item', async () => {
    vi.mocked(addCartItem).mockResolvedValue({
      id: 1,
      cartId: 1,
      variantId: FIRST_VARIANT.id,
      quantity: 1,
      unitPrice: FIRST_VARIANT.price,
      variant: {
        ...FIRST_VARIANT,
        product: {
          id: FIRST_ITEM.productId,
          name: FIRST_ITEM.productName,
          slug: FIRST_ITEM.productSlug,
        },
      },
    });

    await useCartStore.getState().addItem(FIRST_ITEM);

    vi.mocked(updateCartItem).mockResolvedValue({
      id: 1,
      cartId: 1,
      variantId: FIRST_VARIANT.id,
      quantity: 2,
      unitPrice: FIRST_VARIANT.price,
      variant: {
        ...FIRST_VARIANT,
        product: {
          id: FIRST_ITEM.productId,
          name: FIRST_ITEM.productName,
          slug: FIRST_ITEM.productSlug,
        },
      },
    });

    await useCartStore.getState().updateQuantity(FIRST_VARIANT.id, 2);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  // Garante que a quantidade nunca fica abaixo de 1.
  it('deve limitar a quantidade mínima a 1', async () => {
    vi.mocked(addCartItem).mockResolvedValue({
      id: 1,
      cartId: 1,
      variantId: FIRST_VARIANT.id,
      quantity: 1,
      unitPrice: FIRST_VARIANT.price,
      variant: {
        ...FIRST_VARIANT,
        product: {
          id: FIRST_ITEM.productId,
          name: FIRST_ITEM.productName,
          slug: FIRST_ITEM.productSlug,
        },
      },
    });

    await useCartStore.getState().addItem(FIRST_ITEM);
    vi.mocked(updateCartItem).mockResolvedValue({
      id: 1,
      cartId: 1,
      variantId: FIRST_VARIANT.id,
      quantity: 1,
      unitPrice: FIRST_VARIANT.price,
      variant: {
        ...FIRST_VARIANT,
        product: {
          id: FIRST_ITEM.productId,
          name: FIRST_ITEM.productName,
          slug: FIRST_ITEM.productSlug,
        },
      },
    });

    await useCartStore.getState().updateQuantity(FIRST_VARIANT.id, 0);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  // Garante que a quantidade nunca ultrapassa o estoque da variante.
  it('deve limitar a quantidade máxima ao estoque', async () => {
    vi.mocked(addCartItem).mockResolvedValue({
      id: 1,
      cartId: 1,
      variantId: FIRST_VARIANT.id,
      quantity: 1,
      unitPrice: FIRST_VARIANT.price,
      variant: {
        ...FIRST_VARIANT,
        product: {
          id: FIRST_ITEM.productId,
          name: FIRST_ITEM.productName,
          slug: FIRST_ITEM.productSlug,
        },
      },
    });

    await useCartStore.getState().addItem(FIRST_ITEM);
    vi.mocked(updateCartItem).mockResolvedValue({
      id: 1,
      cartId: 1,
      variantId: FIRST_VARIANT.id,
      quantity: FIRST_VARIANT.stock,
      unitPrice: FIRST_VARIANT.price,
      variant: {
        ...FIRST_VARIANT,
        product: {
          id: FIRST_ITEM.productId,
          name: FIRST_ITEM.productName,
          slug: FIRST_ITEM.productSlug,
        },
      },
    });

    await useCartStore.getState().updateQuantity(FIRST_VARIANT.id, 10);
    expect(useCartStore.getState().items[0].quantity).toBe(
      FIRST_VARIANT.stock,
    );
  });

  // Garante que todos os itens podem ser removidos de uma vez.
  it('deve limpar o carrinho local sem chamar o backend', async () => {
    vi.mocked(hasApiAccessToken).mockReturnValue(false);

    await useCartStore.getState().addItem(FIRST_ITEM);
    await useCartStore.getState().addItem(SECOND_ITEM);
    await useCartStore.getState().clearCart();
    expect(clearCartItems).not.toHaveBeenCalled();
    expect(useCartStore.getState().items).toEqual([]);
  });

  // Garante que o carrinho retornado pela API é convertido para o formato usado pela store.
  it('deve carregar o carrinho do backend', async () => {
    vi.mocked(getCart).mockResolvedValue({
      id: 1,
      userId: 3,
      createdAt: '2026-09-21T10:00:00.000Z',
      updatedAt: '2026-09-21T10:00:00.000Z',
      items: [
        {
          id: 1,
          cartId: 1,
          variantId: FIRST_VARIANT.id,
          quantity: 2,
          unitPrice: FIRST_VARIANT.price,
          variant: {
            ...FIRST_VARIANT,
            product: {
              id: 1,
              name: 'Top Essential',
              slug: 'top-essential',
            },
          },
        },
      ],
    });

    await useCartStore.getState().loadCart();
    expect(useCartStore.getState().items).toEqual([
      {
        id: 1,
        productId: 1,
        productName: 'Top Essential',
        productSlug: 'top-essential',
        quantity: 2,
        variant: {
          ...FIRST_VARIANT,
          product: {
            id: 1,
            name: 'Top Essential',
            slug: 'top-essential',
          },
        },
      },
    ]);
    expect(useCartStore.getState().isLoading).toBe(false);
    expect(getCart).toHaveBeenCalledOnce();
  });

  // Garante que a adição do item seja enviada ao backend e sincronizada com a store.
  it('deve adicionar um item usando o backend', async () => {
    vi.mocked(addCartItem).mockResolvedValue({
      id: 1,
      cartId: 1,
      variantId: FIRST_VARIANT.id,
      quantity: 1,
      unitPrice: FIRST_VARIANT.price,
      variant: {
        ...FIRST_VARIANT,
        product: {
          id: FIRST_ITEM.productId,
          name: FIRST_ITEM.productName,
          slug: FIRST_ITEM.productSlug,
        },
      },
    });

    await useCartStore.getState().addItem(FIRST_ITEM);
    expect(addCartItem).toHaveBeenCalledOnce();
    expect(addCartItem).toHaveBeenCalledWith({
      variantId: FIRST_VARIANT.id,
      quantity: 1,
    });
    expect(useCartStore.getState().items).toEqual([
      {
        id: 1,
        productId: FIRST_ITEM.productId,
        productName: FIRST_ITEM.productName,
        productSlug: FIRST_ITEM.productSlug,
        quantity: 1,
        variant: {
          ...FIRST_VARIANT,
          product: {
            id: FIRST_ITEM.productId,
            name: FIRST_ITEM.productName,
            slug: FIRST_ITEM.productSlug,
          },
        },
      },
    ]);
    expect(useCartStore.getState().isLoading).toBe(false);
  });

  // Garante que o estado de carregamento seja encerrado quando a API falhar.
  it('deve encerrar o carregamento quando ocorrer erro ao buscar o carrinho', async () => {
    vi.mocked(getCart).mockRejectedValue(
      new Error('Falha ao carregar o carrinho.'),
    );

    await expect(
      useCartStore.getState().loadCart(),
    ).rejects.toThrow('Falha ao carregar o carrinho.');

    expect(useCartStore.getState().isLoading).toBe(false);
    expect(useCartStore.getState().items).toEqual([]);
  });

  // Verifica se a limpeza é enviada ao backend antes de atualizar a store.
  it('deve limpar o carrinho usando o backend', async () => {
    vi.mocked(clearCartItems).mockResolvedValue(undefined);

    useCartStore.setState({
      items: [
        {
          id: 1,
          ...FIRST_ITEM,
          quantity: 1,
        },
        {
          id: 2,
          ...SECOND_ITEM,
          quantity: 1,
        },
      ],
    });
    await useCartStore.getState().clearCart();
    expect(clearCartItems).toHaveBeenCalledOnce();
    expect(useCartStore.getState().items).toEqual([]);
  });
});