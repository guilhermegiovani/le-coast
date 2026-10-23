import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/contexts/auth-context';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/app/admin/layout';

vi.mock('@/contexts/auth-context', () => ({
    useAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
}));

vi.mock('next/link', () => ({
    default: ({
        href,
        children,
        ...props
    }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        href: string;
    }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

const useAuthMock = vi.mocked(useAuth);
const usePathnameMock = vi.mocked(usePathname);

describe('AdminLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        usePathnameMock.mockReturnValue('/admin');

        useAuthMock.mockReturnValue({
            user: { role: 'ADMIN' },
            isLoading: false,
        } as ReturnType<typeof useAuth>);
    });

    it('deve exibir carregamento enquanto verifica a autenticação', () => {
        useAuthMock.mockReturnValue({
            user: null,
            isLoading: true,
        } as ReturnType<typeof useAuth>);

        render(
            <AdminLayout>
                <p>Conteúdo da página</p>
            </AdminLayout>,
        );

        expect(
            screen.getByText('Carregando painel administrativo...'),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole('navigation', {
                name: 'Navegação administrativa',
            }),
        ).not.toBeInTheDocument();
    });

    it('deve negar acesso quando não existe usuário autenticado', () => {
        useAuthMock.mockReturnValue({
            user: null,
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        render(
            <AdminLayout>
                <p>Conteúdo da página</p>
            </AdminLayout>,
        );

        expect(
            screen.getByRole('heading', {
                name: 'Acesso não autorizado',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('link', {
                name: 'Voltar para a loja',
            }),
        ).toHaveAttribute('href', '/');

        expect(
            screen.queryByText('Conteúdo da página'),
        ).not.toBeInTheDocument();
    });

    it('deve negar acesso a usuários que não são ADMIN', () => {
        useAuthMock.mockReturnValue({
            user: { role: 'CUSTOMER' },
            isLoading: false,
        } as ReturnType<typeof useAuth>);

        render(
            <AdminLayout>
                <p>Conteúdo da página</p>
            </AdminLayout>,
        );

        expect(
            screen.getByRole('heading', {
                name: 'Acesso não autorizado',
            }),
        ).toBeInTheDocument();

        expect(
            screen.queryByRole('navigation', {
                name: 'Navegação administrativa',
            }),
        ).not.toBeInTheDocument();
    });

    it('deve renderizar o painel e os links administrativos para ADMIN', () => {
        render(
            <AdminLayout>
                <p>Conteúdo da página</p>
            </AdminLayout>,
        );

        expect(
            screen.getByRole('heading', {
                name: 'Painel administrativo',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('navigation', {
                name: 'Navegação administrativa',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('link', { name: 'Início' }),
        ).toHaveAttribute('href', '/admin');

        expect(
            screen.getByRole('link', { name: 'Pedidos' }),
        ).toHaveAttribute('href', '/admin/orders');

        expect(
            screen.getByRole('link', { name: 'Produtos' }),
        ).toHaveAttribute('href', '/admin/products');

        expect(
            screen.getByRole('link', { name: /Voltar para a loja/ }),
        ).toHaveAttribute('href', '/');

        expect(
            screen.getByText('Conteúdo da página'),
        ).toBeInTheDocument();
    });

    it('deve marcar Início como página atual na rota /admin', () => {
        usePathnameMock.mockReturnValue('/admin');

        render(
            <AdminLayout>
                <p>Conteúdo</p>
            </AdminLayout>,
        );

        expect(
            screen.getByRole('link', { name: 'Início' }),
        ).toHaveAttribute('aria-current', 'page');

        expect(
            screen.getByRole('link', { name: 'Pedidos' }),
        ).not.toHaveAttribute('aria-current');

        expect(
            screen.getByRole('link', { name: 'Produtos' }),
        ).not.toHaveAttribute('aria-current');
    });

    it('deve marcar Pedidos como página atual em uma rota filha', () => {
        usePathnameMock.mockReturnValue('/admin/orders/123');

        render(
            <AdminLayout>
                <p>Conteúdo</p>
            </AdminLayout>,
        );

        expect(
            screen.getByRole('link', { name: 'Pedidos' }),
        ).toHaveAttribute('aria-current', 'page');

        expect(
            screen.getByRole('link', { name: 'Início' }),
        ).not.toHaveAttribute('aria-current');
    });

    it('deve marcar Produtos como página atual na rota de produtos', () => {
        usePathnameMock.mockReturnValue('/admin/products');

        render(
            <AdminLayout>
                <p>Conteúdo</p>
            </AdminLayout>,
        );

        expect(
            screen.getByRole('link', { name: 'Produtos' }),
        ).toHaveAttribute('aria-current', 'page');
    });
});
