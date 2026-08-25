import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { api } from '@/lib/api';
import {
    createAddress,
    deleteAddress,
    getAddresses,
    setDefaultAddress,
    updateAddress,
} from '@/services/address-service';

// Simula a instância HTTP para que os testes do service
// não realizem requisições reais ao backend.
vi.mock('@/lib/api', () => ({
    api: {
        delete: vi.fn(),
        get: vi.fn(),
        patch: vi.fn(),
        post: vi.fn(),
    },
}));

const apiDeleteMock = vi.mocked(api.delete);
const apiGetMock = vi.mocked(api.get);
const apiPatchMock = vi.mocked(api.patch);
const apiPostMock = vi.mocked(api.post);

const ADDRESS = {
    city: 'Ribeirão Preto',
    complement: null,
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

describe('address-service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que a listagem utilize o endpoint
    // protegido responsável pelos endereços do usuário.
    it('deve buscar os endereços do usuário', async () => {
        apiGetMock.mockResolvedValue({
            data: [ADDRESS],
        });

        const result = await getAddresses();

        expect(apiGetMock).toHaveBeenCalledWith(
            '/addresses',
        );

        expect(result).toEqual([ADDRESS]);
    });

    // Garante que os dados de um novo endereço
    // sejam enviados corretamente para a API.
    it('deve criar um endereço', async () => {
        const input = {
            city: 'Ribeirão Preto',
            name: 'Casa',
            neighborhood: 'Centro',
            number: '100',
            state: 'SP',
            street: 'Rua Exemplo',
            zipCode: '14000-000',
        };

        apiPostMock.mockResolvedValue({
            data: ADDRESS,
        });

        const result = await createAddress(input);

        expect(apiPostMock).toHaveBeenCalledWith(
            '/addresses',
            input,
        );

        expect(result).toEqual(ADDRESS);
    });

    // Garante que uma atualização seja enviada
    // para o endereço identificado pelo seu id.
    it('deve atualizar um endereço', async () => {
        const input = {
            name: 'Trabalho',
        };

        const updatedAddress = {
            ...ADDRESS,
            name: 'Trabalho',
        };

        apiPatchMock.mockResolvedValue({
            data: updatedAddress,
        });

        const result = await updateAddress(
            1,
            input,
        );

        expect(apiPatchMock).toHaveBeenCalledWith(
            '/addresses/1',
            input,
        );

        expect(result).toEqual(updatedAddress);
    });

    // Garante que a definição do endereço padrão
    // utilize o endpoint específico dessa regra.
    it('deve definir um endereço como padrão', async () => {
        apiPatchMock.mockResolvedValue({
            data: ADDRESS,
        });

        const result = await setDefaultAddress(1);

        expect(apiPatchMock).toHaveBeenCalledWith(
            '/addresses/1/default',
        );

        expect(result).toEqual(ADDRESS);
    });

    // Garante que a exclusão utilize o id correto
    // e não dependa de um corpo na resposta.
    it('deve excluir um endereço', async () => {
        apiDeleteMock.mockResolvedValue({
            data: undefined,
        });

        await deleteAddress(1);

        expect(apiDeleteMock).toHaveBeenCalledWith(
            '/addresses/1',
        );
    });
});