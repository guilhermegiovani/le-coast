import { z } from 'zod';

// Representa os dados necessários para adicionar
// uma variante ao carrinho.
export const addCartItemSchema = z
  .object({
    variantId: z
      .number()
      .int()
      .positive('A variação informada é inválida.'),

    quantity: z
      .number()
      .int()
      .positive('A quantidade deve ser maior que zero.'),
  })
  .strict();

export type AddCartItemInput = z.infer<
  typeof addCartItemSchema
>;