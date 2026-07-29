import { Container } from '@/components/layout/container';
import Link from 'next/link';

const links = [
  { href: '/products', label: 'Produtos' },
  { href: '/about', label: 'Sobre' },
  { href: '/contact', label: 'Contato' },
  { href: '/privacy', label: 'Política de Privacidade' },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border py-6 md:py-8">
      <Container>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="mb-6 md:mb-0">
            <p className="text-2xl font-semibold text-foreground">
              Le Coast
            </p>

            <p className="mt-2 text-sm text-muted">
              Moda fitness e beachwear para todos os momentos.
            </p>
          </div>

          <nav aria-label="Links do rodapé">
            <ul className="flex flex-col gap-2 md:items-end">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-6">
          <p className="text-sm text-muted">
            © 2026 Le Coast. Todos os direitos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}