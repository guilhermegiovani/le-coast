import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { Header } from '@/components/layout/header';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import { useAuth } from '@/contexts/auth-context';

// Simula as APIs de navegação utilizadas
// pelo Header e pelo HeaderActions.
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

// Simula o contexto de autenticação utilizado
// pelo HeaderActions renderizado dentro do Header.
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

const usePathnameMock = vi.mocked(usePathname);
const useRouterMock = vi.mocked(useRouter);
const useAuthMock = vi.mocked(useAuth);

const replaceMock = vi.fn();
const logoutMock = vi.fn();

// Representa os links que devem existir no menu mobile.
const MOBILE_NAVIGATION_LINKS = [
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

// Representa as ações disponíveis no menu mobile.
const MOBILE_ACTIONS = [
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

// Agrupa os testes das responsabilidades do componente Header.
describe('Header', () => {
  // Define a Home como rota atual antes de cada teste.
  beforeEach(() => {
    vi.clearAllMocks();

    // Define a Home como rota atual
    // antes de cada teste.
    usePathnameMock.mockReturnValue('/');

    // Fornece o router utilizado pelo HeaderActions
    // sem executar navegações reais.
    useRouterMock.mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn(),
      replace: replaceMock,
    });

    // Por padrão, os testes do Header utilizam
    // um usuário deslogado.
    useAuthMock.mockReturnValue({
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: logoutMock,
      user: null,
    });
  });

  // Garante que o Header utiliza o elemento semântico adequado.
  it('deve renderizar o elemento semântico banner', () => {
    render(<Header />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  // Garante que o usuário consegue voltar para a página inicial pelo logo.
  it('deve renderizar o logo', () => {
    render(<Header />);

    expect(
      screen.getByRole('link', {
        name: 'Le Coast - Página inicial',
      }),
    ).toBeInTheDocument();
  });

  // Garante que a navegação principal continua disponível.
  it('deve renderizar a navegação principal', () => {
    render(<Header />);

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal',
      }),
    ).toBeInTheDocument();
  });

  // Garante que as ações do cabeçalho continuam disponíveis.
  it('deve renderizar a navegação de ações do cabeçalho', () => {
    render(<Header />);

    expect(
      screen.getByRole('navigation', {
        name: 'Ações do cabeçalho',
      }),
    ).toBeInTheDocument();
  });

  // Garante que o menu mobile começa fechado.
  it('deve iniciar com o menu mobile fechado', () => {
    render(<Header />);

    const button = screen.getByRole('button', {
      name: 'Abrir menu',
    });

    expect(button).toHaveAttribute('aria-expanded', 'false');

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação mobile',
      }),
    ).not.toBeInTheDocument();
  });

  // Garante que o usuário consegue abrir o menu mobile.
  it('deve abrir o menu mobile', () => {
    render(<Header />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Abrir menu',
      }),
    );

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação mobile',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('navigation', {
        name: 'Ações do menu mobile',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Fechar menu',
      }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  // Garante que o usuário consegue fechar o menu novamente.
  it('deve fechar o menu mobile', () => {
    render(<Header />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Abrir menu',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Fechar menu',
      }),
    );

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação mobile',
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Abrir menu',
      }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  // Garante que todos os links principais aparecem no menu mobile.
  it.each(MOBILE_NAVIGATION_LINKS)(
    'deve renderizar "$label" no menu mobile',
    ({ href, label }) => {
      render(<Header />);

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Abrir menu',
        }),
      );

      const navigation = screen.getByRole('navigation', {
        name: 'Navegação mobile',
      });

      expect(
        within(navigation).getByRole('link', {
          name: label,
        }),
      ).toHaveAttribute('href', href);
    },
  );

  // Garante que todas as ações aparecem no menu mobile.
  it.each(MOBILE_ACTIONS)(
    'deve renderizar a ação "$label" no menu mobile',
    ({ href, label }) => {
      render(<Header />);

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Abrir menu',
        }),
      );

      const actions = screen.getByRole('navigation', {
        name: 'Ações do menu mobile',
      });

      expect(
        within(actions).getByRole('link', {
          name: label,
        }),
      ).toHaveAttribute('href', href);
    },
  );

  // Garante que o menu fecha ao selecionar uma página.
  it('deve fechar o menu ao clicar em um link da navegação', () => {
    render(<Header />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Abrir menu',
      }),
    );

    const navigation = screen.getByRole('navigation', {
      name: 'Navegação mobile',
    });

    fireEvent.click(
      within(navigation).getByRole('link', {
        name: 'Produtos',
      }),
    );

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação mobile',
      }),
    ).not.toBeInTheDocument();
  });

  // Garante que o menu também fecha ao selecionar uma ação.
  it('deve fechar o menu ao clicar em uma ação', () => {
    render(<Header />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Abrir menu',
      }),
    );

    const actions = screen.getByRole('navigation', {
      name: 'Ações do menu mobile',
    });

    fireEvent.click(
      within(actions).getByRole('link', {
        name: 'Buscar',
      }),
    );

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação mobile',
      }),
    ).not.toBeInTheDocument();
  });
});