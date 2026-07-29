import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold">Le Coast UI</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Variants</h2>

        <div className="flex flex-wrap gap-4">
          <Button>Primary</Button>

          <Button variant="secondary">
            Secondary
          </Button>

          <Button variant="outline">
            Outline
          </Button>

          <Button variant="ghost">
            Ghost
          </Button>

          <Button variant="danger">
            Danger
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sizes</h2>

        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">
            Small
          </Button>

          <Button size="md">
            Medium
          </Button>

          <Button size="lg">
            Large
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">States</h2>

        <div className="flex flex-wrap gap-4">
          <Button disabled>
            Disabled
          </Button>

          <Button className="w-full md:w-auto">
            Full Width no Mobile
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Inputs</h2>

        <div className="grid max-w-md gap-5">
          <Input
            label="Nome"
            placeholder="Digite seu nome"
          />

          <Input
            label="E-mail"
            type="email"
            placeholder="seuemail@exemplo.com"
            helperText="Usaremos este e-mail para acessar sua conta."
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Digite sua senha"
          />

          <Input
            label="CPF"
            placeholder="000.000.000-00"
            error="CPF inválido."
          />

          <Input
            label="Campo desabilitado"
            placeholder="Não pode ser alterado"
            disabled
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Cards</h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Top Fitness</CardTitle>

              <CardDescription>
                Modelo confortável para treinos e atividades do dia a dia.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-foreground">
                Tecido leve, alta sustentação e secagem rápida.
              </p>
            </CardContent>

            <CardFooter>
              <Button size="sm">Ver produto</Button>

              <Button
                variant="outline"
                size="sm"
              >
                Favoritar
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pedido confirmado</CardTitle>

              <CardDescription>
                Seu pedido foi recebido e está sendo preparado.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-foreground">
                Acompanhe as atualizações na área de pedidos.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}