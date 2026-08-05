import { describe, expect, it } from 'vitest';

import type { CheckoutFormData } from '@/components/checkout/checkout-form';
import { validateCheckoutForm } from '@/lib/validators/checkout';

const VALID_FORM_DATA: CheckoutFormData = {
  city: 'Ribeirão Preto',
  complement: '',
  email: 'guilherme@example.com',
  name: 'Guilherme Nobre',
  neighborhood: 'Centro',
  number: '123',
  phone: '(16) 99999-8888',
  state: 'SP',
  street: 'Rua das Flores',
  zipCode: '14010-120',
};

describe('validateCheckoutForm', () => {
  it('deve retornar vazio quando todos os dados forem válidos', () => {
    expect(validateCheckoutForm(VALID_FORM_DATA)).toEqual({});
  });

  it('deve exigir o nome completo', () => {
    const errors = validateCheckoutForm({
      ...VALID_FORM_DATA,
      name: '   ',
    });

    expect(errors.name).toBe('Informe seu nome completo.');
  });

  it('deve exigir o e-mail', () => {
    const errors = validateCheckoutForm({
      ...VALID_FORM_DATA,
      email: '',
    });

    expect(errors.email).toBe('Informe seu e-mail.');
  });

  it('deve rejeitar um e-mail inválido', () => {
    const errors = validateCheckoutForm({
      ...VALID_FORM_DATA,
      email: 'email-invalido',
    });

    expect(errors.email).toBe('Informe um e-mail válido.');
  });

  it.each([
    ['', 'Informe um telefone válido.'],
    ['169999999', 'Informe um telefone válido.'],
    ['169999999999', 'Informe um telefone válido.'],
  ])('deve rejeitar o telefone %s', (phone, expected) => {
    const errors = validateCheckoutForm({
      ...VALID_FORM_DATA,
      phone,
    });

    expect(errors.phone).toBe(expected);
  });

  it.each([
    ['1633334444'],
    ['16999998888'],
    ['(16) 99999-8888'],
  ])('deve aceitar o telefone %s', (phone) => {
    const errors = validateCheckoutForm({
      ...VALID_FORM_DATA,
      phone,
    });

    expect(errors.phone).toBeUndefined();
  });

  it.each([
    [''],
    ['1401012'],
    ['140101200'],
  ])('deve rejeitar o CEP %s', (zipCode) => {
    const errors = validateCheckoutForm({
      ...VALID_FORM_DATA,
      zipCode,
    });

    expect(errors.zipCode).toBe('Informe um CEP válido.');
  });

  it.each([
    ['14010120'],
    ['14010-120'],
  ])('deve aceitar o CEP %s', (zipCode) => {
    const errors = validateCheckoutForm({
      ...VALID_FORM_DATA,
      zipCode,
    });

    expect(errors.zipCode).toBeUndefined();
  });

  it.each([
    [''],
    ['S'],
    ['SPO'],
    ['1P'],
  ])('deve rejeitar o estado %s', (state) => {
    const errors = validateCheckoutForm({
      ...VALID_FORM_DATA,
      state,
    });

    expect(errors.state).toBe('Informe a sigla do estado.');
  });

  it.each([
    ['street', 'Informe a rua.'],
    ['number', 'Informe o número.'],
    ['neighborhood', 'Informe o bairro.'],
    ['city', 'Informe a cidade.'],
  ] as const)(
    'deve exigir o campo %s',
    (field, expectedMessage) => {
      const errors = validateCheckoutForm({
        ...VALID_FORM_DATA,
        [field]: '   ',
      });

      expect(errors[field]).toBe(expectedMessage);
    },
  );

  it('não deve exigir complemento', () => {
    const errors = validateCheckoutForm({
      ...VALID_FORM_DATA,
      complement: '',
    });

    expect(errors.complement).toBeUndefined();
  });

  it('deve retornar vários erros ao mesmo tempo', () => {
    const errors = validateCheckoutForm({
      ...VALID_FORM_DATA,
      email: 'inválido',
      name: '',
      phone: '123',
      zipCode: '123',
    });

    expect(errors).toEqual({
      email: 'Informe um e-mail válido.',
      name: 'Informe seu nome completo.',
      phone: 'Informe um telefone válido.',
      zipCode: 'Informe um CEP válido.',
    });
  });
});