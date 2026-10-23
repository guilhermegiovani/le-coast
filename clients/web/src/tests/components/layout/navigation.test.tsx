import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/contexts/auth-context';
import { Navigation } from '@/components/layout/navigation';

const mockedUsePathname = vi.fn();
const mockedUseAuth = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockedUsePathname(),
}));

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockedUseAuth(),
}));

// Representa os links públicos que devem existir na navegação.
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

// Define o estado padrão de autenticação para cada teste.
beforeEach(() => {
  mockedUsePathname.mockReturnValue('/');
  mockedUseAuth.mockReturnValue({
    user: null,
    isLoading: false,
  } as ReturnType<typeof useAuth>);
});

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

  // Garante que todos os links públicos apontam para as páginas corretas.
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

  // Garante que o link administrativo aparece para usuários ADMIN.
  it('deve exibir o link do painel administrativo para ADMIN', () => {
    mockedUseAuth.mockReturnValue({
      user: { role: 'ADMIN' },
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    render(<Navigation />);

    expect(
      screen.getByRole('link', {
        name: 'Painel administrativo',
      }),
    ).toHaveAttribute('href', '/admin');
  });

  // Garante que clientes não visualizam o link administrativo.
  it('não deve exibir o link do painel administrativo para CUSTOMER', () => {
    mockedUseAuth.mockReturnValue({
      user: { role: 'CUSTOMER' },
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    render(<Navigation />);

    expect(
      screen.queryByRole('link', {
        name: 'Painel administrativo',
      }),
    ).not.toBeInTheDocument();
  });

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
