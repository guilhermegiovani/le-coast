import Link from 'next/link'

export function Navigation() {
  return (
    <nav aria-label="Navegação principal">
      <ul className="flex flex-row items-center gap-6">
        <li>
          <Link href="/" className="text-foreground transition-colors hover:text-primary">
            Início
          </Link>
        </li>
        <li>
          <Link href="/products" className="text-foreground transition-colors hover:text-primary">
            Produtos
          </Link>
        </li>
        <li>
          <Link href="/about" className="text-foreground transition-colors hover:text-primary">
            Sobre
          </Link>
        </li>
        <li>
          <Link href="/contact" className="text-foreground transition-colors hover:text-primary">
            Contato
          </Link>
        </li>
      </ul>
    </nav>
  )
}
