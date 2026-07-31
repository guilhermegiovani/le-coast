import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductDetailsPage from '@/app/products/[slug]/page';

const mockedNotFound = vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
    notFound: () => mockedNotFound(),
}));

// Agrupa os testes da página de detalhes do produto.
describe('ProductDetailsPage', () => {
    // Garante que os dados do produto correspondente ao slug são exibidos.
    it('deve renderizar os detalhes do produto', async () => {
        const page = await ProductDetailsPage({
            params: Promise.resolve({
                slug: 'top-essential',
            }),
        });

        render(page);

        expect(
            screen.getByRole('heading', {
                name: 'Top Essential',
                level: 1,
            }),
        ).toBeInTheDocument();

        expect(screen.getByText('R$ 89,90')).toBeInTheDocument();

        expect(
            screen.getByText(
                'Top fitness com sustentação, tecido confortável e modelagem pensada para acompanhar seus movimentos.',
            ),
        ).toBeInTheDocument();
    });

    // Garante que a galeria recebe o nome correto do produto.
    it('deve renderizar a galeria do produto', async () => {
        const page = await ProductDetailsPage({
            params: Promise.resolve({
                slug: 'top-essential',
            }),
        });

        render(page);

        expect(
            screen.getByRole('region', {
                name: 'Galeria de imagens de Top Essential',
            }),
        ).toBeInTheDocument();
    });

    // Garante que as opções e a ação principal aparecem na página.
    it('deve renderizar as opções de tamanho e o botão do carrinho', async () => {
        const page = await ProductDetailsPage({
            params: Promise.resolve({
                slug: 'top-essential',
            }),
        });

        render(page);

        expect(
            screen.getByRole('button', {
                name: 'Selecionar tamanho P',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Selecionar tamanho M',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Selecionar tamanho G',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Adicionar ao carrinho',
            }),
        ).toBeInTheDocument();
    });

    // Garante que uma rota inválida aciona a página de não encontrado.
    it('deve chamar notFound quando o produto não existir', async () => {
        mockedNotFound.mockClear();

        await expect(
            ProductDetailsPage({
                params: Promise.resolve({
                    slug: 'produto-inexistente',
                }),
            }),
        ).rejects.toThrow('NEXT_NOT_FOUND');

        expect(mockedNotFound).toHaveBeenCalledTimes(1);
    });
});