import {
    act,
    renderHook,
    waitFor,
} from '@testing-library/react';

import type { ReactNode } from 'react';
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {
    AuthProvider,
    useAuth,
} from '@/contexts/auth-context';

import {
    login as loginApi,
    logout as logoutApi,
    refreshSession,
} from '@/services/auth-service';

import { setApiAccessToken } from '@/lib/api';

// Simula as chamadas HTTP de autenticação.
// Assim, os testes do Context não dependem
// do backend real nem de cookies reais.
vi.mock('@/services/auth-service', () => ({
    login: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
}));

// Simula a configuração do header Authorization
// sem alterar a instância Axios real durante os testes.
vi.mock('@/lib/api', () => ({
    setApiAccessToken: vi.fn(),
}));

const loginApiMock = vi.mocked(loginApi);
const logoutApiMock = vi.mocked(logoutApi);
const refreshSessionMock = vi.mocked(
    refreshSession,
);
const setApiAccessTokenMock = vi.mocked(
    setApiAccessToken,
);

const AUTH_USER = {
    email: 'guilherme@example.com',
    id: 1,
    name: 'Guilherme Nobre',
    role: 'CUSTOMER' as const,
};

// Envolve o hook com o AuthProvider,
// reproduzindo o ambiente real da aplicação.
function wrapper({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
}

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Por padrão, considera que não existe
        // uma sessão anterior para restaurar.
        refreshSessionMock.mockRejectedValue(
            new Error('Sessão inexistente'),
        );
    });

    // Garante que o Provider tente restaurar
    // uma sessão assim que for carregado.
    it('deve tentar restaurar a sessão ao iniciar', async () => {
        renderHook(() => useAuth(), {
            wrapper,
        });

        await waitFor(() => {
            expect(
                refreshSessionMock,
            ).toHaveBeenCalledTimes(1);
        });
    });

    // Garante que uma sessão válida seja reconstruída
    // utilizando o refresh token do cookie HttpOnly.
    it('deve restaurar uma sessão válida', async () => {
        refreshSessionMock.mockResolvedValue({
            accessToken: 'restored-access-token',
            user: AUTH_USER,
        });

        const { result } = renderHook(
            () => useAuth(),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.user).toEqual(AUTH_USER);

        expect(result.current.accessToken).toBe(
            'restored-access-token',
        );

        expect(
            result.current.isAuthenticated,
        ).toBe(true);

        // O access token restaurado também precisa
        // ser configurado nas próximas requisições da API.
        expect(
            setApiAccessTokenMock,
        ).toHaveBeenCalledWith(
            'restored-access-token',
        );
    });

    // Garante que ausência de sessão válida
    // resulte em usuário deslogado.
    it('deve permanecer deslogado quando não houver sessão válida', async () => {
        const { result } = renderHook(
            () => useAuth(),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.accessToken).toBeNull();

        expect(
            result.current.isAuthenticated,
        ).toBe(false);

        // Sem sessão válida, nenhum access token
        // deve permanecer configurado na API.
        expect(
            setApiAccessTokenMock,
        ).toHaveBeenCalledWith(null);
    });

    // Garante que o login atualize o estado global
    // com os dados retornados pela API.
    it('deve autenticar e armazenar a sessão em memória', async () => {
        loginApiMock.mockResolvedValue({
            accessToken: 'access-token',
            user: AUTH_USER,
        });

        const { result } = renderHook(
            () => useAuth(),
            {
                wrapper,
            },
        );

        // Espera a restauração inicial da sessão terminar
        // antes de testar uma nova tentativa de login.
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await act(async () => {
            await result.current.login({
                email: 'guilherme@example.com',
                password: '12345678',
            });
        });

        expect(loginApiMock).toHaveBeenCalledWith({
            email: 'guilherme@example.com',
            password: '12345678',
        });

        expect(result.current.user).toEqual(AUTH_USER);

        expect(result.current.accessToken).toBe(
            'access-token',
        );

        expect(
            result.current.isAuthenticated,
        ).toBe(true);

        // O token recebido no login precisa ser
        // utilizado pelas próximas chamadas autenticadas.
        expect(
            setApiAccessTokenMock,
        ).toHaveBeenCalledWith(
            'access-token',
        );
    });

    // Garante que o logout encerre a sessão
    // no backend e limpe o estado local.
    it('deve limpar a sessão ao fazer logout', async () => {
        refreshSessionMock.mockResolvedValue({
            accessToken: 'access-token',
            user: AUTH_USER,
        });

        logoutApiMock.mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useAuth(),
            {
                wrapper,
            },
        );

        await waitFor(() => {
            expect(
                result.current.isAuthenticated,
            ).toBe(true);
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(logoutApiMock).toHaveBeenCalledTimes(1);

        expect(result.current.user).toBeNull();
        expect(result.current.accessToken).toBeNull();

        expect(
            result.current.isAuthenticated,
        ).toBe(false);

        // O logout também deve remover o access token
        // utilizado pela instância compartilhada da API.
        expect(
            setApiAccessTokenMock,
        ).toHaveBeenCalledWith(null);
    });

    // Garante que o frontend seja limpo mesmo
    // quando a chamada de logout ao backend falhar.
    it('deve limpar a sessão local mesmo se o logout falhar', async () => {
        refreshSessionMock.mockResolvedValue({
            accessToken: 'access-token',
            user: AUTH_USER,
        });

        logoutApiMock.mockRejectedValue(
            new Error('Backend indisponível'),
        );

        const { result } = renderHook(
            () => useAuth(),
            {
                wrapper,
            },
        );

        // Espera a restauração inicial terminar para
        // garantir que exista uma sessão antes do logout.
        await waitFor(() => {
            expect(
                result.current.isAuthenticated,
            ).toBe(true);
        });

        let logoutError: unknown;

        // Captura o erro dentro do act para permitir
        // que o React processe também as atualizações
        // realizadas no finally do logout.
        await act(async () => {
            try {
                await result.current.logout();
            } catch (error) {
                logoutError = error;
            }
        });

        // O erro da API continua sendo propagado
        // para quem chamou logout().
        expect(logoutError).toBeInstanceOf(Error);

        if (logoutError instanceof Error) {
            expect(logoutError.message).toBe(
                'Backend indisponível',
            );
        }

        // Mesmo com falha na requisição, o finally
        // precisa limpar a sessão mantida em memória.
        expect(result.current.user).toBeNull();
        expect(result.current.accessToken).toBeNull();

        expect(
            result.current.isAuthenticated,
        ).toBe(false);

        // A falha no backend não pode deixar um token
        // antigo configurado nas próximas requisições.
        expect(
            setApiAccessTokenMock,
        ).toHaveBeenCalledWith(null);
    });
});