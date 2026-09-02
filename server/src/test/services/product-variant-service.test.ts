import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {
    createProductVariantRepository,
    findProductVariantByCombinationRepository,
    findProductVariantByIdRepository,
    findProductVariantBySkuRepository,
    findProductVariantsByProductIdRepository,
    updateProductVariantRepository,
} from '../../repositories/product-variant-repository.js';

import {
    findProductByIdRepository,
} from '../../repositories/product-repository.js';

import {
    findSizeByIdRepository,
} from '../../repositories/size-repository.js';

import {
    findColorByIdRepository,
} from '../../repositories/color-repository.js';

import {
    createProductVariant,
    getProductVariantById,
    listProductVariantsByProductId,
    updateProductVariant,
} from '../../services/product-variant-service.js';

// Simula os repositories para que os testes do service
// não utilizem o banco real.
vi.mock(
    '../../repositories/product-variant-repository.js',
    () => ({
        createProductVariantRepository: vi.fn(),
        findProductVariantByCombinationRepository: vi.fn(),
        findProductVariantByIdRepository: vi.fn(),
        findProductVariantBySkuRepository: vi.fn(),
        findProductVariantsByProductIdRepository: vi.fn(),
        updateProductVariantRepository: vi.fn(),
    }),
);

vi.mock('../../repositories/product-repository.js', () => ({
    findProductByIdRepository: vi.fn(),
}));

vi.mock('../../repositories/size-repository.js', () => ({
    findSizeByIdRepository: vi.fn(),
}));

vi.mock('../../repositories/color-repository.js', () => ({
    findColorByIdRepository: vi.fn(),
}));

const createProductVariantRepositoryMock = vi.mocked(
    createProductVariantRepository,
);

const findProductVariantByCombinationRepositoryMock =
    vi.mocked(
        findProductVariantByCombinationRepository,
    );

const findProductVariantByIdRepositoryMock = vi.mocked(
    findProductVariantByIdRepository,
);

const findProductVariantBySkuRepositoryMock = vi.mocked(
    findProductVariantBySkuRepository,
);

const findProductVariantsByProductIdRepositoryMock =
    vi.mocked(
        findProductVariantsByProductIdRepository,
    );

const updateProductVariantRepositoryMock = vi.mocked(
    updateProductVariantRepository,
);

const findProductByIdRepositoryMock = vi.mocked(
    findProductByIdRepository,
);

const findSizeByIdRepositoryMock = vi.mocked(
    findSizeByIdRepository,
);

const findColorByIdRepositoryMock = vi.mocked(
    findColorByIdRepository,
);

