
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Store } from 'lucide-react';

import { useAuth } from '@/contexts/auth-context';
import { Container } from '@/components/layout/container';
import { cn } from '@/lib/utils';

type AdminLayoutProps = {
    children: ReactNode;
};

const ADMIN_LINKS = [
    {
        href: '/admin',
        label: 'Início',
        icon: LayoutDashboard,
    },
    {
        href: '/admin/orders',
        label: 'Pedidos',
        icon: ShoppingBag,
    },
    {
        href: '/admin/products',
        label: 'Produtos',
        icon: Package,
    },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname() ?? '/';
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Container className="py-8">
                <p className="text-muted">Carregando painel administrativo...</p>
            </Container>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return (
            <Container className="py-8">
                <section
                    className="rounded-xl border border-border p-6"
                    aria-labelledby="admin-access-title"
                >
                    <h1
                        id="admin-access-title"
                        className="text-xl font-semibold text-foreground"
                    >
                        Acesso não autorizado
                    </h1>

                    <p className="mt-2 text-muted">
                        Você não tem permissão para acessar o painel administrativo.
                    </p>

                    <Link
                        href="/"
                        className="mt-4 inline-flex text-primary hover:underline"
                    >
                        Voltar para a loja
                    </Link>
                </section>
            </Container>
        );
    }

    return (
        <div className="min-w-0 flex-1">
            <div className="border-b border-border bg-background">
                <Container className="py-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-muted">Le Coast</p>
                            <h1 className="text-xl font-semibold text-foreground">
                                Painel administrativo
                            </h1>
                        </div>

                        <Link
                            href="/"
                            className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
                        >
                            <Store aria-hidden="true" className="size-4" />
                            Voltar para a loja
                        </Link>
                    </div>

                    <nav
                        aria-label="Navegação administrativa"
                        className="mt-5 -mx-1 overflow-x-auto"
                    >
                        <ul className="flex min-w-max gap-2">
                            {ADMIN_LINKS.map(({ href, label, icon: Icon }) => {
                                const isActive =
                                    href === '/admin'
                                        ? pathname === href
                                        : pathname === href || pathname.startsWith(`${href}/`);

                                return (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={cn(
                                                'inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                                                isActive
                                                    ? 'bg-primary text-white'
                                                    : 'text-muted hover:bg-muted/10 hover:text-foreground',
                                            )}
                                        >
                                            <Icon aria-hidden="true" className="size-4" />
                                            {label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </Container>
            </div>

            <main className="py-6 sm:py-8">
                {children}
            </main>
        </div>
    );
}
