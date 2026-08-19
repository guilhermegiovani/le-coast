'use client';

import Link from 'next/link';
import {
    type SubmitEvent,
    useEffect,
    useState,
} from 'react';

import axios from 'axios';
import { useRouter } from 'next/navigation';

import { register, type ApiErrorResponse, } from '@/services/auth-service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';

export default function RegisterPage() {
    const {
        isAuthenticated,
        isLoading: isAuthLoading,
    } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Usuários já autenticados não precisam
    // acessar novamente a tela de cadastro.
    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            router.replace('/');
        }
    }, [
        isAuthLoading,
        isAuthenticated,
        router,
    ]);

    // Valida os dados locais e envia o cadastro para o backend.
    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        // Limpa mensagens antigas antes de uma nova tentativa.
        setError('');

        // A confirmação de senha existe apenas no frontend
        // para evitar erros de digitação do usuário.
        if (password !== passwordConfirmation) {
            setError('As senhas não coincidem.');
            return;
        }

        // Evita enviar uma senha que já sabemos
        // que será rejeitada pelo backend.
        if (password.length < 8) {
            setError(
                'A senha deve conter pelo menos 8 caracteres.',
            );
            return;
        }

        try {
            setIsLoading(true);

            await register({
                email,
                name,
                password,
            });

            // Após criar a conta, o usuário segue para o login.
            // Não autenticamos automaticamente neste primeiro fluxo.
            router.push('/login');
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                const message = error.response?.data?.message;

                if (message) {
                    setError(message);
                    return;
                }
            }

            setError(
                'Não foi possível criar sua conta. Tente novamente.',
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
            <section
                aria-labelledby="register-title"
                className="w-full max-w-lg rounded-xl border border-neutral-300 bg-surface p-6 sm:p-8"
            >
                <div>
                    <h1
                        id="register-title"
                        className="text-2xl font-semibold text-foreground"
                    >
                        Criar conta
                    </h1>

                    <p className="mt-2 text-sm text-muted">
                        Preencha seus dados para criar sua conta.
                    </p>
                </div>

                <form
                    className="mt-6 space-y-4 sm:mt-8 sm:space-y-5"
                    onSubmit={handleSubmit}
                >
                    <Input
                        id="register-name"
                        name="name"
                        type="text"
                        label="Nome completo"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        className="border-neutral-400"
                    />

                    <Input
                        id="register-email"
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

                    <Input
                        id="register-password"
                        name="password"
                        type="password"
                        label="Senha"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        className="border-neutral-400"
                    />

                    <Input
                        id="register-password-confirmation"
                        name="passwordConfirmation"
                        type="password"
                        label="Confirmar senha"
                        autoComplete="new-password"
                        required
                        value={passwordConfirmation}
                        onChange={(event) =>
                            setPasswordConfirmation(
                                event.target.value,
                            )
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

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Criando conta...' : 'Criar conta'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted">
                    Já tem uma conta?{' '}
                    <Link
                        href="/login"
                        className="font-medium text-primary hover:underline"
                    >
                        Entrar
                    </Link>
                </p>
            </section>
        </main>
    );
}