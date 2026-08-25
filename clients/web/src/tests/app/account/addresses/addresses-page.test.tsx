import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import AddressesPage from '@/app/account/addresses/page';
import { useAuth } from '@/contexts/auth-context';
import {
    createAddress,
    deleteAddress,
    getAddresses,
    setDefaultAddress,
    updateAddress,
} from '@/services/address-service';

// Simula o estado global de autenticação.
// Assim conseguimos controlar quando a página
// deve ou não carregar os endereços.
vi.mock('@/contexts/auth-context', () => ({
    useAuth: vi.fn(),
}));

// Simula as operações HTTP de endereço para que
// os testes da página não dependam do backend real.
vi.mock('@/services/address-service', () => ({
    createAddress: vi.fn(),
    deleteAddress: vi.fn(),
    getAddresses: vi.fn(),
    setDefaultAddress: vi.fn(),
    updateAddress: vi.fn(),
}));

const useAuthMock = vi.mocked(useAuth);

const createAddressMock = vi.mocked(createAddress);
const deleteAddressMock = vi.mocked(deleteAddress);
const getAddressesMock = vi.mocked(getAddresses);
const setDefaultAddressMock = vi.mocked(
    setDefaultAddress,
);
const updateAddressMock = vi.mocked(updateAddress);

const ADDRESS = {
    city: 'Ribeirão Preto',
    complement: 'Apto 12',
    country: 'BR',
    createdAt: '2026-08-25T10:00:00.000Z',
    id: 1,
    isDefault: true,
    name: 'Casa',
    neighborhood: 'Centro',
    number: '100',
    state: 'SP',
    street: 'Rua Exemplo',
    updatedAt: '2026-08-25T10:00:00.000Z',
    userId: 3,
    zipCode: '14000-000',
};

const SECOND_ADDRESS = {
    ...ADDRESS,
    id: 2,
    isDefault: false,
    name: 'Trabalho',
    number: '200',
};

