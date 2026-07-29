import Link from 'next/link'

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Le Coast - Página inicial"
      className="text-2xl font-semibold tracking-wider text-foreground transition-opacity duration-200 hover:opacity-80"
    >
      Le Coast
    </Link>
  )
}
