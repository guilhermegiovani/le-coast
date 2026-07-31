import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Navigation } from '@/components/layout/navigation';

// Representa os links que devem existir em qualquer versão da navegação.
const NAVIGATION_LINKS = [
  {
    href: '/',
    label: 'Início',
  },
  {
    href: '/products',
    label: 'Produtos',
  },
  {
    href: '/about',
    label: 'Sobre',
  },
  {
    href: '/contact',
    label: 'Contato',
  },
];

// Agrupa os testes das responsabilidades do componente Navigation.
describe('Navigation', () => {
  // Garante que a navegação usa o nome acessível padrão quando nenhum nome é informado.
  it('deve renderizar a navegação com o nome acessível padrão', () => {
    render(<Navigation />);

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal',
      }),
    ).toBeInTheDocument();
  });

  // Garante que o componente aceita um nome acessível diferente para outros contextos.
  it('deve renderizar a navegação com um nome acessível personalizado', () => {
    render(<Navigation ariaLabel="Navegação mobile" />);

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação mobile',
      }),
    ).toBeInTheDocument();
  });

  // Garante que todos os links de navegação apontam para as páginas corretas.
  it.each(NAVIGATION_LINKS)(
    'deve renderizar o link "$label" com o destino correto',
    ({ href, label }) => {
      render(<Navigation />);

      expect(
        screen.getByRole('link', {
          name: label,
        }),
      ).toHaveAttribute('href', href);
    },
  );

  // Garante que o componente comunica quando o usuário seleciona um destino.
  it('deve executar onNavigate ao clicar em um link', () => {
    const onNavigate = vi.fn();

    render(<Navigation onNavigate={onNavigate} />);

    fireEvent.click(
      screen.getByRole('link', {
        name: 'Produtos',
      }),
    );

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});