'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  // Obtém o caminho atual para identificar qual link está ativo.
  const pathname = usePathname() ?? '/';

  // Define a disposição dos links conforme o contexto em que a navegação é usada.
  const listClasses =
    direction === 'vertical'
      ? 'flex flex-col gap-4'
      : 'flex flex-row items-center gap-6';

  return (
    <nav aria-label={ariaLabel}>
      <ul className={listClasses}>
        {NAVIGATION_LINKS.map(({ href, label }) => {
          // A Home só fica ativa na rota exata "/".
          // As demais continuam ativas em páginas filhas, como "/products/top-essential".
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
                  isActive &&
                    'border-primary font-semibold text-primary',
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