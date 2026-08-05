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

import {
  CheckoutForm,
  type CheckoutFormData,
} from '@/components/checkout/checkout-form';

// Cria o mock e a classe antes do carregamento dos módulos.
const {
  getAddressByZipCodeMock,
  ZipCodeNotFoundErrorMock,
} = vi.hoisted(() => {
  class ZipCodeNotFoundErrorMock extends Error {
    constructor() {
      super('CEP não encontrado.');
      this.name = 'ZipCodeNotFoundError';
    }
  }

  return {
    getAddressByZipCodeMock: vi.fn(),
    ZipCodeNotFoundErrorMock,
  };
});

// Simula o serviço externo sem realizar chamadas reais ao ViaCEP.
vi.mock('@/services/zip-code-service', () => ({
  getAddressByZipCode: getAddressByZipCodeMock,
  ZipCodeNotFoundError: ZipCodeNotFoundErrorMock,
}));

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

const EMPTY_FORM_DATA: CheckoutFormData = {
  city: '',
  complement: '',
  email: '',
  name: '',
  neighborhood: '',
  number: '',
  phone: '',
  state: '',
  street: '',
  zipCode: '',
};

const ZIP_CODE_ADDRESS = {
  city: 'Ribeirão Preto',
  neighborhood: 'Centro',
  state: 'SP',
  street: 'Rua das Flores',
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
    getAddressByZipCodeMock.mockReset();

    getAddressByZipCodeMock.mockResolvedValue(
      ZIP_CODE_ADDRESS,
    );
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

  // Garante que o formulário avança quando todos os dados forem válidos.
  it('deve chamar onContinue ao enviar o formulário válido', () => {
    renderComponent();

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: 'Continuar para pagamento',
        })
        .closest('form')!,
    );

    expect(onContinueMock).toHaveBeenCalledTimes(1);
  });

  // Garante que o CEP é formatado antes de ser enviado ao componente pai.
  it('deve formatar o CEP ao alterar o campo', () => {
    renderComponent();

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'CEP',
      }),
      {
        target: {
          value: '1401012',
        },
      },
    );

    expect(onChangeMock).toHaveBeenCalledWith(
      'zipCode',
      '14010-12',
    );
  });

  // Garante que CEP incompleto não dispara uma consulta.
  it('não deve consultar o endereço enquanto o CEP estiver incompleto', () => {
    renderComponent();

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'CEP',
      }),
      {
        target: {
          value: '1401012',
        },
      },
    );

    expect(
      getAddressByZipCodeMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que a consulta é feita quando o CEP possui oito dígitos.
  it('deve consultar o endereço quando o CEP estiver completo', async () => {
    renderComponent();

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

    expect(onChangeMock).toHaveBeenCalledWith(
      'zipCode',
      '14010-120',
    );

    await waitFor(() => {
      expect(
        getAddressByZipCodeMock,
      ).toHaveBeenCalledWith('14010-120');
    });
  });

  // Garante que o endereço retornado é enviado ao componente pai.
  it('deve preencher os campos com o endereço encontrado', async () => {
    renderComponent();

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
      expect(onChangeMock).toHaveBeenCalledWith(
        'street',
        'Rua das Flores',
      );

      expect(onChangeMock).toHaveBeenCalledWith(
        'neighborhood',
        'Centro',
      );

      expect(onChangeMock).toHaveBeenCalledWith(
        'city',
        'Ribeirão Preto',
      );

      expect(onChangeMock).toHaveBeenCalledWith(
        'state',
        'SP',
      );
    });
  });

  // Garante que o usuário recebe feedback durante a consulta.
  it('deve exibir carregamento durante a consulta do CEP', async () => {
    let resolveRequest: (
      address: typeof ZIP_CODE_ADDRESS,
    ) => void;

    getAddressByZipCodeMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    renderComponent();

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

    expect(
      await screen.findByText('Consultando CEP...'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Continuar para pagamento',
      }),
    ).toBeDisabled();

    resolveRequest!(ZIP_CODE_ADDRESS);

    await waitFor(() => {
      expect(
        screen.queryByText('Consultando CEP...'),
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', {
        name: 'Continuar para pagamento',
      }),
    ).toBeEnabled();
  });

  // Garante que CEP inexistente apresenta uma mensagem específica.
  it('deve exibir erro quando o CEP não for encontrado', async () => {
    getAddressByZipCodeMock.mockRejectedValue(
      new ZipCodeNotFoundErrorMock(),
    );

    renderComponent();

    fireEvent.change(
      screen.getByRole('textbox', {
        name: 'CEP',
      }),
      {
        target: {
          value: '99999999',
        },
      },
    );

    expect(
      await screen.findByText('CEP não encontrado.'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', {
        name: 'CEP',
      }),
    ).toHaveAttribute('aria-invalid', 'true');
  });

  // Garante que falhas inesperadas apresentam uma mensagem genérica.
  it('deve exibir erro quando a consulta do CEP falhar', async () => {
    getAddressByZipCodeMock.mockRejectedValue(
      new Error('Falha de conexão'),
    );

    renderComponent();

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

    expect(
      await screen.findByText(
        'Não foi possível consultar o CEP. Tente novamente.',
      ),
    ).toBeInTheDocument();
  });

  // Garante que um novo valor limpa o erro anterior.
  it('deve limpar o erro ao alterar novamente o CEP', async () => {
    getAddressByZipCodeMock.mockRejectedValueOnce(
      new ZipCodeNotFoundErrorMock(),
    );

    renderComponent();

    const zipCodeInput = screen.getByRole('textbox', {
      name: 'CEP',
    });

    fireEvent.change(zipCodeInput, {
      target: {
        value: '99999999',
      },
    });

    expect(
      await screen.findByText('CEP não encontrado.'),
    ).toBeInTheDocument();

    fireEvent.change(zipCodeInput, {
      target: {
        value: '14010',
      },
    });

    expect(
      screen.queryByText('CEP não encontrado.'),
    ).not.toBeInTheDocument();
  });

  // Garante que o telefone é formatado antes de ser enviado ao componente pai.
  it('deve formatar o telefone ao alterar o campo', () => {
    renderComponent();

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

    expect(onChangeMock).toHaveBeenCalledWith(
      'phone',
      '(16) 99999-8888',
    );
  });

  // Garante que dados inválidos impedem o avanço para o pagamento.
  it('não deve chamar onContinue quando o formulário for inválido', () => {
    renderComponent(EMPTY_FORM_DATA);

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: 'Continuar para pagamento',
        })
        .closest('form')!,
    );

    expect(onContinueMock).not.toHaveBeenCalled();
  });

  // Garante que as mensagens de validação são exibidas nos respectivos campos.
  it('deve exibir os erros dos campos inválidos', () => {
    renderComponent(EMPTY_FORM_DATA);

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: 'Continuar para pagamento',
        })
        .closest('form')!,
    );

    expect(
      screen.getByText('Informe seu nome completo.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Informe seu e-mail.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Informe um telefone válido.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Informe um CEP válido.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Informe a sigla do estado.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Informe a rua.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Informe o número.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Informe o bairro.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Informe a cidade.'),
    ).toBeInTheDocument();
  });

  // Garante que os campos inválidos são identificados para tecnologias assistivas.
  it('deve marcar os campos inválidos com aria-invalid', () => {
    renderComponent(EMPTY_FORM_DATA);

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: 'Continuar para pagamento',
        })
        .closest('form')!,
    );

    expect(
      screen.getByRole('textbox', {
        name: 'Nome completo',
      }),
    ).toHaveAttribute('aria-invalid', 'true');

    expect(
      screen.getByRole('textbox', {
        name: 'E-mail',
      }),
    ).toHaveAttribute('aria-invalid', 'true');

    expect(
      screen.getByRole('textbox', {
        name: 'Telefone',
      }),
    ).toHaveAttribute('aria-invalid', 'true');

    expect(
      screen.getByRole('textbox', {
        name: 'CEP',
      }),
    ).toHaveAttribute('aria-invalid', 'true');
  });

  // Garante que alterar um campo remove somente o erro correspondente.
  it('deve limpar o erro do campo quando ele for alterado', () => {
    renderComponent(EMPTY_FORM_DATA);

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: 'Continuar para pagamento',
        })
        .closest('form')!,
    );

    expect(
      screen.getByText('Informe seu nome completo.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Informe seu e-mail.'),
    ).toBeInTheDocument();

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

    expect(
      screen.queryByText('Informe seu nome completo.'),
    ).not.toBeInTheDocument();

    // O erro de outro campo deve continuar visível.
    expect(
      screen.getByText('Informe seu e-mail.'),
    ).toBeInTheDocument();

    expect(onChangeMock).toHaveBeenCalledWith(
      'name',
      'Guilherme Nobre',
    );
  });

  // Garante que o preenchimento pelo ViaCEP remove os erros do endereço.
  it('deve limpar os erros de endereço após encontrar o CEP', async () => {
    renderComponent({
      ...FORM_DATA,
      city: '',
      neighborhood: '',
      state: '',
      street: '',
      zipCode: '',
    });

    fireEvent.submit(
      screen
        .getByRole('button', {
          name: 'Continuar para pagamento',
        })
        .closest('form')!,
    );

    expect(screen.getByText('Informe a rua.')).toBeInTheDocument();
    expect(screen.getByText('Informe o bairro.')).toBeInTheDocument();
    expect(screen.getByText('Informe a cidade.')).toBeInTheDocument();

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
      expect(
        screen.queryByText('Informe a rua.'),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText('Informe o bairro.'),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText('Informe a cidade.'),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText('Informe a sigla do estado.'),
      ).not.toBeInTheDocument();
    });
  });
});