const MOCK_PRODUCT = {
    id: 1,
    categoryId: 1,
    name: 'Top Essential',
    slug: 'top-essential',
    description: 'Top fitness feminino.',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const MOCK_SIZE = {
    id: 1,
    name: 'M',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const MOCK_COLOR = {
    id: 1,
    name: 'Preto',
    hexCode: '#000000',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const VALID_VARIANT_INPUT = {
    productId: 1,
    sizeId: 1,
    colorId: 1,
    sku: 'TOP-ESS-M-PRETO',
    price: 79.9,
    stock: 10,
};

const MOCK_VARIANT = {
    id: 1,
    productId: 1,
    sizeId: 1,
    colorId: 1,
    sku: 'TOP-ESS-M-PRETO',
    price: 79.9 as never,
    stock: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    product: MOCK_PRODUCT,
    size: MOCK_SIZE,
    color: MOCK_COLOR,
};

describe('createProductVariant', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findProductByIdRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT as never,
        );

        findSizeByIdRepositoryMock.mockResolvedValue(
            MOCK_SIZE,
        );

        findColorByIdRepositoryMock.mockResolvedValue(
            MOCK_COLOR,
        );

        findProductVariantBySkuRepositoryMock.mockResolvedValue(
            null,
        );

        findProductVariantByCombinationRepositoryMock.mockResolvedValue(
            null,
        );
    });

    // Garante que uma variante válida passe por todas
    // as validações antes de chegar ao repository.
    it('deve criar uma variante válida', async () => {
        createProductVariantRepositoryMock.mockResolvedValue(
            MOCK_VARIANT as never,
        );

        const result = await createProductVariant(
            VALID_VARIANT_INPUT,
        );

        expect(
            createProductVariantRepositoryMock,
        ).toHaveBeenCalledWith(
            VALID_VARIANT_INPUT,
        );

        expect(result).toEqual(MOCK_VARIANT);
    });

    // Garante que um produto inexistente impeça
    // a criação da variante.
    it('não deve criar variante com produto inexistente', async () => {
        findProductByIdRepositoryMock.mockResolvedValue(
            null,
        );

        await expect(
            createProductVariant(VALID_VARIANT_INPUT),
        ).rejects.toMatchObject({
            message: 'Produto não encontrado.',
            statusCode: 404,
        });

        expect(
            createProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que um tamanho inexistente impeça
    // a criação da variante.
    it('não deve criar variante com tamanho inexistente', async () => {
        findSizeByIdRepositoryMock.mockResolvedValue(
            null,
        );

        await expect(
            createProductVariant(VALID_VARIANT_INPUT),
        ).rejects.toMatchObject({
            message: 'Tamanho não encontrado.',
            statusCode: 404,
        });

        expect(
            createProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que uma cor inexistente impeça
    // a criação da variante.
    it('não deve criar variante com cor inexistente', async () => {
        findColorByIdRepositoryMock.mockResolvedValue(
            null,
        );

        await expect(
            createProductVariant(VALID_VARIANT_INPUT),
        ).rejects.toMatchObject({
            message: 'Cor não encontrada.',
            statusCode: 404,
        });

        expect(
            createProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante a unicidade do SKU.
    it('não deve criar variante com SKU duplicado', async () => {
        findProductVariantBySkuRepositoryMock.mockResolvedValue(
            MOCK_VARIANT as never,
        );

        await expect(
            createProductVariant(VALID_VARIANT_INPUT),
        ).rejects.toMatchObject({
            message:
                'Já existe uma variante com este SKU.',
            statusCode: 409,
        });

        expect(
            createProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante a unicidade da combinação
    // produto + tamanho + cor.
    it('não deve criar variante com combinação duplicada', async () => {
        findProductVariantByCombinationRepositoryMock.mockResolvedValue(
            MOCK_VARIANT as never,
        );

        await expect(
            createProductVariant(VALID_VARIANT_INPUT),
        ).rejects.toMatchObject({
            message:
                'Já existe uma variante com esta combinação de produto, tamanho e cor.',
            statusCode: 409,
        });

        expect(
            createProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que a validação do Zod seja executada
    // antes de qualquer acesso aos repositories.
    it('não deve criar variante com preço negativo', async () => {
        await expect(
            createProductVariant({
                ...VALID_VARIANT_INPUT,
                price: -1,
            }),
        ).rejects.toBeDefined();

        expect(
            findProductByIdRepositoryMock,
        ).not.toHaveBeenCalled();

        expect(
            createProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });
});

describe('getProductVariantById', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que a variante encontrada pelo repository
    // seja retornada pelo service.
    it('deve retornar uma variante pelo id', async () => {
        findProductVariantByIdRepositoryMock.mockResolvedValue(
            MOCK_VARIANT as never,
        );

        const result =
            await getProductVariantById(1);

        expect(
            findProductVariantByIdRepositoryMock,
        ).toHaveBeenCalledWith(1);

        expect(result).toEqual(MOCK_VARIANT);
    });

    // Garante que uma variante inexistente continue
    // sendo representada como null.
    it('deve retornar null quando a variante não existir', async () => {
        findProductVariantByIdRepositoryMock.mockResolvedValue(
            null,
        );

        const result =
            await getProductVariantById(999);

        expect(result).toBeNull();
    });
});

describe('listProductVariantsByProductId', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findProductByIdRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT as never,
        );
    });

    // Garante que a listagem seja realizada
    // somente para produtos existentes.
    it('deve listar as variantes de um produto', async () => {
        findProductVariantsByProductIdRepositoryMock.mockResolvedValue(
            [MOCK_VARIANT] as never,
        );

        const result =
            await listProductVariantsByProductId(1);

        expect(
            findProductVariantsByProductIdRepositoryMock,
        ).toHaveBeenCalledWith(1);

        expect(result).toEqual([
            MOCK_VARIANT,
        ]);
    });

    // Garante que um produto inexistente não
    // permita consultar suas variantes.
    it('não deve listar variantes de produto inexistente', async () => {
        findProductByIdRepositoryMock.mockResolvedValue(
            null,
        );

        await expect(
            listProductVariantsByProductId(999),
        ).rejects.toMatchObject({
            message: 'Produto não encontrado.',
            statusCode: 404,
        });

        expect(
            findProductVariantsByProductIdRepositoryMock,
        ).not.toHaveBeenCalled();
    });
});

describe('updateProductVariant', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findProductVariantByIdRepositoryMock.mockResolvedValue(
            MOCK_VARIANT as never,
        );

        findProductVariantBySkuRepositoryMock.mockResolvedValue(
            null,
        );
    });

    // Garante que uma atualização simples
    // seja persistida corretamente.
    it('deve atualizar uma variante existente', async () => {
        updateProductVariantRepositoryMock.mockResolvedValue({
            ...MOCK_VARIANT,
            price: 89.9 as never,
        } as never);

        const result =
            await updateProductVariant(
                1,
                {
                    price: 89.9,
                },
            );

        expect(
            updateProductVariantRepositoryMock,
        ).toHaveBeenCalledWith(
            1,
            {
                price: 89.9,
            },
        );

        expect(result.price).toBe(
            89.9,
        );
    });

    // Garante que uma variante inexistente
    // não possa ser atualizada.
    it('não deve atualizar variante inexistente', async () => {
        findProductVariantByIdRepositoryMock.mockResolvedValue(
            null,
        );

        await expect(
            updateProductVariant(
                999,
                {
                    price: 89.9,
                },
            ),
        ).rejects.toMatchObject({
            message: 'Variante não encontrada.',
            statusCode: 404,
        });

        expect(
            updateProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que um novo tamanho precise existir.
    it('não deve atualizar para tamanho inexistente', async () => {
        findSizeByIdRepositoryMock.mockResolvedValue(
            null,
        );

        await expect(
            updateProductVariant(
                1,
                {
                    sizeId: 999,
                },
            ),
        ).rejects.toMatchObject({
            message: 'Tamanho não encontrado.',
            statusCode: 404,
        });

        expect(
            updateProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que uma nova cor precise existir.
    it('não deve atualizar para cor inexistente', async () => {
        findColorByIdRepositoryMock.mockResolvedValue(
            null,
        );

        await expect(
            updateProductVariant(
                1,
                {
                    colorId: 999,
                },
            ),
        ).rejects.toMatchObject({
            message: 'Cor não encontrada.',
            statusCode: 404,
        });

        expect(
            updateProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que a troca de SKU respeite sua unicidade.
    it('não deve atualizar para SKU já utilizado', async () => {
        findProductVariantBySkuRepositoryMock.mockResolvedValue(
            {
                ...MOCK_VARIANT,
                id: 2,
                sku: 'OUTRO-SKU',
            } as never,
        );

        await expect(
            updateProductVariant(
                1,
                {
                    sku: 'OUTRO-SKU',
                },
            ),
        ).rejects.toMatchObject({
            message:
                'Já existe uma variante com este SKU.',
            statusCode: 409,
        });

        expect(
            updateProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que alterar tamanho e cor não permita
    // criar uma combinação já existente.
    it('não deve atualizar para combinação já utilizada', async () => {
        findSizeByIdRepositoryMock.mockResolvedValue({
            id: 2,
            name: 'G',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        findColorByIdRepositoryMock.mockResolvedValue({
            id: 2,
            name: 'Branco',
            hexCode: '#FFFFFF',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        findProductVariantByCombinationRepositoryMock.mockResolvedValue(
            {
                ...MOCK_VARIANT,
                id: 2,
                sizeId: 2,
                colorId: 2,
            } as never,
        );

        await expect(
            updateProductVariant(
                1,
                {
                    sizeId: 2,
                    colorId: 2,
                },
            ),
        ).rejects.toMatchObject({
            message:
                'Já existe uma variante com esta combinação de produto, tamanho e cor.',
            statusCode: 409,
        });

        expect(
            updateProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que uma alteração para a mesma combinação
    // da própria variante não seja tratada como conflito.
    it('deve permitir manter a própria combinação', async () => {
        findSizeByIdRepositoryMock.mockResolvedValue(
            MOCK_SIZE,
        );

        findColorByIdRepositoryMock.mockResolvedValue(
            MOCK_COLOR,
        );

        findProductVariantByCombinationRepositoryMock.mockResolvedValue(
            MOCK_VARIANT as never,
        );

        updateProductVariantRepositoryMock.mockResolvedValue(
            MOCK_VARIANT as never,
        );

        await updateProductVariant(
            1,
            {
                sizeId: 1,
                colorId: 1,
            },
        );

        expect(
            updateProductVariantRepositoryMock,
        ).toHaveBeenCalled();
    });

    // Garante que dados inválidos sejam rejeitados
    // antes de qualquer consulta.
    it('não deve atualizar com preço negativo', async () => {
        await expect(
            updateProductVariant(
                1,
                {
                    price: -1,
                },
            ),
        ).rejects.toBeDefined();

        expect(
            findProductVariantByIdRepositoryMock,
        ).not.toHaveBeenCalled();

        expect(
            updateProductVariantRepositoryMock,
        ).not.toHaveBeenCalled();
    });
});