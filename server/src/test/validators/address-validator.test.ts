import {
  describe,
  expect,
  it,
} from 'vitest';

import { createAddressSchema } from '../../validators/address-validator.js';

const VALID_ADDRESS_INPUT = {
  city: 'Ribeirão Preto',
  complement: 'Apto 12',
  country: 'BR',
  name: 'Casa',
  neighborhood: 'Centro',
  number: '100',
  state: 'SP',
  street: 'Rua Exemplo',
  zipCode: '14000-000',
};

describe('createAddressSchema', () => {
  // Garante que um endereço completo e válido
  // seja aceito pelo schema.
  it('deve aceitar um endereço válido', () => {
    const result = createAddressSchema.safeParse(
      VALID_ADDRESS_INPUT,
    );

    expect(result.success).toBe(true);
  });

  // Garante que campos opcionais possam
  // ser omitidos da requisição.
  it('deve aceitar endereço sem campos opcionais', () => {
    const {
      complement: _complement,
      country: _country,
      ...input
    } = VALID_ADDRESS_INPUT;

    const result =
      createAddressSchema.safeParse(input);

    expect(result.success).toBe(true);
  });

  // Garante que espaços externos sejam removidos
  // durante a validação.
  it('deve normalizar os campos de texto', () => {
    const result = createAddressSchema.parse({
      ...VALID_ADDRESS_INPUT,
      city: '  Ribeirão Preto  ',
      name: '  Casa  ',
      street: '  Rua Exemplo  ',
    });

    expect(result.city).toBe('Ribeirão Preto');
    expect(result.name).toBe('Casa');
    expect(result.street).toBe('Rua Exemplo');
  });

  // Garante que os campos obrigatórios não possam
  // conter somente espaços em branco.
  it.each([
    ['city', 'Informe a cidade.'],
    ['name', 'Informe um nome para o endereço.'],
    ['neighborhood', 'Informe o bairro.'],
    ['number', 'Informe o número.'],
    ['state', 'Informe o estado.'],
    ['street', 'Informe a rua.'],
    ['zipCode', 'Informe o CEP.'],
  ] as const)(
    'deve rejeitar %s vazio',
    (field, message) => {
      const result = createAddressSchema.safeParse({
        ...VALID_ADDRESS_INPUT,
        [field]: '   ',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.issues[0]?.message,
        ).toBe(message);
      }
    },
  );
});