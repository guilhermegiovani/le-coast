import { Container } from '@/components/layout/container'

export function AnnouncementBar() {
  return (
    <section className="w-full bg-primary py-3 text-foreground">
      <Container>
        <p className="text-center text-sm">Frete grátis para compras acima de R$ 299</p>
      </Container>
    </section>
  )
}
