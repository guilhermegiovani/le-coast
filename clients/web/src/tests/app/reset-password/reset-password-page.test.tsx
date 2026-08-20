import {
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import {
    useRouter,
    useSearchParams,
} from 'next/navigation';
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import ResetPasswordPage from '@/app/(auth)/reset-password/page';
import { resetPassword } from '@/services/auth-service';

// Simula o router e os parâmetros da URL
// para evitar navegação real durante os testes.
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
}));

// Simula somente a chamada ao auth-service.
// A lógica da página continua sendo executada de verdade.
vi.mock('@/services/auth-service', () => ({
    resetPassword: vi.fn(),
}));

const useRouterMock = vi.mocked(useRouter);
const useSearchParamsMock = vi.mocked(useSearchParams);
const resetPasswordMock = vi.mocked(resetPassword);

const replaceMock = vi.fn();

const SUCCESS_MESSAGE =
    'Senha redefinida com sucesso. Faça login novamente.';

describe('ResetPasswordPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Define o router utilizado pela página
        // sem executar navegações reais.
        useRouterMock.mockReturnValue({
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
            push: vi.fn(),
            refresh: vi.fn(),
            replace: replaceMock,
        });

        // Por padrão, os testes possuem
        // um token válido na URL.
        useSearchParamsMock.mockReturnValue(
            new URLSearchParams(
                'token=valid-reset-token',
            ) as never,
        );
    });

    // Garante que os principais elementos
    // da página estejam disponíveis.
    it('deve renderizar o formulário de redefinição', () => {
        render(<ResetPasswordPage />);

        expect(
            screen.getByRole('heading', {
                name: 'Redefinir senha',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Nova senha'),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText(
                'Confirmar nova senha',
            ),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Redefinir senha',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('link', {
                name: 'Login',
            }),
        ).toHaveAttribute('href', '/login');
    });

    // Garante que a página não permita redefinição
    // quando o token não estiver presente na URL.
    it('deve rejeitar quando o token não for informado', async () => {
        const user = userEvent.setup();

        useSearchParamsMock.mockReturnValue(
            new URLSearchParams() as never,
        );

        render(<ResetPasswordPage />);

        await user.type(
            screen.getByLabelText('Nova senha'),
            'novaSenha123',
        );

        await user.type(
            screen.getByLabelText(
                'Confirmar nova senha',
            ),
            'novaSenha123',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Redefinir senha',
            }),
        );

        expect(
            screen.getByRole('alert'),
        ).toHaveTextContent(
            'Token de recuperação não informado.',
        );

        expect(
            resetPasswordMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que senhas diferentes sejam rejeitadas
    // antes de qualquer chamada ao backend.
    it('deve rejeitar quando as senhas não coincidirem', async () => {
        const user = userEvent.setup();

        render(<ResetPasswordPage />);

        await user.type(
            screen.getByLabelText('Nova senha'),
            'novaSenha123',
        );

        await user.type(
            screen.getByLabelText(
                'Confirmar nova senha',
            ),
            'outraSenha123',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Redefinir senha',
            }),
        );

        expect(
            screen.getByRole('alert'),
        ).toHaveTextContent(
            'As senhas não coincidem.',
        );

        expect(
            resetPasswordMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que senhas abaixo da política mínima
    // sejam rejeitadas localmente.
    it('deve rejeitar senha com menos de 8 caracteres', async () => {
        const user = userEvent.setup();

        render(<ResetPasswordPage />);

        await user.type(
            screen.getByLabelText('Nova senha'),
            '1234567',
        );

        await user.type(
            screen.getByLabelText(
                'Confirmar nova senha',
            ),
            '1234567',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Redefinir senha',
            }),
        );

        expect(
            screen.getByRole('alert'),
        ).toHaveTextContent(
            'A senha deve conter pelo menos 8 caracteres.',
        );

        expect(
            resetPasswordMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que token e nova senha sejam enviados
    // corretamente para o auth-service.
    it('deve enviar token e nova senha para redefinição', async () => {
        const user = userEvent.setup();

        resetPasswordMock.mockResolvedValue({
            message: SUCCESS_MESSAGE,
        });

        render(<ResetPasswordPage />);

        await user.type(
            screen.getByLabelText('Nova senha'),
            'novaSenha123',
        );

        await user.type(
            screen.getByLabelText(
                'Confirmar nova senha',
            ),
            'novaSenha123',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Redefinir senha',
            }),
        );

        expect(
            resetPasswordMock,
        ).toHaveBeenCalledWith({
            password: 'novaSenha123',
            token: 'valid-reset-token',
        });
    });

    // Garante que a mensagem de sucesso
    // seja apresentada ao usuário.
    it('deve exibir mensagem de sucesso após redefinir a senha', async () => {
        const user = userEvent.setup();

        resetPasswordMock.mockResolvedValue({
            message: SUCCESS_MESSAGE,
        });

        render(<ResetPasswordPage />);

        await user.type(
            screen.getByLabelText('Nova senha'),
            'novaSenha123',
        );

        await user.type(
            screen.getByLabelText(
                'Confirmar nova senha',
            ),
            'novaSenha123',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Redefinir senha',
            }),
        );

        expect(
            await screen.findByRole('status'),
        ).toHaveTextContent(SUCCESS_MESSAGE);
    });

    // Garante que erros conhecidos, como token
    // inválido ou expirado, sejam exibidos.
    it('deve exibir erro retornado pela API', async () => {
        const user = userEvent.setup();

        resetPasswordMock.mockRejectedValue({
            isAxiosError: true,
            response: {
                data: {
                    message:
                        'Token de recuperação inválido.',
                },
            },
        });

        vi.spyOn(
            axios,
            'isAxiosError',
        ).mockReturnValue(true);

        render(<ResetPasswordPage />);

        await user.type(
            screen.getByLabelText('Nova senha'),
            'novaSenha123',
        );

        await user.type(
            screen.getByLabelText(
                'Confirmar nova senha',
            ),
            'novaSenha123',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Redefinir senha',
            }),
        );

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent(
            'Token de recuperação inválido.',
        );
    });

    // Garante que falhas inesperadas recebam
    // uma mensagem genérica.
    it('deve exibir mensagem genérica em erro inesperado', async () => {
        const user = userEvent.setup();

        resetPasswordMock.mockRejectedValue(
            new Error('Falha inesperada'),
        );

        vi.spyOn(
            axios,
            'isAxiosError',
        ).mockReturnValue(false);

        render(<ResetPasswordPage />);

        await user.type(
            screen.getByLabelText('Nova senha'),
            'novaSenha123',
        );

        await user.type(
            screen.getByLabelText(
                'Confirmar nova senha',
            ),
            'novaSenha123',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Redefinir senha',
            }),
        );

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent(
            'Não foi possível redefinir sua senha. Tente novamente.',
        );
    });

    // Garante que o botão informe visualmente
    // enquanto a redefinição está em andamento.
    it('deve mostrar estado de carregamento durante a redefinição', async () => {
        const user = userEvent.setup();

        let resolveRequest:
            | (() => void)
            | undefined;

        resetPasswordMock.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = () => {
                        resolve({
                            message: SUCCESS_MESSAGE,
                        });
                    };
                }),
        );

        render(<ResetPasswordPage />);

        await user.type(
            screen.getByLabelText('Nova senha'),
            'novaSenha123',
        );

        await user.type(
            screen.getByLabelText(
                'Confirmar nova senha',
            ),
            'novaSenha123',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Redefinir senha',
            }),
        );

        expect(
            screen.getByRole('button', {
                name: 'Redefinindo...',
            }),
        ).toBeDisabled();

        resolveRequest?.();

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: 'Redefinir senha',
                }),
            ).not.toBeDisabled();
        });
    });
});