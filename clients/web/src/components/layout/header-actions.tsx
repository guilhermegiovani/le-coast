import {
  Search,
  ShoppingCart,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

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
  // Mantém as ações em linha no desktop e permite organizá-las em coluna no mobile.
  const listClasses =
    direction === 'vertical'
      ? 'flex flex-col gap-3'
      : 'flex items-center gap-4';

  return (
    <nav aria-label={ariaLabel}>
      <ul className={listClasses}>
        {HEADER_ACTIONS.map(({ href, icon: Icon, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-3 text-foreground transition-colors duration-200 hover:text-primary"
              onClick={onNavigate}
            >
              {showLabels && (
                <Icon aria-hidden="true" className="size-5 shrink-0" />
              )}

              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}