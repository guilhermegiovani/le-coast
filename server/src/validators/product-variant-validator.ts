import { z } from 'zod';

// Dados necessários para criar uma variante de produto.
export const createProductVariantSchema = z.object({
    productId: z
        .number()
        .int()
        .positive('O produto informado é inválido.'),

    sizeId: z
        .number()
        .int()
        .positive('O tamanho informado é inválido.'),

    colorId: z
        .number()
        .int()
        .positive('A cor informada é inválida.'),

    // O SKU identifica a variante individualmente.
    sku: z
        .string()
        .trim()
        .min(1, 'O SKU é obrigatório.'),

    // O preço não pode ser negativo.
    price: z
        .number()
        .nonnegative('O preço não pode ser negativo.'),

    // Estoque começa em zero quando não for informado.
    stock: z
        .number()
        .int()
        .nonnegative('O estoque não pode ser negativo.')
        .optional(),
});

// Campos que podem ser alterados após o cadastro.
export const updateProductVariantSchema = z.object({
    sizeId: z
        .number()
        .int()
        .positive('O tamanho informado é inválido.')
        .optional(),

    colorId: z
        .number()
        .int()
        .positive('A cor informada é inválida.')
        .optional(),

    sku: z
        .string()
        .trim()
        .min(1, 'O SKU não pode ser vazio.')
        .optional(),

    price: z
        .number()
        .nonnegative('O preço não pode ser negativo.')
        .optional(),

    stock: z
        .number()
        .int()
        .nonnegative('O estoque não pode ser negativo.')
        .optional(),

    isActive: z
        .boolean()
        .optional(),
}).strict();

export type CreateProductVariantInput = z.infer<
    typeof createProductVariantSchema
>;

export type UpdateProductVariantInput = z.infer<
    typeof updateProductVariantSchema
>;