import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HeaderActions } from '@/components/layout/header-actions';

describe('HeaderActions', () => {
  it('deve renderizar a navegação de ações do cabeçalho', () => {
    render(<HeaderActions />);

    expect(
      screen.getByRole('navigation', {
        name: 'Ações do cabeçalho',
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar os links com os destinos corretos', () => {
    render(<HeaderActions />);

    const links = [
      ['Buscar', '/search'],
      ['Conta', '/account'],
      ['Carrinho', '/cart'],
    ] as const;

    links.forEach(([name, href]) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'href',
        href,
      );
    });
  });
});