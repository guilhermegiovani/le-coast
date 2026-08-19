import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useRouter } from 'next/navigation';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { HeaderActions } from '@/components/layout/header-actions';
import { useAuth } from '@/contexts/auth-context';

// Simula o router do Next para evitar
// navegações reais durante os testes.
vi.mock('next/navigation', async () => {
  const actual =
    await vi.importActual<typeof import('next/navigation')>(
      'next/navigation',
    );

  return {
    ...actual,
    useRouter: vi.fn(),
  };
});

// Simula o contexto de autenticação para controlar
// usuários logados e deslogados em cada cenário.
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

const useRouterMock = vi.mocked(useRouter);
const useAuthMock = vi.mocked(useAuth);

const replaceMock = vi.fn();
const logoutMock = vi.fn();

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

// Agrupa os testes das responsabilidades
// do componente HeaderActions.
describe('HeaderActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Define o comportamento padrão do router.
    useRouterMock.mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn(),
      replace: replaceMock,
    });

    // Por padrão, os testes começam com
    // um usuário não autenticado.
    useAuthMock.mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: logoutMock,
      user: null,
    });
  });

  // Garante que o componente utiliza
  // o nome acessível padrão.
  it('deve renderizar a navegação com o nome acessível padrão', () => {
    render(<HeaderActions />);

    expect(
      screen.getByRole('navigation', {
        name: 'Ações do cabeçalho',
      }),
    ).toBeInTheDocument();
  });

  // Garante que o componente aceita
  // um nome acessível personalizado.
  it('deve renderizar a navegação com um nome acessível personalizado', () => {
    render(
      <HeaderActions ariaLabel="Ações do menu mobile" />,
    );

    expect(
      screen.getByRole('navigation', {
        name: 'Ações do menu mobile',
      }),
    ).toBeInTheDocument();
  });

  // Garante que todas as ações públicas
  // direcionam para a página correta.
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

  // Garante que o componente informa quando
  // uma ação de navegação é selecionada.
  it('deve executar onNavigate ao clicar em um link', () => {
    const onNavigate = vi.fn();

    render(
      <HeaderActions onNavigate={onNavigate} />,
    );

    fireEvent.click(
      screen.getByRole('link', {
        name: 'Buscar',
      }),
    );

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  // Garante que usuários deslogados continuem
  // vendo a ação padrão de conta.
  it('deve exibir Conta quando o usuário estiver deslogado', () => {
    render(<HeaderActions />);

    expect(
      screen.getByRole('link', {
        name: 'Conta',
      }),
    ).toHaveAttribute(
      'href',
      '/account',
    );
  });

  // Garante que o cabeçalho reflita o estado global
  // quando existir um usuário autenticado.
  it('deve exibir o nome do usuário quando estiver autenticado', () => {
    useAuthMock.mockReturnValue({
      accessToken: 'access-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: logoutMock,
      user: {
        email: 'guilherme@example.com',
        id: 1,
        name: 'Guilherme Nobre',
        role: 'CUSTOMER',
      },
    });

    render(<HeaderActions />);

    expect(
      screen.getByRole('link', {
        name: 'Guilherme Nobre',
      }),
    ).toHaveAttribute(
      'href',
      '/account',
    );

    expect(
      screen.getByRole('button', {
        name: 'Sair',
      }),
    ).toBeInTheDocument();
  });

  // Garante que o logout seja solicitado
  // através do AuthContext.
  it('deve executar logout ao clicar em Sair', async () => {
    logoutMock.mockResolvedValue(undefined);

    useAuthMock.mockReturnValue({
      accessToken: 'access-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: logoutMock,
      user: {
        email: 'guilherme@example.com',
        id: 1,
        name: 'Guilherme Nobre',
        role: 'CUSTOMER',
      },
    });

    render(<HeaderActions />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Sair',
      }),
    );

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
    });
  });

  // Garante que um logout explícito leve
  // o usuário para a Home pública da loja.
  it('deve redirecionar para a Home ao fazer logout', async () => {
    logoutMock.mockResolvedValue(undefined);

    useAuthMock.mockReturnValue({
      accessToken: 'access-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: logoutMock,
      user: {
        email: 'guilherme@example.com',
        id: 1,
        name: 'Guilherme Nobre',
        role: 'CUSTOMER',
      },
    });

    render(<HeaderActions />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Sair',
      }),
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/');
    });
  });
});