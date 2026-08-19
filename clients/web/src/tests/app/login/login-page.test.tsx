import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import LoginPage from '@/app/(auth)/login/page';
import { useAuth } from '@/contexts/auth-context';

// Simula o router do Next para impedir
// navegações reais durante os testes.
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Simula o contexto de autenticação.
// Assim conseguimos controlar sessão, loading
// e resultado do login em cada cenário.
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

const useRouterMock = vi.mocked(useRouter);
const useAuthMock = vi.mocked(useAuth);

const pushMock = vi.fn();
const replaceMock = vi.fn();
const loginMock = vi.fn();

// Define um estado padrão de usuário deslogado.
// Cada teste pode sobrescrever somente o que precisar.
function mockUnauthenticatedUser() {
  useAuthMock.mockReturnValue({
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    login: loginMock,
    logout: vi.fn(),
    user: null,
  });
}

// Agrupa os testes relacionados à página de Login.
describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Define o comportamento padrão do router.
    useRouterMock.mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      push: pushMock,
      refresh: vi.fn(),
      replace: replaceMock,
    });

    mockUnauthenticatedUser();
  });

  // Garante que os principais campos e ações
  // estejam disponíveis para o usuário.
  it('deve renderizar o formulário de login', () => {
    render(<LoginPage />);

    expect(
      screen.getByRole('heading', {
        name: 'Entrar',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('E-mail'),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('Senha'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Entrar',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'Esqueci minha senha',
      }),
    ).toHaveAttribute(
      'href',
      '/forgot-password',
    );

    expect(
      screen.getByRole('link', {
        name: 'Criar conta',
      }),
    ).toHaveAttribute(
      'href',
      '/register',
    );
  });

  // Garante que as credenciais digitadas
  // sejam enviadas corretamente para o AuthContext.
  it('deve enviar e-mail e senha ao realizar login', async () => {
    const user = userEvent.setup();

    loginMock.mockResolvedValue(undefined);

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText('E-mail'),
      'guilherme@example.com',
    );

    await user.type(
      screen.getByLabelText('Senha'),
      '12345678',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Entrar',
      }),
    );

    expect(loginMock).toHaveBeenCalledWith({
      email: 'guilherme@example.com',
      password: '12345678',
    });
  });

  // Garante que um login bem-sucedido
  // redirecione o usuário para a Home.
  it('deve redirecionar para a Home após login bem-sucedido', async () => {
    const user = userEvent.setup();

    loginMock.mockResolvedValue(undefined);

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText('E-mail'),
      'guilherme@example.com',
    );

    await user.type(
      screen.getByLabelText('Senha'),
      '12345678',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Entrar',
      }),
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  // Garante que erros conhecidos da API
  // sejam apresentados diretamente ao usuário.
  it('deve exibir mensagem de erro retornada pela API', async () => {
    const user = userEvent.setup();

    const apiError = {
      isAxiosError: true,
      response: {
        data: {
          message: 'E-mail ou senha inválidos.',
        },
      },
    };

    loginMock.mockRejectedValue(apiError);

    // Faz o type guard do Axios reconhecer
    // o erro controlado criado para este teste.
    vi.spyOn(
      axios,
      'isAxiosError',
    ).mockReturnValue(true);

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText('E-mail'),
      'guilherme@example.com',
    );

    await user.type(
      screen.getByLabelText('Senha'),
      'senha-errada',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Entrar',
      }),
    );

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(
      'E-mail ou senha inválidos.',
    );

    expect(pushMock).not.toHaveBeenCalled();
  });

  // Garante que falhas inesperadas recebam
  // uma mensagem genérica em vez de detalhes técnicos.
  it('deve exibir mensagem genérica quando ocorrer erro inesperado', async () => {
    const user = userEvent.setup();

    loginMock.mockRejectedValue(
      new Error('Falha inesperada'),
    );

    vi.spyOn(
      axios,
      'isAxiosError',
    ).mockReturnValue(false);

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText('E-mail'),
      'guilherme@example.com',
    );

    await user.type(
      screen.getByLabelText('Senha'),
      '12345678',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Entrar',
      }),
    );

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(
      'Não foi possível entrar. Tente novamente.',
    );
  });

  // Garante que o botão informe visualmente
  // que o login ainda está sendo processado.
  it('deve mostrar estado de carregamento durante o login', async () => {
    const user = userEvent.setup();

    let resolveLogin:
      | (() => void)
      | undefined;

    loginMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLogin = resolve;
        }),
    );

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText('E-mail'),
      'guilherme@example.com',
    );

    await user.type(
      screen.getByLabelText('Senha'),
      '12345678',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Entrar',
      }),
    );

    const loadingButton =
      screen.getByRole('button', {
        name: 'Entrando...',
      });

    expect(loadingButton).toBeDisabled();

    // Finaliza manualmente a Promise para evitar
    // deixar o teste com uma operação pendente.
    resolveLogin?.();

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'Entrar',
        }),
      ).not.toBeDisabled();
    });
  });

  // Garante que usuários já autenticados
  // não permaneçam na tela de login.
  it('deve redirecionar usuário autenticado para a Home', async () => {
    useAuthMock.mockReturnValue({
      accessToken: 'access-token',
      isAuthenticated: true,
      isLoading: false,
      login: loginMock,
      logout: vi.fn(),
      user: {
        email: 'guilherme@example.com',
        id: 1,
        name: 'Guilherme Nobre',
        role: 'CUSTOMER',
      },
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/');
    });
  });

  // Garante que o redirecionamento não aconteça
  // enquanto a sessão ainda está sendo restaurada.
  it('não deve redirecionar enquanto a autenticação estiver carregando', () => {
    useAuthMock.mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      login: loginMock,
      logout: vi.fn(),
      user: null,
    });

    render(<LoginPage />);

    expect(replaceMock).not.toHaveBeenCalled();
  });
});