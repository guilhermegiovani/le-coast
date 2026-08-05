import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { CheckoutContent } from '@/components/checkout/checkout-content';

const {
  getAddressByZipCodeMock,
  useCartStoreMock,
} = vi.hoisted(() => ({
  getAddressByZipCodeMock: vi.fn(),
  useCartStoreMock: vi.fn(),
}));

vi.mock('@/stores/cart-store', () => ({
  useCartStore: (
    selector: (state: {
      items: unknown[];
    }) => unknown,
  ) => useCartStoreMock(selector),
}));

vi.mock('@/services/zip-code-service', () => ({
  getAddressByZipCode: getAddressByZipCodeMock,
  ZipCodeNotFoundError: class ZipCodeNotFoundError extends Error {},
}));

const CART_ITEMS = [
  {
    productId: 1,
    productName: 'Top Essential',
    productSlug: 'top-essential',
    quantity: 1,
    variant: {
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
      sku: 'TOP',
      stock: 8,
    },
  },
];

function renderComponent() {
  render(<CheckoutContent />);
}

// Preenche todos os dados obrigatórios da etapa de entrega.
async function fillDeliveryForm() {
  fireEvent.change(
    screen.getByRole('textbox', {
      name: 'Nome completo',
    }),
    {
      target: {
        value: 'Guilherme Nobre',
      },
    },
  );

  fireEvent.change(
    screen.getByRole('textbox', {
      name: 'E-mail',
    }),
    {
      target: {
        value: 'guilherme@example.com',
      },
    },
  );

  fireEvent.change(
    screen.getByRole('textbox', {
      name: 'Telefone',
    }),
    {
      target: {
        value: '16999998888',
      },
    },
  );

  fireEvent.change(
    screen.getByRole('textbox', {
      name: 'CEP',
    }),
    {
      target: {
        value: '14010120',
      },
    },
  );

  await waitFor(() => {
    expect(getAddressByZipCodeMock).toHaveBeenCalledWith(
      '14010-120',
    );
  });

  fireEvent.change(
    screen.getByRole('textbox', {
      name: 'Número',
    }),
    {
      target: {
        value: '123',
      },
    },
  );
}

async function goToPayment() {
  await fillDeliveryForm();

  fireEvent.submit(
    screen
      .getByRole('button', {
        name: 'Continuar para pagamento',
      })
      .closest('form')!,
  );
}

async function goToReview() {
  await goToPayment();

  fireEvent.click(
    screen.getByRole('radio', {
      name: /pix/i,
    }),
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Revisar pedido',
    }),
  );
}

// Agrupa os testes do fluxo completo do checkout.
describe('CheckoutContent', () => {
  beforeEach(() => {
    getAddressByZipCodeMock.mockReset();

    getAddressByZipCodeMock.mockResolvedValue({
      city: 'Ribeirão Preto',
      neighborhood: 'Centro',
      state: 'SP',
      street: 'Rua das Flores',
    });

    useCartStoreMock.mockImplementation((selector) =>
      selector({
        items: CART_ITEMS,
      }),
    );
  });

  // Garante que o fluxo começa pela etapa de entrega.
  it('deve iniciar na etapa de entrega', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {
        name: 'Dados para entrega',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Garante que um formulário vazio não permite avançar.
  it('não deve avançar para pagamento com dados inválidos', () => {
    renderComponent();

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: 'Continuar para pagamento',
        })
        .closest('form')!,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Dados para entrega',
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', {
        name: 'Pagamento',
        level: 2,
      }),
    ).not.toBeInTheDocument();
  });

  // Garante que dados válidos permitem avançar para pagamento.
  it('deve avançar para pagamento', async () => {
    renderComponent();

    await goToPayment();

    expect(
      screen.getByRole('heading', {
        name: 'Pagamento',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Garante que o usuário consegue chegar à revisão.
  it('deve avançar até a revisão', async () => {
    renderComponent();

    await goToReview();

    expect(
      screen.getByRole('heading', {
        name: 'Revisão do pedido',
        level: 2,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Guilherme Nobre'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Rua das Flores, 123'),
    ).toBeInTheDocument();

    expect(screen.getByText('PIX')).toBeInTheDocument();
  });

  // Garante que o usuário consegue retornar à etapa de pagamento.
  it('deve voltar da revisão para pagamento', async () => {
    renderComponent();

    await goToReview();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Voltar para pagamento',
      }),
    );

    expect(
      screen.getByRole('heading', {
        name: 'Pagamento',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Garante que os dados permanecem preenchidos ao retornar à entrega.
  it('deve manter os dados ao voltar para entrega', async () => {
    renderComponent();

    await goToPayment();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Voltar para entrega',
      }),
    );

    expect(
      screen.getByRole('textbox', {
        name: 'Nome completo',
      }),
    ).toHaveValue('Guilherme Nobre');

    expect(
      screen.getByRole('textbox', {
        name: 'Telefone',
      }),
    ).toHaveValue('(16) 99999-8888');

    expect(
      screen.getByRole('textbox', {
        name: 'CEP',
      }),
    ).toHaveValue('14010-120');

    expect(
      screen.getByRole('textbox', {
        name: 'Rua',
      }),
    ).toHaveValue('Rua das Flores');
  });
});