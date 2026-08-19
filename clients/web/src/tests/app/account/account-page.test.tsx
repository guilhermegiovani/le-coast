import {
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

import AccountPage from '@/app/account/page';
import { useAuth } from '@/contexts/auth-context';

// Simula o router do Next para impedir
// redirecionamentos reais durante os testes.
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Simula o contexto de autenticação para controlar
// os diferentes estados da sessão.
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

const useRouterMock = vi.mocked(useRouter);
const useAuthMock = vi.mocked(useAuth);

const replaceMock = vi.fn();

const AUTH_USER = {
  email: 'guilherme@example.com',
  id: 1,
  name: 'Guilherme Nobre',
  role: 'CUSTOMER' as const,
};

describe('AccountPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useRouterMock.mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn(),
      replace: replaceMock,
    });
  });

  // Garante que o conteúdo privado seja exibido
  // quando a sessão já estiver autenticada.
  it('deve exibir a conta para usuário autenticado', () => {
    useAuthMock.mockReturnValue({
      accessToken: 'access-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      user: AUTH_USER,
    });

    render(<AccountPage />);

    expect(
      screen.getByRole('heading', {
        name: 'Minha conta',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Olá, Guilherme Nobre.'),
    ).toBeInTheDocument();

    expect(replaceMock).not.toHaveBeenCalled();
  });

  // Garante que a página aguarde a restauração
  // da sessão antes de tomar qualquer decisão.
  it('deve exibir carregamento enquanto a sessão estiver sendo restaurada', () => {
    useAuthMock.mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
      user: null,
    });

    render(<AccountPage />);

    expect(
      screen.getByText('Carregando sua conta...'),
    ).toBeInTheDocument();

    // Ainda não sabemos se o usuário está realmente
    // deslogado, então não devemos redirecionar.
    expect(replaceMock).not.toHaveBeenCalled();
  });

  // Garante que usuários sem sessão válida
  // sejam enviados para a tela de login.
  it('deve redirecionar usuário deslogado para login', async () => {
    useAuthMock.mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      user: null,
    });

    render(<AccountPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/login');
    });

    // Nenhum conteúdo privado deve aparecer enquanto
    // o redirecionamento está sendo realizado.
    expect(
      screen.queryByRole('heading', {
        name: 'Minha conta',
      }),
    ).not.toBeInTheDocument();
  });
});