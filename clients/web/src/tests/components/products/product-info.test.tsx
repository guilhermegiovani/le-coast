import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProductInfo } from '@/components/products/product-info';

const VARIANTS = [
  {
    color: {
      id: 1,
      name: 'Preto',
      slug: 'preto',
    },
    id: 1,
    price: 89.9,
    size: {
      id: 1,
      name: 'P',
      slug: 'p',
    },
    sku: 'TOP-ESS-P-PRE',
    stock: 8,
  },
  {
    color: {
      id: 1,
      name: 'Preto',
      slug: 'preto',
    },
    id: 2,
    price: 99.9,
    size: {
      id: 2,
      name: 'M',
      slug: 'm',
    },
    sku: 'TOP-ESS-M-PRE',
    stock: 12,
  },
  {
    color: {
      id: 2,
      name: 'Rosa',
      slug: 'rosa',
    },
    id: 3,
    price: 109.9,
    size: {
      id: 1,
      name: 'P',
      slug: 'p',
    },
    sku: 'TOP-ESS-P-ROS',
    stock: 5,
  },
];

// Agrupa os testes das responsabilidades do componente ProductInfo.
describe('ProductInfo', () => {
  // Garante que o nome do produto é exibido como título principal.
  it('deve renderizar o nome do produto como h1', () => {
    render(
      <ProductInfo
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        variants={VARIANTS}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Top Essential',
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  // Garante que o preço inicial vem da primeira variante.
  it('deve renderizar o preço da variante inicial', () => {
    render(
      <ProductInfo
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        variants={VARIANTS}
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
        variants={VARIANTS}
      />,
    );

    expect(
      screen.getByText(
        'Top fitness com sustentação e tecido confortável.',
      ),
    ).toBeInTheDocument();
  });

  // Garante que os tamanhos únicos disponíveis são renderizados.
  it.each(['P', 'M'])(
    'deve renderizar a opção de tamanho %s',
    (size) => {
      render(
        <ProductInfo
          description="Top fitness com sustentação e tecido confortável."
          name="Top Essential"
          variants={VARIANTS}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: `Selecionar tamanho ${size}`,
        }),
      ).toBeInTheDocument();
    },
  );

  // Garante que as cores únicas disponíveis são renderizadas.
  it.each(['Preto', 'Rosa'])(
    'deve renderizar a opção de cor %s',
    (color) => {
      render(
        <ProductInfo
          description="Top fitness com sustentação e tecido confortável."
          name="Top Essential"
          variants={VARIANTS}
        />,
      );

      expect(
        screen.getByRole('button', {
          name: `Selecionar cor ${color}`,
        }),
      ).toBeInTheDocument();
    },
  );

  // Garante que a primeira variante começa selecionada.
  it('deve iniciar com a primeira cor e o primeiro tamanho selecionados', () => {
    render(
      <ProductInfo
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        variants={VARIANTS}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Selecionar cor Preto',
      }),
    ).toHaveAttribute('aria-pressed', 'true');

    expect(
      screen.getByRole('button', {
        name: 'Selecionar tamanho P',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  // Garante que selecionar outro tamanho atualiza a variante exibida.
  it('deve atualizar preço e estoque ao selecionar outro tamanho', () => {
    render(
      <ProductInfo
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        variants={VARIANTS}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Selecionar tamanho M',
      }),
    );

    expect(screen.getByText('R$ 99,90')).toBeInTheDocument();
    expect(
      screen.getByText('12 unidades disponíveis'),
    ).toBeInTheDocument();
  });

  // Garante que selecionar outra cor mantém uma combinação válida.
  it('deve selecionar uma variante válida ao trocar a cor', () => {
    render(
      <ProductInfo
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        variants={VARIANTS}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Selecionar tamanho M',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Selecionar cor Rosa',
      }),
    );

    expect(
      screen.getByRole('button', {
        name: 'Selecionar cor Rosa',
      }),
    ).toHaveAttribute('aria-pressed', 'true');

    expect(
      screen.getByRole('button', {
        name: 'Selecionar tamanho P',
      }),
    ).toHaveAttribute('aria-pressed', 'true');

    expect(screen.getByText('R$ 109,90')).toBeInTheDocument();
  });

  // Garante que tamanhos inexistentes para a cor atual ficam indisponíveis.
  it('deve desabilitar tamanhos inexistentes para a cor selecionada', () => {
    render(
      <ProductInfo
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        variants={VARIANTS}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Selecionar cor Rosa',
      }),
    );

    expect(
      screen.getByRole('button', {
        name: 'Selecionar tamanho M',
      }),
    ).toBeDisabled();
  });

  // Garante que a ação principal de adicionar ao carrinho aparece habilitada.
  it('deve renderizar o botão Adicionar ao carrinho habilitado', () => {
    render(
      <ProductInfo
        description="Top fitness com sustentação e tecido confortável."
        name="Top Essential"
        variants={VARIANTS}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    ).toBeEnabled();
  });
});