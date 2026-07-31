import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HeaderActions } from '@/components/layout/header-actions';

// Representa as ações disponíveis no cabeçalho.
const HEADER_ACTIONS = [
  {
    href: '/search',
    label: 'Buscar',
  },
  {
    href: '/account',
    label: 'Conta',
  },
  {
    href: '/cart',
    label: 'Carrinho',
  },
];

// Agrupa os testes das responsabilidades do componente HeaderActions.
describe('HeaderActions', () => {
  // Garante que o componente utiliza o nome acessível padrão.
  it('deve renderizar a navegação com o nome acessível padrão', () => {
    render(<HeaderActions />);

    expect(
      screen.getByRole('navigation', {
        name: 'Ações do cabeçalho',
      }),
    ).toBeInTheDocument();
  });

  // Garante que o componente aceita um nome acessível personalizado.
  it('deve renderizar a navegação com um nome acessível personalizado', () => {
    render(<HeaderActions ariaLabel="Ações do menu mobile" />);

    expect(
      screen.getByRole('navigation', {
        name: 'Ações do menu mobile',
      }),
    ).toBeInTheDocument();
  });

  // Garante que todas as ações direcionam para a página correta.
  it.each(HEADER_ACTIONS)(
    'deve renderizar o link "$label" com o destino correto',
    ({ href, label }) => {
      render(<HeaderActions />);

      expect(
        screen.getByRole('link', {
          name: label,
        }),
      ).toHaveAttribute('href', href);
    },
  );

  // Garante que o componente informa quando uma ação é selecionada.
  it('deve executar onNavigate ao clicar em um link', () => {
    const onNavigate = vi.fn();

    render(<HeaderActions onNavigate={onNavigate} />);

    fireEvent.click(
      screen.getByRole('link', {
        name: 'Buscar',
      }),
    );

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});