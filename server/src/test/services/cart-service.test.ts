import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import {
    createCartRepository,
    findCartByUserIdRepository,
    findCartItemByVariantRepository,
    createCartItemRepository,
} from '../../repositories/cart-repository.js';

import {
    findActiveProductVariantsByIds,
} from '../../repositories/product-variant-repository.js';

import {
    getUserCart,
    addCartItem,
} from '../../services/cart-service.js';

// Simula os repositories para que os testes do service
// não utilizem o banco real.
vi.mock('../../repositories/cart-repository.js', () => ({
    createCartRepository: vi.fn(),
    findCartByUserIdRepository: vi.fn(),
    findCartItemByVariantRepository: vi.fn(),
    createCartItemRepository: vi.fn(),
}));

vi.mock(
    '../../repositories/product-variant-repository.js',
    () => ({
        findActiveProductVariantsByIds: vi.fn(),
    }),
);

const createCartRepositoryMock = vi.mocked(
    createCartRepository,
);

const findCartByUserIdRepositoryMock = vi.mocked(
    findCartByUserIdRepository,
);

const findCartItemByVariantRepositoryMock = vi.mocked(
    findCartItemByVariantRepository,
);

const createCartItemRepositoryMock = vi.mocked(
    createCartItemRepository,
);

const findActiveProductVariantsByIdsMock = vi.mocked(
    findActiveProductVariantsByIds,
);

const MOCK_CART = {
    id: 1,
    userId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
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
    product: {
        id: 1,
        categoryId: 1,
        name: 'Top Essential',
        slug: 'top-essential',
        description: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    size: {
        id: 1,
        name: 'M',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    color: {
        id: 1,
        name: 'Preto',
        hexCode: '#000000',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
};

const VALID_CART_ITEM = {
    variantId: 1,
    quantity: 2,
};

describe('getUserCart', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que o carrinho existente seja retornado
    // sem criar um novo registro.
    it('deve retornar o carrinho existente', async () => {
        findCartByUserIdRepositoryMock.mockResolvedValue(
            MOCK_CART as never,
        );

        const result = await getUserCart(3);

        expect(
            findCartByUserIdRepositoryMock,
        ).toHaveBeenCalledWith(3);

        expect(
            createCartRepositoryMock,
        ).not.toHaveBeenCalled();

        expect(result).toEqual(MOCK_CART);
    });

    // Garante que o carrinho seja criado automaticamente
    // quando o usuário ainda não possuir um.
    it('deve criar o carrinho quando ele não existir', async () => {
        findCartByUserIdRepositoryMock.mockResolvedValue(
            null,
        );

        createCartRepositoryMock.mockResolvedValue(
            MOCK_CART as never,
        );

        const result = await getUserCart(3);

        expect(
            createCartRepositoryMock,
        ).toHaveBeenCalledWith(3);

        expect(result).toEqual(MOCK_CART);
    });
});

describe('addCartItem', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        findCartByUserIdRepositoryMock.mockResolvedValue(
            MOCK_CART as never,
        );

        findActiveProductVariantsByIdsMock.mockResolvedValue([
            MOCK_VARIANT as never,
        ]);

        findCartItemByVariantRepositoryMock.mockResolvedValue(
            null,
        );
    });

    // Garante que um item válido seja adicionado
    // com o preço obtido da ProductVariant.
    it('deve adicionar um item válido ao carrinho', async () => {
        createCartItemRepositoryMock.mockResolvedValue({
            id: 1,
            cartId: 1,
            variantId: 1,
            quantity: 2,
            unitPrice: 79.9 as never,
            createdAt: new Date(),
            updatedAt: new Date(),
            variant: MOCK_VARIANT,
        } as never);

        const result = await addCartItem(
            3,
            VALID_CART_ITEM,
        );

        expect(
            createCartItemRepositoryMock,
        ).toHaveBeenCalledWith({
            cartId: 1,
            variantId: 1,
            quantity: 2,
            unitPrice: 79.9,
        });

        expect(result).toBeDefined();
    });

    // Garante que uma variante inexistente ou indisponível
    // não possa ser adicionada ao carrinho.
    it('não deve adicionar variante indisponível', async () => {
        findActiveProductVariantsByIdsMock.mockResolvedValue(
            [],
        );

        await expect(
            addCartItem(
                3,
                VALID_CART_ITEM,
            ),
        ).rejects.toMatchObject({
            message:
                'Variação do produto não encontrada ou está indisponível.',
            statusCode: 404,
        });

        expect(
            createCartItemRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que a quantidade solicitada não ultrapasse
    // o estoque disponível.
    it('não deve adicionar quantidade maior que o estoque', async () => {
        await expect(
            addCartItem(
                3,
                {
                    variantId: 1,
                    quantity: 11,
                },
            ),
        ).rejects.toMatchObject({
            message:
                'Estoque insuficiente para a variação TOP-ESS-M-PRETO.',
            statusCode: 400,
        });

        expect(
            createCartItemRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que uma mesma variante não seja duplicada
    // dentro do mesmo carrinho.
    it('não deve adicionar variante que já está no carrinho', async () => {
        findCartItemByVariantRepositoryMock.mockResolvedValue({
            id: 1,
            cartId: 1,
            variantId: 1,
            quantity: 2,
            unitPrice: 79.9 as never,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await expect(
            addCartItem(
                3,
                VALID_CART_ITEM,
            ),
        ).rejects.toMatchObject({
            message: 'A variação já está no carrinho.',
            statusCode: 409,
        });

        expect(
            createCartItemRepositoryMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que o preço persistido no carrinho
    // venha da ProductVariant.
    it('deve armazenar o preço atual da variante', async () => {
        createCartItemRepositoryMock.mockResolvedValue(
            {} as never,
        );

        await addCartItem(
            3,
            {
                variantId: 1,
                quantity: 1,
            },
        );

        expect(
            createCartItemRepositoryMock,
        ).toHaveBeenCalledWith({
            cartId: 1,
            variantId: 1,
            quantity: 1,
            unitPrice: 79.9,
        });
    });

    // Garante que o carrinho seja criado automaticamente
    // quando o usuário ainda não possuir um.
    it('deve criar o carrinho antes de adicionar o item', async () => {
        findCartByUserIdRepositoryMock.mockResolvedValue(
            null,
        );

        createCartRepositoryMock.mockResolvedValue(
            MOCK_CART as never,
        );

        createCartItemRepositoryMock.mockResolvedValue(
            {} as never,
        );

        await addCartItem(
            3,
            VALID_CART_ITEM,
        );

        expect(
            createCartRepositoryMock,
        ).toHaveBeenCalledWith(3);

        expect(
            createCartItemRepositoryMock,
        ).toHaveBeenCalledWith({
            cartId: 1,
            variantId: 1,
            quantity: 2,
            unitPrice: 79.9,
        });
    });
});