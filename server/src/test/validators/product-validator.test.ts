import {
    describe,
    expect,
    it,
} from 'vitest';

import {
    createProductSchema,
    updateProductSchema,
} from '../../validators/product-validator.js';

const VALID_PRODUCT = {
    categoryId: 1,
    name: 'Top Essential',
    slug: 'top-essential',
    description: 'Top fitness feminino.',
};

describe('createProductSchema', () => {
    // Garante que os dados mínimos necessários
    // para cadastrar um produto sejam aceitos.
    it('deve aceitar um produto válido', () => {
        const result =
            createProductSchema.safeParse(
                VALID_PRODUCT,
            );

        expect(result.success).toBe(true);
    });

    // Garante que a categoria seja um identificador
    // inteiro e positivo.
    it('não deve aceitar categoryId inválido', () => {
        const result =
            createProductSchema.safeParse({
                ...VALID_PRODUCT,
                categoryId: 0,
            });

        expect(result.success).toBe(false);
    });

    // Garante que o nome não possa ser vazio
    // mesmo quando contém apenas espaços.
    it('não deve aceitar nome vazio', () => {
        const result =
            createProductSchema.safeParse({
                ...VALID_PRODUCT,
                name: '   ',
            });

        expect(result.success).toBe(false);
    });

    // Garante que o slug seja obrigatório.
    it('não deve aceitar slug vazio', () => {
        const result =
            createProductSchema.safeParse({
                ...VALID_PRODUCT,
                slug: '',
            });

        expect(result.success).toBe(false);
    });

    // Garante que espaços externos sejam removidos
    // antes dos dados seguirem para o service.
    it('deve remover espaços externos de strings', () => {
        const result =
            createProductSchema.safeParse({
                categoryId: 1,
                name: '  Top Essential  ',
                slug: '  top-essential  ',
                description: '  Top fitness feminino.  ',
            });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.name).toBe(
                'Top Essential',
            );

            expect(result.data.slug).toBe(
                'top-essential',
            );

            expect(result.data.description).toBe(
                'Top fitness feminino.',
            );
        }
    });

    // Garante que a descrição continue sendo opcional.
    it('deve aceitar produto sem descrição', () => {
        const {
            description: _description,
            ...productWithoutDescription
        } = VALID_PRODUCT;

        const result =
            createProductSchema.safeParse(
                productWithoutDescription,
            );

        expect(result.success).toBe(true);
    });
});

describe('updateProductSchema', () => {
    // Garante que qualquer combinação válida
    // de campos opcionais possa ser atualizada.
    it('deve aceitar atualização válida', () => {
        const result =
            updateProductSchema.safeParse({
                name: 'Top Essential 2',
                slug: 'top-essential-2',
                isActive: false,
                categoryId: 2,
            });

        expect(result.success).toBe(true);
    });

    // Garante que nenhum campo obrigatório seja
    // exigido durante uma atualização parcial.
    it('deve aceitar atualização parcial', () => {
        const result =
            updateProductSchema.safeParse({
                name: 'Top Essential 2',
            });

        expect(result.success).toBe(true);
    });

    // Garante que valores não válidos para isActive
    // sejam rejeitados.
    it('não deve aceitar isActive que não seja booleano', () => {
        const result =
            updateProductSchema.safeParse({
                isActive: 'false',
            });

        expect(result.success).toBe(false);
    });

    // Garante que uma atualização não permita
    // um nome vazio.
    it('não deve aceitar nome vazio na atualização', () => {
        const result =
            updateProductSchema.safeParse({
                name: '   ',
            });

        expect(result.success).toBe(false);
    });
});