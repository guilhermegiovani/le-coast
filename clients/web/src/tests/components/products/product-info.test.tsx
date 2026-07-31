import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductInfo } from '@/components/products/product-info';

const COLORS = [
  {
    id: 1,
    name: 'Preto',
    slug: 'preto',
  },
  {
    id: 2,
    name: 'Rosa',
    slug: 'rosa',
  },
];

const SIZES = [
  {
    id: 1,
    name: 'P',
    slug: 'p',
  },
  {
    id: 2,
    name: 'M',
    slug: 'm',
  },
];

// Agrupa os testes das responsabilidades do componente ProductInfo.
describe('ProductInfo', () => {
  // Garante que o nome do produto é exibido como título principal.
  it('deve renderizar o nome do produto como h1', () => {
    render(
      <ProductInfo
        colors={COLORS}
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        price={89.9}
        sizes={SIZES}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Top Essential',
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  // Garante que o preço é exibido no formato monetário brasileiro.
  it('deve renderizar o preço formatado em reais', () => {
    render(
      <ProductInfo
        colors={COLORS}
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        price={89.9}
        sizes={SIZES}
      />,
    );

    expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
  });

  // Garante que a descrição recebida é exibida para o usuário.
  it('deve renderizar a descrição do produto', () => {
    render(
      <ProductInfo
        colors={COLORS}
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        price={89.9}
        sizes={SIZES}
      />,
    );

    expect(
      screen.getByText(
        'Top fitness com sustentação e tecido confortável.',
      ),
    ).toBeInTheDocument();
  });

  // Garante que todos os tamanhos recebidos são renderizados.
  it.each(SIZES)(
    'deve renderizar a opção de tamanho $name',
    ({ name }) => {
      render(
        <ProductInfo
          colors={COLORS}
          description="Top fitness com sustentação e tecido confortável."
          name="Top Essential"
          price={89.9}
          sizes={SIZES}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: `Selecionar tamanho ${name}`,
        }),
      ).toBeInTheDocument();
    },
  );

  // Garante que todas as cores recebidas são renderizadas.
  it.each(COLORS)(
    'deve renderizar a opção de cor $name',
    ({ name }) => {
      render(
        <ProductInfo
          colors={COLORS}
          description="Top fitness com sustentação e tecido confortável."
          name="Top Essential"
          price={89.9}
          sizes={SIZES}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: `Selecionar cor ${name}`,
        }),
      ).toBeInTheDocument();
    },
  );

  // Garante que a ação principal de adicionar ao carrinho aparece.
  it('deve renderizar o botão Adicionar ao carrinho', () => {
    render(
      <ProductInfo
        colors={COLORS}
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        price={89.9}
        sizes={SIZES}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    ).toBeInTheDocument();
  });
});