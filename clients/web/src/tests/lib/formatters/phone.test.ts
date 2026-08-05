import { describe, expect, it } from 'vitest';

import { formatPhone } from '@/lib/formatters/phone';

describe('formatPhone', () => {
  it('deve retornar vazio quando não houver conteúdo', () => {
    expect(formatPhone('')).toBe('');
  });

  it('deve remover caracteres não numéricos', () => {
    expect(formatPhone('(16) 99999-8888')).toBe(
      '(16) 99999-8888',
    );
  });

  it('deve formatar um telefone fixo', () => {
    expect(formatPhone('1633334444')).toBe(
      '(16) 3333-4444',
    );
  });

  it('deve formatar um celular', () => {
    expect(formatPhone('16999998888')).toBe(
      '(16) 99999-8888',
    );
  });

  it('deve limitar o telefone a onze dígitos', () => {
    expect(formatPhone('16999998888123')).toBe(
      '(16) 99999-8888',
    );
  });

  it.each([
    ['1', '(1'],
    ['16', '(16'],
    ['169', '(16) 9'],
    ['169999', '(16) 9999'],
    ['1699999', '(16) 9999-9'],
    ['16999998', '(16) 9999-98'],
    ['1699999888', '(16) 9999-9888'],
    ['16999998888', '(16) 99999-8888'],
  ])('deve formatar %s como %s', (value, expected) => {
    expect(formatPhone(value)).toBe(expected);
  });
});