import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Navigation } from '@/components/layout/navigation';

const mockedUsePathname = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockedUsePathname(),
}));

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
    mockedUsePathname.mockReturnValue('/');

    render(<Navigation />);

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal',
      }),
    ).toBeInTheDocument();
  });

  // Garante que o componente aceita um nome acessível diferente para outros contextos.
  it('deve renderizar a navegação com um nome acessível personalizado', () => {
    mockedUsePathname.mockReturnValue('/');

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
      mockedUsePathname.mockReturnValue('/');

      render(<Navigation />);

      expect(
        screen.getByRole('link', {
          name: label,
        }),
      ).toHaveAttribute('href', href);
    },
  );

  // Garante que o link da página atual recebe aria-current.
  it('deve marcar Produtos como página atual na rota /products', () => {
    mockedUsePathname.mockReturnValue('/products');

    render(<Navigation />);

    expect(
      screen.getByRole('link', {
        name: 'Produtos',
      }),
    ).toHaveAttribute('aria-current', 'page');

    expect(
      screen.getByRole('link', {
        name: 'Início',
      }),
    ).not.toHaveAttribute('aria-current');
  });

  // Garante que uma página filha também mantém o item Produtos ativo.
  it('deve manter Produtos ativo em uma rota filha', () => {
    mockedUsePathname.mockReturnValue('/products/top-essential');

    render(<Navigation />);

    expect(
      screen.getByRole('link', {
        name: 'Produtos',
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  // Garante que o componente comunica quando o usuário seleciona um destino.
  it('deve executar onNavigate ao clicar em um link', () => {
    mockedUsePathname.mockReturnValue('/');

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