import {
    describe,
    expect,
    it,
} from 'vitest';

import {
    createProductVariantSchema,
    updateProductVariantSchema,
} from '../../validators/product-variant-validator.js';

const VALID_VARIANT = {
    productId: 1,
    sizeId: 1,
    colorId: 1,
    sku: 'TOP-ESS-M-PRETO',
    price: 79.9,
    stock: 10,
};

describe('createProductVariantSchema', () => {
    // Garante que os dados mínimos necessários
    // para cadastrar uma variante sejam aceitos.
    it('deve aceitar uma variante válida', () => {
        const result =
            createProductVariantSchema.safeParse(
                VALID_VARIANT,
            );

        expect(result.success).toBe(true);
    });

    // Garante que productId seja um identificador
    // inteiro e positivo.
    it('não deve aceitar productId inválido', () => {
        const result =
            createProductVariantSchema.safeParse({
                ...VALID_VARIANT,
                productId: 0,
            });

        expect(result.success).toBe(false);
    });

    // Garante que sizeId seja um identificador
    // inteiro e positivo.
    it('não deve aceitar sizeId inválido', () => {
        const result =
            createProductVariantSchema.safeParse({
                ...VALID_VARIANT,
                sizeId: -1,
            });

        expect(result.success).toBe(false);
    });

    // Garante que colorId seja um identificador
    // inteiro e positivo.
    it('não deve aceitar colorId inválido', () => {
        const result =
            createProductVariantSchema.safeParse({
                ...VALID_VARIANT,
                colorId: 0,
            });

        expect(result.success).toBe(false);
    });

    // Garante que o SKU não possa ser vazio.
    it('não deve aceitar SKU vazio', () => {
        const result =
            createProductVariantSchema.safeParse({
                ...VALID_VARIANT,
                sku: '   ',
            });

        expect(result.success).toBe(false);
    });

    // Garante que espaços externos sejam removidos
    // do SKU antes dos dados seguirem adiante.
    it('deve remover espaços externos do SKU', () => {
        const result =
            createProductVariantSchema.safeParse({
                ...VALID_VARIANT,
                sku: '  TOP-ESS-M-PRETO  ',
            });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.sku).toBe(
                'TOP-ESS-M-PRETO',
            );
        }
    });

    // Garante que o preço não possa ser negativo.
    it('não deve aceitar preço negativo', () => {
        const result =
            createProductVariantSchema.safeParse({
                ...VALID_VARIANT,
                price: -10,
            });

        expect(result.success).toBe(false);
    });

    // Garante que o estoque seja inteiro.
    it('não deve aceitar estoque decimal', () => {
        const result =
            createProductVariantSchema.safeParse({
                ...VALID_VARIANT,
                stock: 10.5,
            });

        expect(result.success).toBe(false);
    });

    // Garante que o estoque não possa ser negativo.
    it('não deve aceitar estoque negativo', () => {
        const result =
            createProductVariantSchema.safeParse({
                ...VALID_VARIANT,
                stock: -1,
            });

        expect(result.success).toBe(false);
    });

    // Garante que o estoque seja opcional e,
    // quando omitido, assuma o valor padrão definido
    // posteriormente pela camada de persistência.
    it('deve aceitar variante sem estoque', () => {
        const {
            stock: _stock,
            ...variantWithoutStock
        } = VALID_VARIANT;

        const result =
            createProductVariantSchema.safeParse(
                variantWithoutStock,
            );

        expect(result.success).toBe(true);
    });
});

describe('updateProductVariantSchema', () => {
    // Garante que uma atualização parcial válida
    // seja aceita.
    it('deve aceitar atualização válida', () => {
        const result =
            updateProductVariantSchema.safeParse({
                price: 89.9,
                stock: 20,
                isActive: false,
            });

        expect(result.success).toBe(true);
    });

    // Garante que nenhum campo seja obrigatório
    // durante uma atualização parcial.
    it('deve aceitar atualização parcial', () => {
        const result =
            updateProductVariantSchema.safeParse({
                price: 89.9,
            });

        expect(result.success).toBe(true);
    });

    // productId não deve fazer parte da atualização,
    // pois uma variante não pode ser movida para outro produto.
    it('não deve aceitar productId na atualização', () => {
        const result =
            updateProductVariantSchema.safeParse({
                productId: 2,
            });

        expect(result.success).toBe(false);
    });

    // Garante que preço negativo seja rejeitado
    // durante uma atualização.
    it('não deve aceitar preço negativo na atualização', () => {
        const result =
            updateProductVariantSchema.safeParse({
                price: -1,
            });

        expect(result.success).toBe(false);
    });

    // Garante que estoque decimal seja rejeitado
    // durante uma atualização.
    it('não deve aceitar estoque decimal na atualização', () => {
        const result =
            updateProductVariantSchema.safeParse({
                stock: 5.5,
            });

        expect(result.success).toBe(false);
    });

    // Garante que valores inválidos para isActive
    // sejam rejeitados.
    it('não deve aceitar isActive que não seja booleano', () => {
        const result =
            updateProductVariantSchema.safeParse({
                isActive: 'false',
            });

        expect(result.success).toBe(false);
    });

    // Garante que um SKU vazio não seja aceito
    // durante uma atualização.
    it('não deve aceitar SKU vazio na atualização', () => {
        const result =
            updateProductVariantSchema.safeParse({
                sku: '   ',
            });

        expect(result.success).toBe(false);
    });
});