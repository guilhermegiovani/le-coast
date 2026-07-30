import { Container } from '@/components/layout/container'
import { HeaderActions } from '@/components/layout/header-actions'
import { Logo } from '@/components/layout/logo'
import { Navigation } from '@/components/layout/navigation'

export function Header() {
  return (
    <header className="w-full border-b border-border py-3 md:py-4">
      <Container>
        <div className="flex items-center justify-between">
          <Logo />

          <div className="hidden md:flex md:flex-1 md:justify-center">
            <Navigation />
          </div>

          <HeaderActions />
        </div>
      </Container>
    </header>
  )
}
