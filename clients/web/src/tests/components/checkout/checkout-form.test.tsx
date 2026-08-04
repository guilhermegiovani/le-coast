import { fireEvent, render, screen } from '@testing-library/react';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  CheckoutForm,
  type CheckoutFormData,
} from '@/components/checkout/checkout-form';

const onChangeMock = vi.fn();
const onContinueMock = vi.fn();

const FORM_DATA: CheckoutFormData = {
  city: 'Ribeirão Preto',
  complement: 'Apartamento 12',
  email: 'guilherme@example.com',
  name: 'Guilherme Nobre',
  neighborhood: 'Centro',
  number: '123',
  phone: '16999999999',
  state: 'SP',
  street: 'Rua das Flores',
  zipCode: '14000-000',
};

function renderComponent(
  formData: CheckoutFormData = FORM_DATA,
) {
  render(
    <CheckoutForm
      formData={formData}
      onChange={onChangeMock}
      onContinue={onContinueMock}
    />,
  );
}

// Agrupa os testes das responsabilidades do componente CheckoutForm.
describe('CheckoutForm', () => {
  beforeEach(() => {
    onChangeMock.mockClear();
    onContinueMock.mockClear();
  });

  // Garante que o título da etapa de entrega é exibido.
  it('deve renderizar o título do formulário', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {
        name: 'Dados para entrega',
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  // Garante que todos os campos esperados são exibidos.
  it.each([
    'Nome completo',
    'E-mail',
    'Telefone',
    'CEP',
    'Estado',
    'Rua',
    'Número',
    'Complemento',
    'Bairro',
    'Cidade',
  ])('deve renderizar o campo %s', (label) => {
    renderComponent();

    expect(
      screen.getByRole('textbox', {
        name: label,
      }),
    ).toBeInTheDocument();
  });

  // Garante que os valores recebidos são exibidos nos campos.
  it('deve renderizar os dados recebidos', () => {
    renderComponent();

    expect(
      screen.getByRole('textbox', {
        name: 'Nome completo',
      }),
    ).toHaveValue('Guilherme Nobre');

    expect(
      screen.getByRole('textbox', {
        name: 'E-mail',
      }),
    ).toHaveValue('guilherme@example.com');

    expect(
      screen.getByRole('textbox', {
        name: 'Cidade',
      }),
    ).toHaveValue('Ribeirão Preto');
  });

  // Garante que a alteração de um campo é comunicada ao componente pai.
  it('deve chamar onChange ao alterar o nome', () => {
    renderComponent();

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Nome completo',
      }),
      {
        target: {
          value: 'Novo nome',
        },
      },
    );

    expect(onChangeMock).toHaveBeenCalledWith(
      'name',
      'Novo nome',
    );
  });

  // Garante que cada campo comunica sua chave correta.
  it.each([
    ['E-mail', 'email', 'novo@email.com'],
    ['Telefone', 'phone', '16111111111'],
    ['CEP', 'zipCode', '14010-000'],
    ['Rua', 'street', 'Avenida Brasil'],
    ['Número', 'number', '456'],
    ['Complemento', 'complement', 'Casa'],
    ['Bairro', 'neighborhood', 'Jardim Paulista'],
    ['Cidade', 'city', 'Sertãozinho'],
  ])(
    'deve chamar onChange para o campo %s',
    (label, field, value) => {
      renderComponent();

      fireEvent.change(
        screen.getByRole('textbox', {
          name: label,
        }),
        {
          target: {
            value,
          },
        },
      );

      expect(onChangeMock).toHaveBeenCalledWith(
        field,
        value,
      );
    },
  );

  // Garante que o estado é sempre enviado em letras maiúsculas.
  it('deve converter o estado para maiúsculas', () => {
    renderComponent();

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'Estado',
      }),
      {
        target: {
          value: 'sp',
        },
      },
    );

    expect(onChangeMock).toHaveBeenCalledWith(
      'state',
      'SP',
    );
  });

  // Garante que os campos necessários estão marcados como obrigatórios.
  it.each([
    'Nome completo',
    'E-mail',
    'Telefone',
    'CEP',
    'Estado',
    'Rua',
    'Número',
    'Bairro',
    'Cidade',
  ])('deve marcar o campo %s como obrigatório', (label) => {
    renderComponent();

    expect(
      screen.getByRole('textbox', {
        name: label,
      }),
    ).toBeRequired();
  });

  // Garante que complemento continua sendo opcional.
  it('não deve marcar o complemento como obrigatório', () => {
    renderComponent();

    expect(
      screen.getByRole('textbox', {
        name: 'Complemento',
      }),
    ).not.toBeRequired();
  });

  // Garante que o formulário avança quando todos os dados são válidos.
  it('deve chamar onContinue ao enviar o formulário válido', () => {
    renderComponent();

    fireEvent.submit(
      screen.getByRole('button', {
        name: 'Continuar para pagamento',
      }).closest('form')!,
    );

    expect(onContinueMock).toHaveBeenCalledTimes(1);
  });
});