import { z } from 'zod';

// Define e valida os dados necessários
// para cadastrar um novo endereço.
export const createAddressSchema = z.object({
  city: z
    .string()
    .trim()
    .min(1, 'Informe a cidade.'),

  complement: z
    .string()
    .trim()
    .optional(),

  country: z
    .string()
    .trim()
    .optional(),

  name: z
    .string()
    .trim()
    .min(1, 'Informe um nome para o endereço.'),

  neighborhood: z
    .string()
    .trim()
    .min(1, 'Informe o bairro.'),

  number: z
    .string()
    .trim()
    .min(1, 'Informe o número.'),

  state: z
    .string()
    .trim()
    .min(1, 'Informe o estado.'),

  street: z
    .string()
    .trim()
    .min(1, 'Informe a rua.'),

  zipCode: z
    .string()
    .trim()
    .min(1, 'Informe o CEP.'),
});

// Reaproveita o schema como fonte do tipo,
// evitando manter tipo e validação separados.
export type CreateAddressInput =
  z.infer<typeof createAddressSchema>;