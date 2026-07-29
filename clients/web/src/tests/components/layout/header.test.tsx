import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Header } from '@/components/layout/header';

describe('Header', () => {
  it('deve renderizar o elemento semântico banner', () => {
    render(<Header />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('deve renderizar o logo', () => {
    render(<Header />);

    expect(
      screen.getByRole('link', {
        name: 'Le Coast - Página inicial',
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar a navegação principal', () => {
    render(<Header />);

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal',
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar a navegação de ações do cabeçalho', () => {
    render(<Header />);

    expect(
      screen.getByRole('navigation', {
        name: 'Ações do cabeçalho',
      }),
    ).toBeInTheDocument();
  });
});