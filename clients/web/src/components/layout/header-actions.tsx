'use client';

import {
  Search,
  ShoppingCart,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';

type HeaderAction = {
  href: string;
  icon: LucideIcon;
  label: string;
};

type HeaderActionsProps = {
  ariaLabel?: string;
  direction?: 'horizontal' | 'vertical';
  onNavigate?: () => void;
  showLabels?: boolean;
};

// Centraliza as ações para reutilizá-las no cabeçalho desktop e no menu mobile.
const HEADER_ACTIONS: HeaderAction[] = [
  {
    href: '/search',
    icon: Search,
    label: 'Buscar',
  },
  {
    href: '/account',
    icon: UserRound,
    label: 'Conta',
  },
  {
    href: '/cart',
    icon: ShoppingCart,
    label: 'Carrinho',
  },
];

export function HeaderActions({
  ariaLabel = 'Ações do cabeçalho',
  direction = 'horizontal',
  onNavigate,
  showLabels = false,
}: HeaderActionsProps) {
  // Obtém o caminho atual para identificar qual ação está ativa.
  const pathname = usePathname() ?? '/';

  // Mantém as ações em linha no desktop e permite organizá-las em coluna no mobile.
  const listClasses =
    direction === 'vertical'
      ? 'flex flex-col gap-3'
      : 'flex items-center gap-4';

  const items = useCartStore((state) => state.items);

  // Soma a quantidade total de unidades existentes no carrinho.
  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <nav aria-label={ariaLabel}>
      <ul className={listClasses}>
        {HEADER_ACTIONS.map(({ href, icon: Icon, label }) => {
          // Mantém a ação ativa também em possíveis páginas filhas.
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 border-b-2 border-transparent text-foreground transition-colors duration-200 hover:text-primary',
                  isActive &&
                    'border-primary font-semibold text-primary',
                )}
                onClick={onNavigate}
              >
                {showLabels && (
                  <Icon
                    aria-hidden="true"
                    className="size-5 shrink-0"
                  />
                )}

                <span>{label}</span>

                {label === 'Carrinho' && totalItems > 0 && (
                  <span
                    aria-label={`${totalItems} itens no carrinho`}
                    className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-semibold leading-none text-white"
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}