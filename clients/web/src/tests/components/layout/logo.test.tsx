import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Logo } from '@/components/layout/logo';

describe('Logo', () => {
  it('deve renderizar o link da página inicial', () => {
    render(<Logo />);

    expect(
      screen.getByRole('link', {
        name: 'Le Coast - Página inicial',
      }),
    ).toBeInTheDocument();
  });

  it('deve apontar para a página inicial', () => {
    render(<Logo />);

    expect(
      screen.getByRole('link', {
        name: 'Le Coast - Página inicial',
      }),
    ).toHaveAttribute('href', '/');
  });
});