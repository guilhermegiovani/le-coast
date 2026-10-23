
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

type NavigationProps = {
  ariaLabel?: string;
  direction?: 'horizontal' | 'vertical';
  onNavigate?: () => void;
};

// Centraliza os links para que desktop e mobile utilizem a mesma navegação.
const NAVIGATION_LINKS = [
  {
    href: '/',
    label: 'Início',
  },
  {
    href: '/products',
    label: 'Produtos',
  },
  {
    href: '/about',
    label: 'Sobre',
  },
  {
    href: '/contact',
    label: 'Contato',
  },
];

export function Navigation({
  ariaLabel = 'Navegação principal',
  direction = 'horizontal',
  onNavigate,
}: NavigationProps) {
  // Identifica a rota atual para destacar o link ativo.
  const pathname = usePathname() ?? '/';

  // Obtém a sessão para exibir o acesso administrativo somente a administradores.
  const { user, isLoading } = useAuth();

  // Define a disposição dos links conforme o contexto desktop ou mobile.
  const listClasses =
    direction === 'vertical'
      ? 'flex flex-col gap-4'
      : 'flex flex-row items-center gap-6';

  // Mantém a navegação administrativa oculta enquanto a sessão é restaurada.
  const navigationLinks =
    !isLoading && user?.role === 'ADMIN'
      ? [
        ...NAVIGATION_LINKS,
        {
          href: '/admin',
          label: 'Painel administrativo',
        },
      ]
      : NAVIGATION_LINKS;

  return (
    <nav aria-label={ariaLabel}>
      <ul className={listClasses}>
        {navigationLinks.map(({ href, label }) => {
          // A Home só fica ativa na rota exata "/".
          // As demais continuam ativas em suas páginas filhas.
          const isActive =
            href === '/'
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'border-b-2 border-transparent text-foreground transition-colors duration-200 hover:text-primary',
                  isActive && 'border-primary font-semibold text-primary',
                )}
                onClick={onNavigate}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
