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

import RegisterPage from '@/app/(auth)/register/page';
import { register } from '@/services/auth-service';
import { useAuth } from '@/contexts/auth-context';

// Simula o router do Next para evitar
// navegações reais durante os testes.
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

// Simula somente a chamada HTTP de cadastro.
// As validações locais da página continuam sendo reais.
vi.mock('@/services/auth-service', () => ({
    register: vi.fn(),
}));

// Simula o contexto de autenticação para permitir
// controlar o estado da sessão em cada teste.
vi.mock('@/contexts/auth-context', () => ({
    useAuth: vi.fn(),
}));

const useRouterMock = vi.mocked(useRouter);
const registerMock = vi.mocked(register);
const useAuthMock = vi.mocked(useAuth);

const pushMock = vi.fn();

describe('RegisterPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Define o comportamento padrão do router.
        useRouterMock.mockReturnValue({
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
            push: pushMock,
            refresh: vi.fn(),
            replace: vi.fn(),
        });

        // Define o estado padrão dos testes como
        // usuário deslogado e sessão já verificada.
        useAuthMock.mockReturnValue({
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            user: null,
        });
    });

    // Garante que os campos principais do cadastro
    // estejam disponíveis para o usuário.
    it('deve renderizar o formulário de cadastro', () => {
        render(<RegisterPage />);

        expect(
            screen.getByRole('heading', {
                name: 'Criar conta',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Nome completo'),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('E-mail'),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Senha'),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Confirmar senha'),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Criar conta',
            }),
        ).toBeInTheDocument();
    });

    // Garante que senhas diferentes sejam rejeitadas
    // antes de qualquer chamada ao backend.
    it('deve rejeitar quando as senhas não coincidirem', async () => {
        const user = userEvent.setup();

        render(<RegisterPage />);

        await user.type(
            screen.getByLabelText('Nome completo'),
            'Guilherme Nobre',
        );

        await user.type(
            screen.getByLabelText('E-mail'),
            'guilherme@example.com',
        );

        await user.type(
            screen.getByLabelText('Senha'),
            '12345678',
        );

        await user.type(
            screen.getByLabelText('Confirmar senha'),
            '87654321',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Criar conta',
            }),
        );

        expect(
            screen.getByRole('alert'),
        ).toHaveTextContent(
            'As senhas não coincidem.',
        );

        expect(registerMock).not.toHaveBeenCalled();
    });

    // Garante que senhas muito curtas sejam rejeitadas
    // localmente antes de chamar a API.
    it('deve rejeitar senha com menos de 8 caracteres', async () => {
        const user = userEvent.setup();

        render(<RegisterPage />);

        await user.type(
            screen.getByLabelText('Nome completo'),
            'Guilherme Nobre',
        );

        await user.type(
            screen.getByLabelText('E-mail'),
            'guilherme@example.com',
        );

        await user.type(
            screen.getByLabelText('Senha'),
            '1234567',
        );

        await user.type(
            screen.getByLabelText('Confirmar senha'),
            '1234567',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Criar conta',
            }),
        );

        expect(
            screen.getByRole('alert'),
        ).toHaveTextContent(
            'A senha deve conter pelo menos 8 caracteres.',
        );

        expect(registerMock).not.toHaveBeenCalled();
    });

    // Garante que dados válidos sejam enviados
    // corretamente para o auth-service.
    it('deve enviar os dados corretos ao cadastrar', async () => {
        const user = userEvent.setup();

        registerMock.mockResolvedValue({
            email: 'guilherme@example.com',
            id: 1,
            name: 'Guilherme Nobre',
            role: 'CUSTOMER',
        });

        render(<RegisterPage />);

        await user.type(
            screen.getByLabelText('Nome completo'),
            'Guilherme Nobre',
        );

        await user.type(
            screen.getByLabelText('E-mail'),
            'guilherme@example.com',
        );

        await user.type(
            screen.getByLabelText('Senha'),
            '12345678',
        );

        await user.type(
            screen.getByLabelText('Confirmar senha'),
            '12345678',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Criar conta',
            }),
        );

        expect(registerMock).toHaveBeenCalledWith({
            email: 'guilherme@example.com',
            name: 'Guilherme Nobre',
            password: '12345678',
        });
    });

    // Garante que um cadastro bem-sucedido
    // leve o usuário para a tela de login.
    it('deve redirecionar para login após cadastro bem-sucedido', async () => {
        const user = userEvent.setup();

        registerMock.mockResolvedValue({
            email: 'guilherme@example.com',
            id: 1,
            name: 'Guilherme Nobre',
            role: 'CUSTOMER',
        });

        render(<RegisterPage />);

        await user.type(
            screen.getByLabelText('Nome completo'),
            'Guilherme Nobre',
        );

        await user.type(
            screen.getByLabelText('E-mail'),
            'guilherme@example.com',
        );

        await user.type(
            screen.getByLabelText('Senha'),
            '12345678',
        );

        await user.type(
            screen.getByLabelText('Confirmar senha'),
            '12345678',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Criar conta',
            }),
        );

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/login');
        });
    });

    // Garante que mensagens conhecidas da API,
    // como e-mail já cadastrado, sejam exibidas.
    it('deve exibir erro retornado pela API', async () => {
        const user = userEvent.setup();

        registerMock.mockRejectedValue({
            isAxiosError: true,
            response: {
                data: {
                    message: 'E-mail já cadastrado.',
                },
            },
        });

        vi.spyOn(
            axios,
            'isAxiosError',
        ).mockReturnValue(true);

        render(<RegisterPage />);

        await user.type(
            screen.getByLabelText('Nome completo'),
            'Guilherme Nobre',
        );

        await user.type(
            screen.getByLabelText('E-mail'),
            'guilherme@example.com',
        );

        await user.type(
            screen.getByLabelText('Senha'),
            '12345678',
        );

        await user.type(
            screen.getByLabelText('Confirmar senha'),
            '12345678',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Criar conta',
            }),
        );

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent(
            'E-mail já cadastrado.',
        );

        expect(pushMock).not.toHaveBeenCalled();
    });

    // Garante que falhas inesperadas recebam
    // uma mensagem genérica.
    it('deve exibir mensagem genérica em erro inesperado', async () => {
        const user = userEvent.setup();

        registerMock.mockRejectedValue(
            new Error('Falha inesperada'),
        );

        vi.spyOn(
            axios,
            'isAxiosError',
        ).mockReturnValue(false);

        render(<RegisterPage />);

        await user.type(
            screen.getByLabelText('Nome completo'),
            'Guilherme Nobre',
        );

        await user.type(
            screen.getByLabelText('E-mail'),
            'guilherme@example.com',
        );

        await user.type(
            screen.getByLabelText('Senha'),
            '12345678',
        );

        await user.type(
            screen.getByLabelText('Confirmar senha'),
            '12345678',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Criar conta',
            }),
        );

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent(
            'Não foi possível criar sua conta. Tente novamente.',
        );
    });

    // Garante que o botão indique quando
    // o cadastro ainda está sendo processado.
    it('deve mostrar estado de carregamento durante o cadastro', async () => {
        const user = userEvent.setup();

        let resolveRegister:
            | (() => void)
            | undefined;

        registerMock.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRegister = () =>
                        resolve({
                            email: 'guilherme@example.com',
                            id: 1,
                            name: 'Guilherme Nobre',
                            role: 'CUSTOMER',
                        });
                }),
        );

        render(<RegisterPage />);

        await user.type(
            screen.getByLabelText('Nome completo'),
            'Guilherme Nobre',
        );

        await user.type(
            screen.getByLabelText('E-mail'),
            'guilherme@example.com',
        );

        await user.type(
            screen.getByLabelText('Senha'),
            '12345678',
        );

        await user.type(
            screen.getByLabelText('Confirmar senha'),
            '12345678',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Criar conta',
            }),
        );

        const loadingButton =
            screen.getByRole('button', {
                name: 'Criando conta...',
            });

        expect(loadingButton).toBeDisabled();

        resolveRegister?.();

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/login');
        });
    });

    // Garante que usuários já autenticados
    // não permaneçam na tela de cadastro.
    it('deve redirecionar usuário autenticado para a Home', async () => {
        const replaceMock = vi.fn();

        useRouterMock.mockReturnValue({
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
            push: pushMock,
            refresh: vi.fn(),
            replace: replaceMock,
        });

        useAuthMock.mockReturnValue({
            accessToken: 'access-token',
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            user: {
                email: 'guilherme@example.com',
                id: 1,
                name: 'Guilherme Nobre',
                role: 'CUSTOMER',
            },
        });

        render(<RegisterPage />);

        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith('/');
        });
    });

    // Garante que nenhum redirecionamento aconteça
    // enquanto a sessão ainda estiver sendo restaurada.
    it('não deve redirecionar enquanto a autenticação estiver carregando', () => {
        const replaceMock = vi.fn();

        useRouterMock.mockReturnValue({
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
            push: pushMock,
            refresh: vi.fn(),
            replace: replaceMock,
        });

        useAuthMock.mockReturnValue({
            accessToken: null,
            isAuthenticated: false,
            isLoading: true,
            login: vi.fn(),
            logout: vi.fn(),
            user: null,
        });

        render(<RegisterPage />);

        expect(replaceMock).not.toHaveBeenCalled();
    });
});