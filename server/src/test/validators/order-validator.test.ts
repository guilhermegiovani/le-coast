import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  createOrderSchema,
} from '../../validators/order-validator.js';

const VALID_ORDER = {
  address: {
    city: 'Ribeirão Preto',
    complement: 'Apto 12',
    country: 'BR',
    name: 'Casa',
    neighborhood: 'Centro',
    number: '100',
    state: 'SP',
    street: 'Rua Exemplo',
    zipCode: '14000-000',
  },
  items: [
    {
      quantity: 2,
      unitPrice: 79.9,
      variantId: 1,
    },
  ],
};

describe('createOrderSchema', () => {
  // Garante que um pedido contendo endereço e
  // pelo menos um item válido seja aceito.
  it('deve aceitar um pedido válido', () => {
    const result =
      createOrderSchema.safeParse(VALID_ORDER);

    expect(result.success).toBe(true);
  });

  // Garante que o pedido possua pelo menos
  // um item antes de seguir para sua criação.
  it('não deve aceitar um pedido sem itens', () => {
    const result =
      createOrderSchema.safeParse({
        ...VALID_ORDER,
        items: [],
      });

    expect(result.success).toBe(false);
  });

  // Garante que quantidades iguais ou menores
  // que zero não sejam aceitas.
  it('não deve aceitar quantidade inválida', () => {
    const result =
      createOrderSchema.safeParse({
        ...VALID_ORDER,
        items: [
          {
            quantity: 0,
            unitPrice: 79.9,
            variantId: 1,
          },
        ],
      });

    expect(result.success).toBe(false);
  });

  // Garante que a quantidade seja representada
  // somente por números inteiros.
  it('não deve aceitar quantidade decimal', () => {
    const result =
      createOrderSchema.safeParse({
        ...VALID_ORDER,
        items: [
          {
            quantity: 1.5,
            unitPrice: 79.9,
            variantId: 1,
          },
        ],
      });

    expect(result.success).toBe(false);
  });

  // Garante que preços negativos não sejam
  // aceitos na criação do pedido.
  it('não deve aceitar preço negativo', () => {
    const result =
      createOrderSchema.safeParse({
        ...VALID_ORDER,
        items: [
          {
            quantity: 1,
            unitPrice: -10,
            variantId: 1,
          },
        ],
      });

    expect(result.success).toBe(false);
  });

  // Garante que o identificador da variação
  // represente um inteiro positivo.
  it('não deve aceitar variantId inválido', () => {
    const result =
      createOrderSchema.safeParse({
        ...VALID_ORDER,
        items: [
          {
            quantity: 1,
            unitPrice: 79.9,
            variantId: 0,
          },
        ],
      });

    expect(result.success).toBe(false);
  });

  // Garante que os campos obrigatórios do endereço
  // não possam ser enviados vazios.
  it('não deve aceitar endereço incompleto', () => {
    const result =
      createOrderSchema.safeParse({
        ...VALID_ORDER,
        address: {
          ...VALID_ORDER.address,
          street: '',
        },
      });

    expect(result.success).toBe(false);
  });

  // Garante que o complemento continue opcional,
  // já que nem todo endereço possui esse campo.
  it('deve aceitar endereço sem complemento', () => {
    const {
      complement: _complement,
      ...addressWithoutComplement
    } = VALID_ORDER.address;

    const result =
      createOrderSchema.safeParse({
        ...VALID_ORDER,
        address: addressWithoutComplement,
      });

    expect(result.success).toBe(true);
  });

  // Garante que BR seja utilizado como país padrão
  // quando o cliente não informar esse campo.
  it('deve utilizar BR como país padrão', () => {
    const {
      country: _country,
      ...addressWithoutCountry
    } = VALID_ORDER.address;

    const result =
      createOrderSchema.safeParse({
        ...VALID_ORDER,
        address: addressWithoutCountry,
      });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.address.country).toBe('BR');
    }
  });
});