import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PromoBanner } from '@/components/home/promo-banner';

// Agrupa todos os testes relacionados ao componente PromoBanner.
describe('PromoBanner', () => {
  // Verifica se o título da seção é renderizado como um heading de nível 2.
  it('deve renderizar o heading da seção', () => {
    render(<PromoBanner />);

    const heading = screen.getByRole('heading', {
      name: 'Movimento, conforto e estilo',
      level: 2,
    });

    expect(heading).toBeInTheDocument();
  });

  // Verifica se o texto de destaque da coleção é renderizado.
  it('deve renderizar o texto Nova coleção', () => {
    render(<PromoBanner />);

    const text = screen.getByText('Nova coleção');

    expect(text).toBeInTheDocument();
  });

  // Verifica se o texto descritivo da seção é renderizado.
  it('deve renderizar o texto descritivo', () => {
    render(<PromoBanner />);

    const description = screen.getByText(
      'Peças pensadas para quem busca desempenho e beleza — da academia à praia, com materiais leves e cortes que valorizam o movimento.',
    );

    expect(description).toBeInTheDocument();
  });

  // Verifica se o botão de chamada para ação é renderizado como um link
  // e aponta para a página de produtos.
  it('deve renderizar o link Conheça a coleção com o destino correto', () => {
    render(<PromoBanner />);

    const link = screen.getByRole('link', {
      name: 'Conheça a coleção',
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/products');
  });
});