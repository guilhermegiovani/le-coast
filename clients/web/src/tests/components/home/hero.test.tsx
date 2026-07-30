import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Hero } from '@/components/home/hero';

// Agrupa todos os testes relacionados ao componente Hero.
describe('Hero', () => {
  // Verifica se o título principal da página é renderizado como um heading de nível 1.
  it('deve renderizar o título principal como h1', () => {
    render(<Hero />);

    expect(
      screen.getByRole('heading', {
        name: 'Moda Fitness & Beachwear',
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  // Verifica se o texto de apresentação do Hero aparece na tela.
  it('deve renderizar o texto descritivo', () => {
    render(<Hero />);

    expect(
      screen.getByText(
        'Peças criadas para acompanhar seu treino, seus momentos de lazer e sua rotina com conforto e estilo.',
      ),
    ).toBeInTheDocument();
  });

  // Verifica se o botão principal de compra é renderizado.
  it('deve renderizar o botão Comprar agora', () => {
    render(<Hero />);

    const button = screen.getByRole('button', {
      name: 'Comprar agora',
    });

    expect(button).toBeInTheDocument();
  });

  // Verifica se o botão que direcionará para a coleção é renderizado.
  it('deve renderizar o botão Ver coleção', () => {
    render(<Hero />);

    const button = screen.getByRole('button', {
      name: 'Ver coleção',
    });

    expect(button).toBeInTheDocument();
  });
});