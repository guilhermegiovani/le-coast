import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';
import { forgotPassword } from '@/services/auth-service';

// Simula a chamada ao auth-service para que os testes
// da página não façam requisições HTTP reais.
vi.mock('@/services/auth-service', () => ({
  forgotPassword: vi.fn(),
}));

const forgotPasswordMock = vi.mocked(
  forgotPassword,
);

const SUCCESS_MESSAGE =
  'Se existir uma conta associada a este e-mail, enviaremos as instruções para redefinição da senha.';

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que os principais elementos
  // da página estejam disponíveis.
  it('deve renderizar o formulário de recuperação de senha', () => {
    render(<ForgotPasswordPage />);

    expect(
      screen.getByRole('heading', {
        name: 'Recuperar senha',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText('E-mail'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Enviar instruções',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'Voltar para login',
      }),
    ).toHaveAttribute('href', '/login');
  });

  // Garante que o e-mail informado seja
  // enviado corretamente para o auth-service.
  it('deve solicitar recuperação com o e-mail informado', async () => {
    const user = userEvent.setup();

    forgotPasswordMock.mockResolvedValue({
      message: SUCCESS_MESSAGE,
    });

    render(<ForgotPasswordPage />);

    await user.type(
      screen.getByLabelText('E-mail'),
      'guilherme@example.com',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Enviar instruções',
      }),
    );

    expect(
      forgotPasswordMock,
    ).toHaveBeenCalledWith({
      email: 'guilherme@example.com',
    });
  });

  // Garante que a resposta genérica do backend
  // seja apresentada após a solicitação.
  it('deve exibir a mensagem de sucesso retornada pela API', async () => {
    const user = userEvent.setup();

    forgotPasswordMock.mockResolvedValue({
      message: SUCCESS_MESSAGE,
    });

    render(<ForgotPasswordPage />);

    await user.type(
      screen.getByLabelText('E-mail'),
      'guilherme@example.com',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Enviar instruções',
      }),
    );

    expect(
      await screen.findByRole('status'),
    ).toHaveTextContent(SUCCESS_MESSAGE);
  });

  // Garante que erros conhecidos retornados
  // pela API sejam apresentados ao usuário.
  it('deve exibir mensagem de erro retornada pela API', async () => {
    const user = userEvent.setup();

    forgotPasswordMock.mockRejectedValue({
      isAxiosError: true,
      response: {
        data: {
          message: 'Erro ao processar a solicitação.',
        },
      },
    });

    vi.spyOn(
      axios,
      'isAxiosError',
    ).mockReturnValue(true);

    render(<ForgotPasswordPage />);

    await user.type(
      screen.getByLabelText('E-mail'),
      'guilherme@example.com',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Enviar instruções',
      }),
    );

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(
      'Erro ao processar a solicitação.',
    );
  });

  // Garante que falhas inesperadas recebam
  // uma mensagem genérica.
  it('deve exibir mensagem genérica em erro inesperado', async () => {
    const user = userEvent.setup();

    forgotPasswordMock.mockRejectedValue(
      new Error('Falha inesperada'),
    );

    vi.spyOn(
      axios,
      'isAxiosError',
    ).mockReturnValue(false);

    render(<ForgotPasswordPage />);

    await user.type(
      screen.getByLabelText('E-mail'),
      'guilherme@example.com',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Enviar instruções',
      }),
    );

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(
      'Não foi possível solicitar a recuperação de senha. Tente novamente.',
    );
  });

  // Garante que o usuário receba feedback
  // enquanto a solicitação estiver em andamento.
  it('deve mostrar estado de carregamento durante o envio', async () => {
    const user = userEvent.setup();

    let resolveRequest:
      | (() => void)
      | undefined;

    forgotPasswordMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = () => {
            resolve({
              message: SUCCESS_MESSAGE,
            });
          };
        }),
    );

    render(<ForgotPasswordPage />);

    await user.type(
      screen.getByLabelText('E-mail'),
      'guilherme@example.com',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Enviar instruções',
      }),
    );

    expect(
      screen.getByRole('button', {
        name: 'Enviando...',
      }),
    ).toBeDisabled();

    resolveRequest?.();

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'Enviar instruções',
        }),
      ).not.toBeDisabled();
    });
  });
});