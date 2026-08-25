import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AddressCard } from '@/components/account/addresses/address-card';

const ADDRESS = {
  id: 1,
  userId: 3,
  name: 'Casa',
  street: 'Rua Exemplo',
  number: '100',
  complement: 'Apto 12',
  neighborhood: 'Centro',
  city: 'Ribeirão Preto',
  state: 'SP',
  zipCode: '14000-000',
  country: 'BR',
  isDefault: false,
  createdAt: '2026-08-25T10:00:00.000Z',
  updatedAt: '2026-08-25T10:00:00.000Z',
};

// Garante que o card apresente corretamente
// as informações do endereço recebido.
describe('AddressCard', () => {
  it('deve renderizar os dados do endereço', () => {
    render(
      <AddressCard address={ADDRESS} />,
    );

    expect(
      screen.getByText('Casa'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Rua Exemplo, 100'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Apto 12'),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Ribeirão Preto/),
    ).toBeInTheDocument();

    expect(
      screen.getByText('CEP: 14000-000'),
    ).toBeInTheDocument();
  });

  // Garante que o indicador visual seja exibido
  // somente quando o endereço for o padrão.
  it('deve indicar quando o endereço for padrão', () => {
    render(
      <AddressCard
        address={{
          ...ADDRESS,
          isDefault: true,
        }}
      />,
    );

    expect(
      screen.getByText('Padrão'),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Definir como padrão',
      }),
    ).not.toBeInTheDocument();
  });

  // Garante que a ação de edição informe
  // qual endereço foi selecionado.
  it('deve solicitar a edição do endereço', () => {
    const onEdit = vi.fn();

    render(
      <AddressCard
        address={ADDRESS}
        onEdit={onEdit}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Editar',
      }),
    );

    expect(onEdit).toHaveBeenCalledWith(
      ADDRESS,
    );
  });

  // Garante que um endereço não padrão
  // possa ser selecionado como novo padrão.
  it('deve solicitar a definição do endereço como padrão', () => {
    const onSetDefault = vi.fn();

    render(
      <AddressCard
        address={ADDRESS}
        onSetDefault={onSetDefault}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Definir como padrão',
      }),
    );

    expect(
      onSetDefault,
    ).toHaveBeenCalledWith(1);
  });

  // Garante que a exclusão só seja executada
  // depois da confirmação do usuário.
  it('deve excluir o endereço quando a exclusão for confirmada', () => {
    const onDelete = vi.fn();

    vi.spyOn(window, 'confirm')
      .mockReturnValueOnce(true);

    render(
      <AddressCard
        address={ADDRESS}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Excluir',
      }),
    );

    expect(window.confirm).toHaveBeenCalled();

    expect(onDelete).toHaveBeenCalledWith(1);

    vi.restoreAllMocks();
  });

  // Garante que cancelar a confirmação
  // não exclua o endereço.
  it('não deve excluir o endereço quando a confirmação for cancelada', () => {
    const onDelete = vi.fn();

    vi.spyOn(window, 'confirm')
      .mockReturnValueOnce(false);

    render(
      <AddressCard
        address={ADDRESS}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Excluir',
      }),
    );

    expect(onDelete).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});