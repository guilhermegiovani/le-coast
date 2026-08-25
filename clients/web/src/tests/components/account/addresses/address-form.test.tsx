import {
    render,
    screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { AddressForm } from '@/components/account/addresses/address-form';

describe('AddressForm', () => {
    // Garante que todos os campos necessários
    // para cadastrar um endereço sejam exibidos.
    it('deve renderizar os campos do formulário', () => {
        render(
            <AddressForm
                onSubmit={vi.fn()}
            />,
        );

        expect(
            screen.getByLabelText('Nome do endereço'),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('CEP'),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Rua'),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Número'),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Complemento'),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Bairro'),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Cidade'),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Estado'),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', {
                name: 'Salvar endereço',
            }),
        ).toBeInTheDocument();
    });

    // Garante que os dados preenchidos sejam enviados
    // corretamente para o componente responsável.
    it('deve enviar os dados preenchidos', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <AddressForm
                onSubmit={onSubmit}
            />,
        );

        await user.type(
            screen.getByLabelText('Nome do endereço'),
            'Casa',
        );

        await user.type(
            screen.getByLabelText('CEP'),
            '14000-000',
        );

        await user.type(
            screen.getByLabelText('Rua'),
            'Rua Exemplo',
        );

        await user.type(
            screen.getByLabelText('Número'),
            '100',
        );

        await user.type(
            screen.getByLabelText('Complemento'),
            'Apto 12',
        );

        await user.type(
            screen.getByLabelText('Bairro'),
            'Centro',
        );

        await user.type(
            screen.getByLabelText('Cidade'),
            'Ribeirão Preto',
        );

        await user.type(
            screen.getByLabelText('Estado'),
            'SP',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Salvar endereço',
            }),
        );

        expect(onSubmit).toHaveBeenCalledWith({
            city: 'Ribeirão Preto',
            complement: 'Apto 12',
            name: 'Casa',
            neighborhood: 'Centro',
            number: '100',
            state: 'SP',
            street: 'Rua Exemplo',
            zipCode: '14000-000',
        });
    });

    // Garante que o campo opcional de complemento
    // seja omitido quando não for preenchido.
    it('não deve enviar complemento quando estiver vazio', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <AddressForm
                onSubmit={onSubmit}
            />,
        );

        await user.type(
            screen.getByLabelText('Nome do endereço'),
            'Casa',
        );

        await user.type(
            screen.getByLabelText('CEP'),
            '14000-000',
        );

        await user.type(
            screen.getByLabelText('Rua'),
            'Rua Exemplo',
        );

        await user.type(
            screen.getByLabelText('Número'),
            '100',
        );

        await user.type(
            screen.getByLabelText('Bairro'),
            'Centro',
        );

        await user.type(
            screen.getByLabelText('Cidade'),
            'Ribeirão Preto',
        );

        await user.type(
            screen.getByLabelText('Estado'),
            'SP',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Salvar endereço',
            }),
        );

        expect(onSubmit).toHaveBeenCalledWith(
            expect.not.objectContaining({
                complement: expect.anything(),
            }),
        );
    });

    // Garante que os dados atuais do endereço
    // preencham o formulário durante a edição.
    it('deve preencher os campos com os valores iniciais', () => {
        render(
            <AddressForm
                initialValues={{
                    city: 'Ribeirão Preto',
                    complement: 'Apto 12',
                    name: 'Casa',
                    neighborhood: 'Centro',
                    number: '100',
                    state: 'SP',
                    street: 'Rua Exemplo',
                    zipCode: '14000-000',
                }}
                onSubmit={vi.fn()}
            />,
        );

        expect(
            screen.getByLabelText('Nome do endereço'),
        ).toHaveValue('Casa');

        expect(
            screen.getByLabelText('CEP'),
        ).toHaveValue('14000-000');

        expect(
            screen.getByLabelText('Rua'),
        ).toHaveValue('Rua Exemplo');

        expect(
            screen.getByLabelText('Número'),
        ).toHaveValue('100');

        expect(
            screen.getByLabelText('Complemento'),
        ).toHaveValue('Apto 12');

        expect(
            screen.getByLabelText('Bairro'),
        ).toHaveValue('Centro');

        expect(
            screen.getByLabelText('Cidade'),
        ).toHaveValue('Ribeirão Preto');

        expect(
            screen.getByLabelText('Estado'),
        ).toHaveValue('SP');
    });

    // Garante que o usuário receba feedback enquanto
    // o endereço estiver sendo salvo.
    it('deve exibir estado de carregamento', () => {
        render(
            <AddressForm
                isLoading
                onSubmit={vi.fn()}
            />,
        );

        expect(
            screen.getByRole('button', {
                name: 'Salvando...',
            }),
        ).toBeDisabled();
    });
});