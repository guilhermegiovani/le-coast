import {
  describe,
  expect,
  it,
} from 'vitest';

import { validateRegisterInput } from '../../validators/auth-validator.js';

const VALID_INPUT = {
  email: 'guilherme@example.com',
  name: 'Guilherme Nobre',
  password: '12345678',
};

// Agrupa os testes das regras de validação do cadastro.
describe('validateRegisterInput', () => {
  // Garante que dados válidos sejam aceitos.
  it('não deve lançar erro quando os dados forem válidos', () => {
    expect(() =>
      validateRegisterInput(VALID_INPUT),
    ).not.toThrow();
  });

  // Garante que o nome seja obrigatório.
  it('deve exigir o nome', () => {
    expect(() =>
      validateRegisterInput({
        ...VALID_INPUT,
        name: '   ',
      }),
    ).toThrow('Informe seu nome.');
  });

  // Garante que o e-mail seja obrigatório.
  it('deve exigir o e-mail', () => {
    expect(() =>
      validateRegisterInput({
        ...VALID_INPUT,
        email: '',
      }),
    ).toThrow('Informe seu e-mail.');
  });

  // Garante que e-mails com formato inválido sejam rejeitados.
  it('deve rejeitar um e-mail inválido', () => {
    expect(() =>
      validateRegisterInput({
        ...VALID_INPUT,
        email: 'email-invalido',
      }),
    ).toThrow('Informe um e-mail válido.');
  });

  // Garante que a senha seja obrigatória.
  it('deve exigir a senha', () => {
    expect(() =>
      validateRegisterInput({
        ...VALID_INPUT,
        password: '',
      }),
    ).toThrow('Informe sua senha.');
  });

  // Garante o tamanho mínimo definido para senhas.
  it('deve exigir pelo menos oito caracteres na senha', () => {
    expect(() =>
      validateRegisterInput({
        ...VALID_INPUT,
        password: '1234567',
      }),
    ).toThrow(
      'A senha deve conter pelo menos 8 caracteres.',
    );
  });

  // Garante que falhas de validação sejam tratadas
  // como erros de requisição inválida.
  it('deve retornar status 400 para dados inválidos', () => {
    try {
      validateRegisterInput({
        ...VALID_INPUT,
        email: 'inválido',
      });
    } catch (error) {
      expect(error).toMatchObject({
        statusCode: 400,
      });
    }
  });
});