import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {
    createProductRepository,
    findProductByIdRepository,
    findProductBySlugRepository,
    findProductsRepository,
    updateProductRepository,
} from '../../repositories/product-repository.js';

import {
    findCategoryByIdRepository,
} from '../../repositories/category-repository.js';

import {
    createProduct,
    getProductById,
    listProducts,
    updateProduct,
} from '../../services/product-service.js';

// Simula o repository para que os testes do service
// não utilizem o banco real.
vi.mock('../../repositories/product-repository.js', () => ({
    createProductRepository: vi.fn(),
    findProductByIdRepository: vi.fn(),
    findProductBySlugRepository: vi.fn(),
    findProductsRepository: vi.fn(),
    updateProductRepository: vi.fn(),
}));

// Simula o repository de categorias para que os testes
// do service não dependam do banco real.
vi.mock('../../repositories/category-repository.js', () => ({
    findCategoryByIdRepository: vi.fn(),
}));

const createProductRepositoryMock = vi.mocked(
    createProductRepository,
);

const findProductByIdRepositoryMock = vi.mocked(
    findProductByIdRepository,
);

const findProductsRepositoryMock = vi.mocked(
    findProductsRepository,
);

const updateProductRepositoryMock = vi.mocked(
    updateProductRepository,
);

const findCategoryByIdRepositoryMock = vi.mocked(
    findCategoryByIdRepository,
);

const findProductBySlugRepositoryMock = vi.mocked(
    findProductBySlugRepository,
);

const VALID_PRODUCT = {
    categoryId: 1,
    name: 'Top Essential',
    slug: 'top-essential',
    description: 'Top fitness feminino.',
};

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

