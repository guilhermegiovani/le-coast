import { z } from 'zod';

// Representa cada item enviado para a criação do pedido.
//
// O cliente informa apenas a variante e a quantidade.
// O preço será obtido pelo backend diretamente da ProductVariant.
export const createOrderItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .positive('A quantidade deve ser maior que zero.'),

  variantId: z
    .number()
    .int()
    .positive('A variação informada é inválida.'),
}).strict();

// Representa o endereço utilizado no pedido.
//
// Os dados são copiados para OrderAddress para preservar
// o histórico mesmo que o usuário altere o endereço depois.
export const createOrderAddressSchema = z.object({
  city: z.string().trim().min(1, 'Informe a cidade.'),
  complement: z.string().trim().optional(),
  country: z.string().trim().default('BR'),
  name: z.string().trim().min(1, 'Informe o nome do endereço.'),
  neighborhood: z.string().trim().min(1, 'Informe o bairro.'),
  number: z.string().trim().min(1, 'Informe o número.'),
  state: z.string().trim().min(1, 'Informe o estado.'),
  street: z.string().trim().min(1, 'Informe a rua.'),
  zipCode: z.string().trim().min(1, 'Informe o CEP.'),
});

// Define os dados necessários para criar um novo pedido.
//
// O userId não faz parte do body porque será obtido
// através do usuário autenticado no JWT.
export const createOrderSchema = z.object({
  address: createOrderAddressSchema,

  items: z
    .array(createOrderItemSchema)
    .min(1, 'O pedido deve possuir pelo menos um item.'),
});

export type CreateOrderInput =
  z.infer<typeof createOrderSchema>;

// Define os status permitidos em uma atualização de pedido.
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ]),
});

export type UpdateOrderStatusInput =
  z.infer<typeof updateOrderStatusSchema>;