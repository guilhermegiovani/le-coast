'use client';

import { useState, useEffect, type SubmitEvent } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import {
    type ApiErrorResponse,
} from '@/services/auth-service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
    const {
        isAuthenticated,
        isLoading: isAuthLoading,
        login,
    } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Redireciona usuários já autenticados para a Home.
    // Esperamos a restauração da sessão terminar antes
    // de decidir para evitar redirecionamentos incorretos.
    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            router.replace('/');
        }
    }, [
        isAuthLoading,
        isAuthenticated,
        router,
    ]);

    // Envia as credenciais para a camada global
    // de autenticação da aplicação.
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        // Remove mensagens de tentativas anteriores.
        setError('');

        try {
            setIsLoading(true);

            await login({
                email,
                password,
            });

            // Depois que o AuthContext salva usuário
            // e access token, seguimos para a aplicação.
            router.push('/');
        } catch (error) {
            // Erros conhecidos retornados pela API
            // são apresentados diretamente ao usuário.
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                const message = error.response?.data?.message;

                if (message) {
                    setError(message);
                    return;
                }
            }

            // Falhas inesperadas recebem uma mensagem genérica.
            setError(
                'Não foi possível entrar. Tente novamente.',
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
            <section
                aria-labelledby="login-title"
                className="w-full max-w-lg rounded-xl border border-neutral-300 bg-surface p-6 sm:p-8"
            >
                <div>
                    <h1
                        id="login-title"
                        className="text-2xl font-semibold text-foreground"
                    >
                        Entrar
                    </h1>

                    <p className="mt-2 text-sm text-muted">
                        Acesse sua conta para continuar.
                    </p>
                </div>

                <form
                    className="mt-6 space-y-4 sm:mt-8 sm:space-y-5"
                    onSubmit={handleSubmit}
                >
                    <Input
                        id="login-email"
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

                    <div className="space-y-2">
                        <Input
                            id="login-password"
                            name="password"
                            type="password"
                            label="Senha"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            className="border-neutral-400"
                        />

                        <div className="flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Esqueci minha senha
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="text-sm text-red-600"
                        >
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted">
                    Ainda não tem uma conta?{' '}
                    <Link
                        href="/register"
                        className="font-medium text-primary hover:underline"
                    >
                        Criar conta
                    </Link>
                </p>
            </section>
        </main>
    );
}