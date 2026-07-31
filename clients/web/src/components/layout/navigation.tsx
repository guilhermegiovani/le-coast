import Link from 'next/link';

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
  // Define a disposição dos links conforme o contexto em que a navegação é usada.
  const listClasses =
    direction === 'vertical'
      ? 'flex flex-col gap-4'
      : 'flex flex-row items-center gap-6';

  return (
    <nav aria-label={ariaLabel}>
      <ul className={listClasses}>
        {NAVIGATION_LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-foreground transition-colors duration-200 hover:text-primary"
              onClick={onNavigate}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}