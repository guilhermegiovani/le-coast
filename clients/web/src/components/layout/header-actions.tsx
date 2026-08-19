'use client';

import {
  Search,
  ShoppingCart,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/contexts/auth-context';

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
  const {
    isAuthenticated,
    logout,
    user,
  } = useAuth();

  const router = useRouter();

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

  // Retorna primeiro para uma página pública
  // antes de encerrar o estado local da sessão.
  //
  // Isso evita que a rota privada /account detecte
  // o logout e redirecione para /login antes da navegação.
  async function handleLogout() {
    router.replace('/');

    await logout();
  }

  return (
    <nav aria-label={ariaLabel}>
      <ul className={listClasses}>
        {HEADER_ACTIONS.map(({ href, icon: Icon, label }) => {
          // Mantém a ação ativa também em possíveis páginas filhas.
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          // Personaliza a ação de conta de acordo
          // com o estado atual da autenticação.
          const actionLabel =
            label === 'Conta' && isAuthenticated && user
              ? user.name
              : label;

          // Quando o usuário está autenticado, a ação de conta
          // passa a oferecer também a possibilidade de sair.
          if (
            label === 'Conta' &&
            isAuthenticated &&
            user
          ) {
            return (
              <li
                key={href}
                className="flex items-center gap-3"
              >
                <Link
                  href="/account"
                  aria-current={
                    isActive ? 'page' : undefined
                  }
                  className={cn(
                    'flex items-center gap-2 border-b-2 border-transparent text-foreground transition-colors duration-200 hover:text-primary',
                    isActive &&
                    'border-primary font-semibold text-primary',
                  )}
                  onClick={onNavigate}
                >
                  {showLabels && (
                    <UserRound
                      aria-hidden="true"
                      className="size-5 shrink-0"
                    />
                  )}

                  <span>{user.name}</span>
                </Link>

                <button
                  type="button"
                  className="text-sm text-muted transition-colors hover:text-primary"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </li>
            );
          }

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

                <span>{actionLabel}</span>

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