'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/auth-context';
import { Container } from '@/components/layout/container';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const router = useRouter();

  const {
    isAuthenticated,
    isLoading,
    user,
  } = useAuth();

  // Aguarda a verificação inicial da sessão.
  // Se ela terminar sem um usuário autenticado,
  // redirecionamos para a tela de login.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [
    isAuthenticated,
    isLoading,
    router,
  ]);

  // Enquanto o refresh token está sendo verificado,
  // evitamos mostrar conteúdo privado ou redirecionar
  // o usuário prematuramente.
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-muted">
          Carregando sua conta...
        </p>
      </div>
    );
  }

  // Enquanto o redirecionamento para /login acontece,
  // nenhum conteúdo privado deve ser renderizado.
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-semibold text-foreground">
        Minha conta
      </h1>

      <p className="mt-2 text-muted">
        Olá, {user.name}.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meus pedidos</CardTitle>
            <CardDescription>
              Consulte seus pedidos e acompanhe o status de cada compra.
            </CardDescription>
          </CardHeader>

          <CardFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/account/orders')}
            >
              Ver meus pedidos
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meus endereços</CardTitle>
            <CardDescription>
              Gerencie os endereços utilizados nas suas compras.
            </CardDescription>
          </CardHeader>

          <CardFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/account/addresses')}
            >
              Gerenciar endereços
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Container>
  );
}