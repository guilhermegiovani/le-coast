import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  afterEach,
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

  // Garante que timers falsos não afetem os testes seguintes.
  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve renderizar o nome do produto como h1', () => {
    renderProductInfo();

    expect(
      screen.getByRole('heading', {
        name: 'Top Essential',
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar o preço da variante inicial', () => {
    renderProductInfo();

    expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
  });

  it('deve renderizar a descrição do produto', () => {
    renderProductInfo();

    expect(
      screen.getByText(
        'Top fitness com sustentação e tecido confortável.',
      ),
    ).toBeInTheDocument();
  });

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

  it('deve renderizar o botão Adicionar ao carrinho habilitado', () => {
    renderProductInfo();

    expect(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    ).toBeEnabled();
  });

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

  // Garante que o usuário recebe uma confirmação imediata da ação.
  it('deve exibir um feedback temporário ao adicionar ao carrinho', () => {
    vi.useFakeTimers();

    renderProductInfo();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    );

    expect(
      screen.getByRole('button', {
        name: 'Adicionado!',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent('Produto adicionado ao carrinho.');

    // Avança o tempo usado pelo setTimeout do componente.
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.queryByText('Produto adicionado ao carrinho.'),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Adicionar ao carrinho',
      }),
    ).toBeInTheDocument();
  });
});