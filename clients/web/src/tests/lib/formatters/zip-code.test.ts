import { describe, expect, it } from 'vitest';

import { formatZipCode } from '@/lib/formatters/zip-code';

// Agrupa os testes do formatador de CEP.
describe('formatZipCode', () => {
  // Garante que uma string vazia continua vazia.
  it('deve retornar vazio quando não houver conteúdo', () => {
    expect(formatZipCode('')).toBe('');
  });

  // Garante que apenas números são mantidos.
  it('deve remover caracteres não numéricos', () => {
    expect(
      formatZipCode('14.010-120'),
    ).toBe('14010-120');
  });

  // Garante que o hífen aparece após o quinto dígito.
  it('deve formatar o CEP corretamente', () => {
    expect(
      formatZipCode('14010120'),
    ).toBe('14010-120');
  });

  // Garante que o tamanho máximo é de oito dígitos.
  it('deve limitar o CEP a oito dígitos', () => {
    expect(
      formatZipCode('140101209999'),
    ).toBe('14010-120');
  });

  // Garante que CEPs incompletos continuam sendo exibidos.
  it.each([
    ['1', '1'],
    ['14', '14'],
    ['140', '140'],
    ['1401', '1401'],
    ['14010', '14010'],
    ['140101', '14010-1'],
    ['1401012', '14010-12'],
  ])(
    'deve formatar %s como %s',
    (value, expected) => {
      expect(formatZipCode(value)).toBe(expected);
    },
  );
});