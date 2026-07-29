import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Navigation } from '@/components/layout/navigation';

describe('Navigation', () => {
  it('deve renderizar a navegação principal', () => {
    render(<Navigation />);

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal',
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar os links com os destinos corretos', () => {
    render(<Navigation />);

    const links = [
      ['Início', '/'],
      ['Produtos', '/products'],
      ['Sobre', '/about'],
      ['Contato', '/contact'],
    ] as const;

    links.forEach(([name, href]) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'href',
        href,
      );
    });
  });
});