import {
    describe,
    expect,
    it,
} from 'vitest';

import {
    addCartItemSchema,
} from '../../validators/cart-validator.js';

const VALID_CART_ITEM = {
    variantId: 1,
    quantity: 2,
};

describe('addCartItemSchema', () => {
    // Garante que os dados mínimos necessários
    // para adicionar uma variante ao carrinho sejam aceitos.
    it('deve aceitar um item válido', () => {
        const result =
            addCartItemSchema.safeParse(
                VALID_CART_ITEM,
            );

        expect(result.success).toBe(true);
    });

    // Garante que variantId seja um identificador
    // inteiro e positivo.
    it('não deve aceitar variantId inválido', () => {
        const result =
            addCartItemSchema.safeParse({
                ...VALID_CART_ITEM,
                variantId: 0,
            });

        expect(result.success).toBe(false);
    });

    // Garante que a quantidade seja maior que zero.
    it('não deve aceitar quantidade inválida', () => {
        const result =
            addCartItemSchema.safeParse({
                ...VALID_CART_ITEM,
                quantity: 0,
            });

        expect(result.success).toBe(false);
    });

    // Garante que a quantidade seja um número inteiro.
    it('não deve aceitar quantidade decimal', () => {
        const result =
            addCartItemSchema.safeParse({
                ...VALID_CART_ITEM,
                quantity: 1.5,
            });

        expect(result.success).toBe(false);
    });

    // Garante que campos que não fazem parte do contrato
    // do endpoint sejam rejeitados.
    it('não deve aceitar campos adicionais', () => {
        const result =
            addCartItemSchema.safeParse({
                ...VALID_CART_ITEM,
                unitPrice: 79.9,
            });

        expect(result.success).toBe(false);
    });
});