describe('createProduct', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que um produto válido seja enviado
    // ao repository após a validação do service.
    it('deve criar um produto válido', async () => {
        createProductRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT,
        );

        // Simula uma categoria existente para que o produto
        // possa ser criado normalmente.
        findCategoryByIdRepositoryMock.mockResolvedValue({
            id: 1,
            name: 'Fitness',
            slug: 'fitness',
            parentId: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Simula que o slug escolhido ainda está disponível.
        findProductBySlugRepositoryMock.mockResolvedValue(
            null,
        );

        const result = await createProduct(
            VALID_PRODUCT,
        );

        expect(
            createProductRepositoryMock,
        ).toHaveBeenCalledWith(
            VALID_PRODUCT,
        );

        expect(result).toEqual(MOCK_PRODUCT);
    });

    // Garante que dados inválidos sejam rejeitados
    // antes de qualquer acesso ao repository.
    it('não deve criar produto com dados inválidos', async () => {
        await expect(
            createProduct({
                ...VALID_PRODUCT,
                name: '   ',
            }),
        ).rejects.toBeDefined();

        expect(
            createProductRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que propriedades opcionais com undefined
    // não sejam enviadas explicitamente ao repository.
    it('deve remover description undefined antes de criar', async () => {
        createProductRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT,
        );

        // Simula uma categoria existente para que o produto
        // possa ser criado normalmente.
        findCategoryByIdRepositoryMock.mockResolvedValue({
            id: 1,
            name: 'Fitness',
            slug: 'fitness',
            parentId: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Simula que o slug escolhido ainda está disponível.
        findProductBySlugRepositoryMock.mockResolvedValue(
            null,
        );

        const {
            description: _description,
            ...productWithoutDescription
        } = VALID_PRODUCT;

        await createProduct(
            productWithoutDescription,
        );

        expect(
            createProductRepositoryMock,
        ).toHaveBeenCalledWith(
            productWithoutDescription,
        );
    });

    // Garante que um produto não possa ser criado
    // utilizando uma categoria inexistente.
    it('não deve criar produto com categoria inexistente', async () => {
        findCategoryByIdRepositoryMock.mockResolvedValue(
            null,
        );

        await expect(
            createProduct(VALID_PRODUCT),
        ).rejects.toMatchObject({
            message: 'Categoria não encontrada.',
            statusCode: 404,
        });

        expect(
            createProductRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que o slug não possa ser reutilizado
    // por outro produto.
    it('não deve criar produto com slug duplicado', async () => {
        findCategoryByIdRepositoryMock.mockResolvedValue({
            id: 1,
            name: 'Fitness',
            slug: 'fitness',
            parentId: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        findProductBySlugRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT as never,
        );

        await expect(
            createProduct(VALID_PRODUCT),
        ).rejects.toMatchObject({
            message:
                'Já existe um produto com este slug.',
            statusCode: 409,
        });

        expect(
            createProductRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que o slug esteja disponível quando
    // nenhum outro produto o estiver utilizando.
    it('deve permitir criar produto com slug disponível', async () => {
        findCategoryByIdRepositoryMock.mockResolvedValue({
            id: 1,
            name: 'Fitness',
            slug: 'fitness',
            parentId: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        findProductBySlugRepositoryMock.mockResolvedValue(
            null,
        );

        createProductRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT,
        );

        const result = await createProduct(
            VALID_PRODUCT,
        );

        expect(
            createProductRepositoryMock,
        ).toHaveBeenCalledWith(
            VALID_PRODUCT,
        );

        expect(result).toEqual(MOCK_PRODUCT);
    });
});

describe('getProductById', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que o produto retornado pelo repository
    // seja repassado pelo service.
    it('deve retornar o produto pelo id', async () => {
        findProductByIdRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT as never,
        );

        const result = await getProductById(1);

        expect(
            findProductByIdRepositoryMock,
        ).toHaveBeenCalledWith(1);

        expect(result).toEqual(MOCK_PRODUCT);
    });

    // Garante que um produto inexistente continue sendo
    // representado como null pelo service.
    it('deve retornar null quando o produto não existir', async () => {
        findProductByIdRepositoryMock.mockResolvedValue(
            null,
        );

        const result = await getProductById(999);

        expect(
            findProductByIdRepositoryMock,
        ).toHaveBeenCalledWith(999);

        expect(result).toBeNull();
    });
});

describe('listProducts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que a listagem seja delegada ao repository.
    it('deve retornar a lista de produtos', async () => {
        findProductsRepositoryMock.mockResolvedValue([
            MOCK_PRODUCT,
        ] as never);

        const result = await listProducts();

        expect(
            findProductsRepositoryMock,
        ).toHaveBeenCalled();

        expect(result).toEqual([
            MOCK_PRODUCT,
        ]);
    });

    // Garante que a ausência de produtos seja tratada
    // como uma lista vazia e não como erro.
    it('deve retornar lista vazia quando não houver produtos', async () => {
        findProductsRepositoryMock.mockResolvedValue([]);

        const result = await listProducts();

        expect(result).toEqual([]);
    });
});

describe('updateProduct', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que apenas um produto existente seja
    // encaminhado para atualização.
    it('deve atualizar um produto existente', async () => {
        findProductByIdRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT as never,
        );

        updateProductRepositoryMock.mockResolvedValue({
            ...MOCK_PRODUCT,
            name: 'Top Essential 2',
        });

        const result = await updateProduct(
            1,
            {
                name: 'Top Essential 2',
            },
        );

        expect(
            findProductByIdRepositoryMock,
        ).toHaveBeenCalledWith(1);

        expect(
            updateProductRepositoryMock,
        ).toHaveBeenCalledWith(
            1,
            {
                name: 'Top Essential 2',
            },
        );

        expect(result.name).toBe(
            'Top Essential 2',
        );
    });

    // Garante que produtos inexistentes não possam
    // ser atualizados.
    it('deve retornar 404 quando o produto não existir', async () => {
        findProductByIdRepositoryMock.mockResolvedValue(
            null,
        );

        await expect(
            updateProduct(
                999,
                {
                    name: 'Produto inexistente',
                },
            ),
        ).rejects.toMatchObject({
            message: 'Produto não encontrado.',
            statusCode: 404,
        });

        expect(
            updateProductRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que dados inválidos sejam rejeitados
    // antes de consultar ou atualizar o produto.
    it('não deve atualizar com dados inválidos', async () => {
        await expect(
            updateProduct(
                1,
                {
                    name: '   ',
                },
            ),
        ).rejects.toBeDefined();

        expect(
            findProductByIdRepositoryMock,
        ).not.toHaveBeenCalled();

        expect(
            updateProductRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que uma categoria inexistente não
    // possa ser associada durante uma atualização.
    it('não deve atualizar para categoria inexistente', async () => {
        findProductByIdRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT as never,
        );

        findCategoryByIdRepositoryMock.mockResolvedValue(
            null,
        );

        await expect(
            updateProduct(
                1,
                {
                    categoryId: 999,
                },
            ),
        ).rejects.toMatchObject({
            message: 'Categoria não encontrada.',
            statusCode: 404,
        });

        expect(
            updateProductRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que um slug pertencente a outro produto
    // não possa ser reutilizado.
    it('não deve atualizar para slug já utilizado por outro produto', async () => {
        findProductByIdRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT as never,
        );

        findProductBySlugRepositoryMock.mockResolvedValue({
            ...MOCK_PRODUCT,
            id: 2,
            slug: 'outro-slug',
        } as never);

        await expect(
            updateProduct(
                1,
                {
                    slug: 'outro-slug',
                },
            ),
        ).rejects.toMatchObject({
            message:
                'Já existe um produto com este slug.',
            statusCode: 409,
        });

        expect(
            updateProductRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que o próprio produto possa continuar
    // utilizando seu slug atual sem gerar conflito.
    it('deve permitir manter o próprio slug', async () => {
        findProductByIdRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT as never,
        );

        updateProductRepositoryMock.mockResolvedValue(
            MOCK_PRODUCT as never,
        );

        await updateProduct(
            1,
            {
                slug: 'top-essential',
            },
        );

        expect(
            findProductBySlugRepositoryMock,
        ).not.toHaveBeenCalled();

        expect(
            updateProductRepositoryMock,
        ).toHaveBeenCalled();
    });
});