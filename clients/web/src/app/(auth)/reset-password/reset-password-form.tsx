'use client';

import axios from 'axios';
import Link from 'next/link';
import {
  useSearchParams,
  useRouter,
} from 'next/navigation';
import {
  type SubmitEvent,
  useState,
} from 'react';

import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  resetPassword,
  type ApiErrorResponse,
} from '@/services/auth-service';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Valida os dados locais e envia a nova senha
  // junto do token recebido pelo link de recuperação.
  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    // Remove mensagens antigas antes
    // de uma nova tentativa.
    setError('');
    setMessage('');

    // Sem token não existe autorização
    // para redefinir a senha.
    if (!token) {
      setError(
        'Token de recuperação não informado.',
      );
      return;
    }

    // A confirmação existe apenas no frontend
    // para evitar erros de digitação.
    if (password !== passwordConfirmation) {
      setError('As senhas não coincidem.');
      return;
    }

    // Evita uma requisição que já sabemos
    // que o backend rejeitaria.
    if (password.length < 8) {
      setError(
        'A senha deve conter pelo menos 8 caracteres.',
      );
      return;
    }

    try {
      setIsLoading(true);

      const result = await resetPassword({
        password,
        token,
      });

      // Exibe o feedback retornado pelo backend
      // antes de seguir para a tela de login.
      setMessage(result.message);

      // Após uma redefinição bem-sucedida,
      // o usuário precisa realizar login novamente.
      window.setTimeout(() => {
        router.replace('/login');
      }, 1500);
    } catch (error) {
      // Erros conhecidos, como token inválido
      // ou expirado, são apresentados ao usuário.
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const apiMessage =
          error.response?.data?.message;

        if (apiMessage) {
          setError(apiMessage);
          return;
        }
      }

      // Falhas inesperadas recebem uma mensagem
      // genérica sem expor detalhes técnicos.
      setError(
        'Não foi possível redefinir sua senha. Tente novamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center py-10">
      <Container>
        <section
          aria-labelledby="reset-password-title"
          className="mx-auto w-full max-w-lg rounded-xl border border-border bg-surface p-6 sm:p-8"
        >
          <div>
            <h1
              id="reset-password-title"
              className="text-2xl font-semibold text-foreground"
            >
              Redefinir senha
            </h1>

            <p className="mt-2 text-sm text-muted">
              Informe e confirme sua nova senha.
            </p>
          </div>

          <form
            className="mt-6 space-y-4 sm:mt-8 sm:space-y-5"
            onSubmit={handleSubmit}
          >
            <Input
              id="reset-password"
              name="password"
              type="password"
              label="Nova senha"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

            <Input
              id="reset-password-confirmation"
              name="passwordConfirmation"
              type="password"
              label="Confirmar nova senha"
              autoComplete="new-password"
              required
              value={passwordConfirmation}
              onChange={(event) =>
                setPasswordConfirmation(
                  event.target.value,
                )
              }
            />

            {error && (
              <p
                role="alert"
                className="text-sm text-red-600"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="text-sm text-green-700 dark:text-green-400"
              >
                {message}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? 'Redefinindo...'
                : 'Redefinir senha'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Voltar para{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </p>
        </section>
      </Container>
    </main>
  );
}