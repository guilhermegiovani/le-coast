import { fireEvent, render, screen } from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { ProductInfo } from '@/components/products/product-info';

// Cria o mock antes do carregamento dos módulos feito pelo Vitest.
const { addItemMock } = vi.hoisted(() => ({
  addItemMock: vi.fn(),
}));

// Simula apenas a ação da store utilizada pelo ProductInfo.
vi.mock('@/stores/cart-store', () => ({
  useCartStore: (
    selector: (state: {
      addItem: typeof addItemMock;
    }) => unknown,
  ) =>
    selector({
      addItem: addItemMock,
    }),
}));

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

// Evita repetir as mesmas propriedades em todos os testes.
function renderProductInfo() {
  render(
    <ProductInfo
      description="Top fitness com sustentação e tecido confortável."
      name="Top Essential"
      productId={1}
      productSlug="top-essential"
      variants={VARIANTS}
    />,
  );
}

// Agrupa os testes das responsabilidades do componente ProductInfo.
describe('ProductInfo', () => {
  // Limpa as chamadas da store antes de cada teste.
  beforeEach(() => {
    addItemMock.mockClear();
  });

  // Garante que o nome do produto é exibido como título principal.
  it('deve renderizar o nome do produto como h1', () => {
    renderProductInfo();

    expect(
      screen.getByRole('heading', {
        name: 'Top Essential',
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  // Garante que o preço inicial vem da primeira variante.
  it('deve renderizar o preço da variante inicial', () => {
    renderProductInfo();

    expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
  });

  // Garante que a descrição recebida é exibida para o usuário.
  it('deve renderizar a descrição do produto', () => {
    renderProductInfo();

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
      renderProductInfo();

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
      renderProductInfo();

      expect(
        screen.getByRole('button', {
          name: `Selecionar cor ${color}`,
        }),
      ).toBeInTheDocument();
    },
  );

  // Garante que a primeira variante começa selecionada.
  it('deve iniciar com a primeira cor e o primeiro tamanho selecionados', () => {
    renderProductInfo();

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
    renderProductInfo();

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
    renderProductInfo();

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
    renderProductInfo();

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

  // Garante que a ação principal aparece habilitada.
  it('deve renderizar o botão Adicionar ao carrinho habilitado', () => {
    renderProductInfo();

    expect(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    ).toBeEnabled();
  });

  // Garante que a primeira variante é enviada corretamente para a store.
  it('deve adicionar a variante inicial ao carrinho', () => {
    renderProductInfo();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    );

    expect(addItemMock).toHaveBeenCalledTimes(1);

    expect(addItemMock).toHaveBeenCalledWith({
      productId: 1,
      productName: 'Top Essential',
      productSlug: 'top-essential',
      variant: VARIANTS[0],
    });
  });

  // Garante que a variante escolhida pelo usuário é enviada para a store.
  it('deve adicionar a variante selecionada ao carrinho', () => {
    renderProductInfo();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Selecionar tamanho M',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    );

    expect(addItemMock).toHaveBeenCalledWith({
      productId: 1,
      productName: 'Top Essential',
      productSlug: 'top-essential',
      variant: VARIANTS[1],
    });
  });
});