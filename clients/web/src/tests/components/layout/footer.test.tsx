import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from '@/components/layout/footer';

describe('Footer', () => {
  it('deve renderizar o elemento contentinfo', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('deve renderizar a marca e a descrição', () => {
    render(<Footer />);

    expect(screen.getByText('Le Coast')).toBeInTheDocument();
    expect(
      screen.getByText('Moda fitness e beachwear para todos os momentos.'),
    ).toBeInTheDocument();
  });

  it('deve renderizar a navegação do rodapé', () => {
    render(<Footer />);

    expect(
      screen.getByRole('navigation', {
        name: 'Links do rodapé',
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar os links com os destinos corretos', () => {
    render(<Footer />);

    const links = [
      ['Produtos', '/products'],
      ['Sobre', '/about'],
      ['Contato', '/contact'],
      ['Política de Privacidade', '/privacy'],
    ] as const;

    links.forEach(([name, href]) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'href',
        href,
      );
    });
  });

  it('deve renderizar o copyright', () => {
    render(<Footer />);

    expect(
      screen.getByText('© 2026 Le Coast. Todos os direitos reservados.'),
    ).toBeInTheDocument();
  });
});