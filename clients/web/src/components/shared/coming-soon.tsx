import Link from 'next/link';

import { Container } from '@/components/layout/container';

type ComingSoonProps = {
    description: string;
    title: string;
};

export function ComingSoon({
    description,
    title,
}: ComingSoonProps) {
    return (
        <main className="py-16 md:py-24">
            <Container>
                <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
                    <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                        Em desenvolvimento
                    </span>

                    <h1 className="text-4xl font-bold text-foreground">
                        {title}
                    </h1>

                    <p className="text-lg leading-7 text-muted">
                        {description}
                    </p>

                    <Link
                        href="/"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90"
                    >
                        Voltar para a página inicial
                    </Link>
                </section>
            </Container>
        </main>
    );
}