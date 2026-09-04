import request from 'supertest';
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { app } from '../../app.js';
import { generateAccessToken } from '../../lib/jwt.js';

import {
    addCartItem,
    deleteCartItem,
    getUserCart,
    updateCartItem,
} from '../../services/cart-service.js';

// Simula o service para que os testes HTTP
// não acessem o banco real.
vi.mock('../../services/cart-service.js', () => ({
    addCartItem: vi.fn(),
    deleteCartItem: vi.fn(),
    getUserCart: vi.fn(),
    updateCartItem: vi.fn(),
}));

const addCartItemMock = vi.mocked(
    addCartItem,
);

const deleteCartItemMock = vi.mocked(
    deleteCartItem,
);

const getUserCartMock = vi.mocked(
    getUserCart,
);

const updateCartItemMock = vi.mocked(
    updateCartItem,
);

const MOCK_CART = {
    id: 1,
    userId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
};

const MOCK_CART_ITEM = {
    id: 1,
    cartId: 1,
    variantId: 1,
    quantity: 2,
    unitPrice: 79.9 as never,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const VALID_CART_ITEM_INPUT = {
    variantId: 1,
    quantity: 2,
};

describe('GET /cart', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que o usuário autenticado consiga
    // consultar seu próprio carrinho.
    it('deve retornar o carrinho do usuário autenticado', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        getUserCartMock.mockResolvedValue(
            MOCK_CART as never,
        );

        const response = await request(app)
            .get('/cart')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(200);

        expect(
            getUserCartMock,
        ).toHaveBeenCalledWith(3);

        expect(response.body).toMatchObject({
            id: 1,
            userId: 3,
        });
    });

    // Garante que o carrinho exija autenticação.
    it('deve retornar 401 sem autenticação', async () => {
        await request(app)
            .get('/cart')
            .expect(401);

        expect(
            getUserCartMock,
        ).not.toHaveBeenCalled();
    });
});

describe('POST /cart/items', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que um usuário autenticado consiga
    // adicionar uma variante ao seu carrinho.
    it('deve adicionar um item ao carrinho', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        addCartItemMock.mockResolvedValue(
            MOCK_CART_ITEM as never,
        );

        const response = await request(app)
            .post('/cart/items')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send(VALID_CART_ITEM_INPUT)
            .expect(201);

        expect(
            addCartItemMock,
        ).toHaveBeenCalledWith(
            3,
            VALID_CART_ITEM_INPUT,
        );

        expect(response.body).toMatchObject({
            id: 1,
            cartId: 1,
            variantId: 1,
            quantity: 2,
        });
    });

    // Garante que o endpoint exija autenticação.
    it('deve retornar 401 sem autenticação', async () => {
        await request(app)
            .post('/cart/items')
            .send(VALID_CART_ITEM_INPUT)
            .expect(401);

        expect(
            addCartItemMock,
        ).not.toHaveBeenCalled();
    });
});

describe('PATCH /cart/items/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que um usuário autenticado possa
    // alterar a quantidade do próprio item.
    it('deve atualizar a quantidade do item', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        updateCartItemMock.mockResolvedValue({
            ...MOCK_CART_ITEM,
            quantity: 3,
        } as never);

        const response = await request(app)
            .patch('/cart/items/1')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                quantity: 3,
            })
            .expect(200);

        expect(
            updateCartItemMock,
        ).toHaveBeenCalledWith(
            3,
            1,
            3,
        );

        expect(response.body).toMatchObject({
            id: 1,
            quantity: 3,
        });
    });

    // Garante que um id inválido seja rejeitado
    // antes de chegar ao service.
    it('deve retornar 400 quando o id for inválido', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        await request(app)
            .patch('/cart/items/abc')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                quantity: 3,
            })
            .expect(400);

        expect(
            updateCartItemMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que a quantidade precise ser um número inteiro.
    it('deve retornar 400 quando a quantidade não for inteira', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        await request(app)
            .patch('/cart/items/1')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                quantity: 1.5,
            })
            .expect(400);

        expect(
            updateCartItemMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que o endpoint exija autenticação.
    it('deve retornar 401 sem autenticação', async () => {
        await request(app)
            .patch('/cart/items/1')
            .send({
                quantity: 3,
            })
            .expect(401);

        expect(
            updateCartItemMock,
        ).not.toHaveBeenCalled();
    });
});

describe('DELETE /cart/items/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que um usuário autenticado possa
    // remover um item do próprio carrinho.
    it('deve remover um item do carrinho', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        deleteCartItemMock.mockResolvedValue(
            MOCK_CART_ITEM as never,
        );

        await request(app)
            .delete('/cart/items/1')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(204);

        expect(
            deleteCartItemMock,
        ).toHaveBeenCalledWith(
            3,
            1,
        );
    });

    // Garante que um id inválido seja rejeitado.
    it('deve retornar 400 quando o id for inválido', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        await request(app)
            .delete('/cart/items/abc')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(400);

        expect(
            deleteCartItemMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que o endpoint exija autenticação.
    it('deve retornar 401 sem autenticação', async () => {
        await request(app)
            .delete('/cart/items/1')
            .expect(401);

        expect(
            deleteCartItemMock,
        ).not.toHaveBeenCalled();
    });
});