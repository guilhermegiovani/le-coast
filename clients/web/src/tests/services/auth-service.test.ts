import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { api } from '@/lib/api';
import {
  forgotPassword,
  login,
  logout,
  refreshSession,
  register,
} from '@/services/auth-service';

// Simula a instância Axios utilizada pela aplicação.
// Assim, os testes não fazem requisições HTTP reais.
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const apiPostMock = vi.mocked(api.post);

// Agrupa os testes das chamadas HTTP
// relacionadas à autenticação.
describe('auth-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que o cadastro envie os dados
  // para o endpoint correto da API.
  it('deve cadastrar um usuário', async () => {
    const responseData = {
      email: 'guilherme@example.com',
      id: 1,
      name: 'Guilherme Nobre',
      role: 'CUSTOMER' as const,
    };

    apiPostMock.mockResolvedValue({
      data: responseData,
    });

    const input = {
      email: 'guilherme@example.com',
      name: 'Guilherme Nobre',
      password: '12345678',
    };

    const result = await register(input);

    expect(apiPostMock).toHaveBeenCalledWith(
      '/auth/register',
      input,
    );

    expect(result).toEqual(responseData);
  });

  // Garante que o login envie as credenciais
  // para o endpoint correto.
  it('deve autenticar um usuário', async () => {
    const responseData = {
      accessToken: 'access-token',
      user: {
        email: 'guilherme@example.com',
        id: 1,
        name: 'Guilherme Nobre',
        role: 'CUSTOMER' as const,
      },
    };

    apiPostMock.mockResolvedValue({
      data: responseData,
    });

    const input = {
      email: 'guilherme@example.com',
      password: '12345678',
    };

    const result = await login(input);

    expect(apiPostMock).toHaveBeenCalledWith(
      '/auth/login',
      input,
    );

    expect(result).toEqual(responseData);
  });

  // Garante que a renovação de sessão utilize
  // o endpoint correto sem enviar o refresh token manualmente.
  //
  // O cookie HttpOnly é enviado automaticamente
  // pelo navegador através do withCredentials.
  it('deve renovar a sessão', async () => {
    const responseData = {
      accessToken: 'new-access-token',
      user: {
        email: 'guilherme@example.com',
        id: 1,
        name: 'Guilherme Nobre',
        role: 'CUSTOMER' as const,
      },
    };

    apiPostMock.mockResolvedValue({
      data: responseData,
    });

    const result = await refreshSession();

    expect(apiPostMock).toHaveBeenCalledWith(
      '/auth/refresh',
    );

    expect(result).toEqual(responseData);
  });

  // Garante que o logout utilize o endpoint
  // responsável por revogar a sessão no backend.
  it('deve encerrar a sessão', async () => {
    apiPostMock.mockResolvedValue({
      data: undefined,
    });

    await logout();

    expect(apiPostMock).toHaveBeenCalledWith(
      '/auth/logout',
    );
  });

  // Garante que a recuperação de senha envie
  // o e-mail para o endpoint correto.
  it('deve solicitar recuperação de senha', async () => {
    const responseData = {
      message:
        'Se existir uma conta associada a este e-mail, enviaremos as instruções para redefinição da senha.',
    };

    apiPostMock.mockResolvedValue({
      data: responseData,
    });

    const input = {
      email: 'guilherme@example.com',
    };

    const result = await forgotPassword(input);

    expect(apiPostMock).toHaveBeenCalledWith(
      '/auth/forgot-password',
      input,
    );

    expect(result).toEqual(responseData);
  });
});