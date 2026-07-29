import Link from 'next/link';

const actions = [
  { href: '/search', label: 'Buscar' },
  { href: '/account', label: 'Conta' },
  { href: '/cart', label: 'Carrinho' },
];

export function HeaderActions() {
  return (
    <nav aria-label="Ações do cabeçalho">
      <ul className="flex items-center gap-4">
        {actions.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="text-foreground transition-colors duration-200 hover:text-primary"
            >
              {action.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}