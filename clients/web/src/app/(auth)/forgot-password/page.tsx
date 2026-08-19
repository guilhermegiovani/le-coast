'use client';

import axios from 'axios';
import Link from 'next/link';
import { type SubmitEvent, useState } from 'react';

import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    forgotPassword,
    type ApiErrorResponse,
} from '@/services/auth-service';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Envia a solicitação de recuperação de senha
    // para o backend utilizando o e-mail informado.
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        // Limpa mensagens antigas antes
        // de iniciar uma nova tentativa.
        setError('');
        setMessage('');

        try {
            setIsLoading(true);

            const result = await forgotPassword({
                email,
            });

            // Exibe a mensagem genérica enviada pelo backend.
            // Ela não revela se o e-mail existe ou não.
            setMessage(result.message);
        } catch (error) {
            // Erros conhecidos da API são apresentados
            // diretamente para o usuário.
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
                'Não foi possível solicitar a recuperação de senha. Tente novamente.',
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center py-10">
            <Container>
                <section
                    aria-labelledby="forgot-password-title"
                    className="mx-auto w-full max-w-lg rounded-xl border border-neutral-300 bg-surface p-6 sm:p-8"
                >
                    <div>
                        <h1
                            id="forgot-password-title"
                            className="text-2xl font-semibold text-foreground"
                        >
                            Recuperar senha
                        </h1>

                        <p className="mt-2 text-sm text-muted">
                            Informe seu e-mail para receber as instruções de redefinição.
                        </p>
                    </div>

                    <form
                        className="mt-6 space-y-4 sm:mt-8 sm:space-y-5"
                        onSubmit={handleSubmit}
                    >
                        <Input
                            id="forgot-password-email"
                            name="email"
                            type="email"
                            label="E-mail"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            className="border-neutral-400"
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
                                className="text-sm text-green-700"
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
                                ? 'Enviando...'
                                : 'Enviar instruções'}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted">
                        Lembrou sua senha?{' '}
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Voltar para login
                        </Link>
                    </p>
                </section>
            </Container>
        </main>
    );
}