// Agrupa os testes das responsabilidades da página
// de gerenciamento de endereços.
describe('AddressesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Por padrão, os testes iniciam com a sessão
        // autenticada e já restaurada.
        useAuthMock.mockReturnValue({
            accessToken: 'access-token',
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            user: {
                email: 'guilherme@example.com',
                id: 3,
                name: 'Guilherme Nobre',
                role: 'CUSTOMER',
            },
        });
    });

    // Garante que a página aguarde a restauração da sessão
    // antes de acessar uma rota protegida da API.
    it('não deve buscar endereços enquanto a autenticação estiver carregando', () => {
        useAuthMock.mockReturnValue({
            accessToken: null,
            isAuthenticated: false,
            isLoading: true,
            login: vi.fn(),
            logout: vi.fn(),
            user: null,
        });

        render(<AddressesPage />);

        expect(
            getAddressesMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que usuários autenticados tenham
    // seus endereços carregados ao abrir a página.
    it('deve carregar e exibir os endereços do usuário', async () => {
        getAddressesMock.mockResolvedValue([
            ADDRESS,
            SECOND_ADDRESS,
        ]);

        render(<AddressesPage />);

        expect(
            screen.getByText('Carregando endereços...'),
        ).toBeInTheDocument();

        expect(
            await screen.findByText('Casa'),
        ).toBeInTheDocument();

        expect(
            screen.getByText('Trabalho'),
        ).toBeInTheDocument();

        expect(
            getAddressesMock,
        ).toHaveBeenCalledTimes(1);
    });

    // Garante que a ausência de endereços seja tratada
    // como um estado válido e não como erro.
    it('deve exibir estado vazio quando não houver endereços', async () => {
        getAddressesMock.mockResolvedValue([]);

        render(<AddressesPage />);

        expect(
            await screen.findByText(
                'Você ainda não possui endereços cadastrados.',
            ),
        ).toBeInTheDocument();
    });

    // Garante que falhas durante a listagem recebam
    // uma mensagem amigável para o usuário.
    it('deve exibir erro quando não for possível carregar os endereços', async () => {
        getAddressesMock.mockRejectedValue(
            new Error('Falha na API'),
        );

        render(<AddressesPage />);

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent(
            'Não foi possível carregar seus endereços.',
        );
    });

    // Garante que o formulário de cadastro possa
    // ser aberto e fechado pelo usuário.
    it('deve abrir e cancelar o formulário de novo endereço', async () => {
        const user = userEvent.setup();

        getAddressesMock.mockResolvedValue([]);

        render(<AddressesPage />);

        await screen.findByText(
            'Você ainda não possui endereços cadastrados.',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Adicionar endereço',
            }),
        );

        expect(
            screen.getByRole('heading', {
                name: 'Novo endereço',
            }),
        ).toBeInTheDocument();

        await user.click(
            screen.getByRole('button', {
                name: 'Cancelar',
            }),
        );

        expect(
            screen.queryByRole('heading', {
                name: 'Novo endereço',
            }),
        ).not.toBeInTheDocument();
    });

    // Garante que a criação de um endereço atualize
    // a listagem com o estado retornado pela API.
    it('deve criar um endereço e recarregar a lista', async () => {
        const user = userEvent.setup();

        getAddressesMock
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([ADDRESS]);

        createAddressMock.mockResolvedValue(ADDRESS);

        render(<AddressesPage />);

        await screen.findByText(
            'Você ainda não possui endereços cadastrados.',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Adicionar endereço',
            }),
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

        await waitFor(() => {
            expect(createAddressMock).toHaveBeenCalledWith({
                city: 'Ribeirão Preto',
                name: 'Casa',
                neighborhood: 'Centro',
                number: '100',
                state: 'SP',
                street: 'Rua Exemplo',
                zipCode: '14000-000',
            });
        });

        expect(
            getAddressesMock,
        ).toHaveBeenCalledTimes(2);

        expect(
            await screen.findByText('Casa'),
        ).toBeInTheDocument();
    });

    // Garante que o usuário consiga selecionar
    // outro endereço como padrão.
    it('deve definir um endereço como padrão e recarregar a lista', async () => {
        const user = userEvent.setup();

        getAddressesMock
            .mockResolvedValueOnce([
                ADDRESS,
                SECOND_ADDRESS,
            ])
            .mockResolvedValueOnce([
                {
                    ...SECOND_ADDRESS,
                    isDefault: true,
                },
                {
                    ...ADDRESS,
                    isDefault: false,
                },
            ]);

        setDefaultAddressMock.mockResolvedValue({
            ...SECOND_ADDRESS,
            isDefault: true,
        });

        render(<AddressesPage />);

        await screen.findByText('Trabalho');

        await user.click(
            screen.getByRole('button', {
                name: 'Definir como padrão',
            }),
        );

        await waitFor(() => {
            expect(
                setDefaultAddressMock,
            ).toHaveBeenCalledWith(2);
        });

        expect(
            getAddressesMock,
        ).toHaveBeenCalledTimes(2);
    });

    // Garante que a exclusão solicitada pelo card
    // remova o endereço e atualize a lista.
    it('deve excluir um endereço e recarregar a lista', async () => {
        const user = userEvent.setup();

        vi.spyOn(
            window,
            'confirm',
        ).mockReturnValue(true);

        getAddressesMock
            .mockResolvedValueOnce([
                ADDRESS,
                SECOND_ADDRESS,
            ])
            .mockResolvedValueOnce([ADDRESS]);

        deleteAddressMock.mockResolvedValue(undefined);

        render(<AddressesPage />);

        await screen.findByText('Trabalho');

        const deleteButtons =
            screen.getAllByRole('button', {
                name: 'Excluir',
            });

        await user.click(deleteButtons[1]!);

        await waitFor(() => {
            expect(
                deleteAddressMock,
            ).toHaveBeenCalledWith(2);
        });

        expect(
            getAddressesMock,
        ).toHaveBeenCalledTimes(2);

        vi.restoreAllMocks();
    });

    // Garante que a edição seja iniciada com
    // os valores atuais do endereço selecionado.
    it('deve abrir o formulário preenchido ao editar um endereço', async () => {
        const user = userEvent.setup();

        getAddressesMock.mockResolvedValue([
            ADDRESS,
        ]);

        render(<AddressesPage />);

        await screen.findByText('Casa');

        await user.click(
            screen.getByRole('button', {
                name: 'Editar',
            }),
        );

        expect(
            screen.getByRole('heading', {
                name: 'Editar endereço',
            }),
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText('Nome do endereço'),
        ).toHaveValue('Casa');

        expect(
            screen.getByLabelText('Rua'),
        ).toHaveValue('Rua Exemplo');
    });

    // Garante que a alteração do endereço seja enviada
    // e a listagem seja atualizada após o sucesso.
    it('deve atualizar um endereço editado', async () => {
        const user = userEvent.setup();

        getAddressesMock
            .mockResolvedValueOnce([ADDRESS])
            .mockResolvedValueOnce([
                {
                    ...ADDRESS,
                    name: 'Casa nova',
                },
            ]);

        updateAddressMock.mockResolvedValue({
            ...ADDRESS,
            name: 'Casa nova',
        });

        render(<AddressesPage />);

        await screen.findByText('Casa');

        await user.click(
            screen.getByRole('button', {
                name: 'Editar',
            }),
        );

        const nameInput =
            screen.getByLabelText('Nome do endereço');

        await user.clear(nameInput);
        await user.type(
            nameInput,
            'Casa nova',
        );

        await user.click(
            screen.getByRole('button', {
                name: 'Salvar endereço',
            }),
        );

        await waitFor(() => {
            expect(
                updateAddressMock,
            ).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    name: 'Casa nova',
                }),
            );
        });

        expect(
            await screen.findByText('Casa nova'),
        ).toBeInTheDocument();
    });
});