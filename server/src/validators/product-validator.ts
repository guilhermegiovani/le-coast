import { z } from 'zod';

// Dados necessários para criar um produto.
export const createProductSchema = z.object({
  categoryId: z
    .number()
    .int()
    .positive('A categoria informada é inválida.'),

  name: z
    .string()
    .trim()
    .min(1, 'O nome do produto é obrigatório.'),

  slug: z
    .string()
    .trim()
    .min(1, 'O slug do produto é obrigatório.'),

  description: z
    .string()
    .trim()
    .optional(),
});

// Campos que podem ser alterados após o cadastro.
export const updateProductSchema = z.object({
  categoryId: z
    .number()
    .int()
    .positive('A categoria informada é inválida.')
    .optional(),

  name: z
    .string()
    .trim()
    .min(1, 'O nome do produto não pode ser vazio.')
    .optional(),

  slug: z
    .string()
    .trim()
    .min(1, 'O slug do produto não pode ser vazio.')
    .optional(),

  description: z
    .string()
    .trim()
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export type CreateProductInput = z.infer<
  typeof createProductSchema
>;

export type UpdateProductInput = z.infer<
  typeof updateProductSchema
>;