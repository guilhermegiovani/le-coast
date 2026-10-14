
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';
import {
    addCartItem,
    clearCartItems,
    deleteCartItem,
    getCart,
    updateCartItem,
} from '@/services/cart-service';

// Simula o Axios para testar o serviço sem fazer requisições reais.
vi.mock('@/lib/api', () => ({
    api: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('cart-service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCart', () => {
        it('deve buscar o carrinho do usuário', async () => {
            const cart = {
                id: 1,
                userId: 2,
                items: [],
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            };

            vi.mocked(api.get).mockResolvedValueOnce({
                data: cart,
            });

            const result = await getCart();

            expect(api.get).toHaveBeenCalledWith('/cart');
            expect(result).toEqual(cart);
        });
    });

    describe('addCartItem', () => {
        it('deve adicionar uma variante ao carrinho', async () => {
            const input = {
                variantId: 1,
                quantity: 2,
            };

            const cartItem = {
                id: 10,
                cartId: 1,
                variantId: 1,
                quantity: 2,
                unitPrice: 89.9,
                variant: {
                    id: 1,
                    productId: 1,
                    sizeId: 1,
                    colorId: 1,
                    sku: 'LC-TEST-PRETO-M',
                    price: 89.9,
                    stock: 10,
                    isActive: true,
                    product: {
                        id: 1,
                        name: 'Top Essential',
                        slug: 'top-essential',
                    },
                },
            };

            vi.mocked(api.post).mockResolvedValueOnce({
                data: cartItem,
            });

            const result = await addCartItem(input);

            expect(api.post).toHaveBeenCalledWith('/cart/items', input);
            expect(result).toEqual(cartItem);
        });
    });

    describe('updateCartItem', () => {
        it('deve atualizar a quantidade de um item', async () => {
            const cartItem = {
                id: 10,
                cartId: 1,
                variantId: 1,
                quantity: 3,
                unitPrice: 89.9,
                variant: {
                    id: 1,
                    productId: 1,
                    sizeId: 1,
                    colorId: 1,
                    sku: 'LC-TEST-PRETO-M',
                    price: 89.9,
                    stock: 10,
                    isActive: true,
                    product: {
                        id: 1,
                        name: 'Top Essential',
                        slug: 'top-essential',
                    },
                },
            };

            vi.mocked(api.patch).mockResolvedValueOnce({
                data: cartItem,
            });

            const result = await updateCartItem(10, 3);

            expect(api.patch).toHaveBeenCalledWith('/cart/items/10', {
                quantity: 3,
            });
            expect(result).toEqual(cartItem);
        });
    });

    describe('deleteCartItem', () => {
        it('deve remover um item específico do carrinho', async () => {
            vi.mocked(api.delete).mockResolvedValueOnce({
                data: undefined,
            });

            await expect(deleteCartItem(10)).resolves.toBeUndefined();

            expect(api.delete).toHaveBeenCalledWith('/cart/items/10');
        });
    });

    describe('clearCartItems', () => {
        it('deve remover todos os itens do carrinho', async () => {
            vi.mocked(api.delete).mockResolvedValueOnce({
                data: undefined,
            });

            await expect(clearCartItems()).resolves.toBeUndefined();

            expect(api.delete).toHaveBeenCalledWith('/cart/items');
        });
    });

    describe('propagação de erros', () => {
        it('deve propagar o erro ao buscar o carrinho', async () => {
            const error = new Error('Erro ao buscar carrinho');

            vi.mocked(api.get).mockRejectedValueOnce(error);

            await expect(getCart()).rejects.toBe(error);
        });

        it('deve propagar o erro ao limpar o carrinho', async () => {
            const error = new Error('Erro ao limpar carrinho');

            vi.mocked(api.delete).mockRejectedValueOnce(error);

            await expect(clearCartItems()).rejects.toBe(error);
        });
    });
});
