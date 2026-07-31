import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductInfo } from '@/components/products/product-info';

// Agrupa os testes das responsabilidades do componente ProductInfo.
describe('ProductInfo', () => {
  // Garante que o nome do produto é exibido como título principal.
  it('deve renderizar o nome do produto como h1', () => {
    render(
      <ProductInfo
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        price={89.9}
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
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        price={89.9}
      />,
    );

    expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
  });

  // Garante que a descrição recebida é exibida para o usuário.
  it('deve renderizar a descrição do produto', () => {
    render(
      <ProductInfo
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        price={89.9}
      />,
    );

    expect(
      screen.getByText(
        'Top fitness com sustentação e tecido confortável.',
      ),
    ).toBeInTheDocument();
  });

  // Garante que todas as opções de tamanho disponíveis são renderizadas.
  it.each(['P', 'M', 'G'])(
    'deve renderizar a opção de tamanho %s',
    (size) => {
      render(
        <ProductInfo
          description="Top fitness com sustentação e tecido confortável."
          name="Top Essential"
          price={89.9}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: `Selecionar tamanho ${size}`,
        }),
      ).toBeInTheDocument();
    },
  );

  // Garante que a ação principal de adicionar ao carrinho aparece na página.
  it('deve renderizar o botão Adicionar ao carrinho', () => {
    render(
      <ProductInfo
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        price={89.9}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    ).toBeInTheDocument();
  });
});