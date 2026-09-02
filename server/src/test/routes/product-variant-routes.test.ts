import request from 'supertest';
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';

import { app } from '../../app.js';

import {
    createProductVariant,
    getProductVariantById,
    listProductVariantsByProductId,
    updateProductVariant,
} from '../../services/product-variant-service.js';

import { generateAccessToken } from '../../lib/jwt.js';

// Simula o service para que os testes HTTP
// não dependam do banco real.
vi.mock(
    '../../services/product-variant-service.js',
    () => ({
        createProductVariant: vi.fn(),
        getProductVariantById: vi.fn(),
        listProductVariantsByProductId: vi.fn(),
        updateProductVariant: vi.fn(),
    }),
);

const createProductVariantMock = vi.mocked(
    createProductVariant,
);

const getProductVariantByIdMock = vi.mocked(
    getProductVariantById,
);

const listProductVariantsByProductIdMock = vi.mocked(
    listProductVariantsByProductId,
);

const updateProductVariantMock = vi.mocked(
    updateProductVariant,
);

const MOCK_VARIANT = {
    id: 1,
    productId: 1,
    sizeId: 1,
    colorId: 1,
    sku: 'TOP-ESS-M-PRETO',
    price: 79.9,
    stock: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const VALID_VARIANT_INPUT = {
    sizeId: 1,
    colorId: 1,
    sku: 'TOP-ESS-M-PRETO',
    price: 79.9,
    stock: 10,
};

describe('GET /products/:productId/variants', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Clientes autenticados podem consultar
    // as variantes disponíveis de um produto.
    it('deve listar as variantes para um CUSTOMER', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        listProductVariantsByProductIdMock.mockResolvedValue([
            MOCK_VARIANT as never,
        ]);

        const response = await request(app)
            .get('/products/1/variants')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(200);

        expect(
            listProductVariantsByProductIdMock,
        ).toHaveBeenCalledWith(1);

        expect(response.body).toHaveLength(1);

        expect(response.body[0]).toMatchObject({
            id: 1,
            productId: 1,
            sku: 'TOP-ESS-M-PRETO',
        });
    });

    // Garante que a rota exija autenticação.
    it('deve retornar 401 sem autenticação', async () => {
        await request(app)
            .get('/products/1/variants')
            .expect(401);

        expect(
            listProductVariantsByProductIdMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que um productId inválido seja rejeitado
    // antes de chegar ao service.
    it('deve retornar 400 quando o productId for inválido', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        await request(app)
            .get('/products/abc/variants')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(400);

        expect(
            listProductVariantsByProductIdMock,
        ).not.toHaveBeenCalled();
    });
});

describe('GET /products/:productId/variants/:variantId', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que uma variante existente possa
    // ser consultada por um usuário autenticado.
    it('deve retornar uma variante existente', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        getProductVariantByIdMock.mockResolvedValue(
            MOCK_VARIANT as never,
        );

        const response = await request(app)
            .get('/products/1/variants/1')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(200);

        expect(
            getProductVariantByIdMock,
        ).toHaveBeenCalledWith(1);

        expect(response.body).toMatchObject({
            id: 1,
            sku: 'TOP-ESS-M-PRETO',
        });
    });

    // Garante que a ausência da variante resulte
    // em HTTP 404.
    it('deve retornar 404 quando a variante não existir', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        getProductVariantByIdMock.mockResolvedValue(
            null,
        );

        const response = await request(app)
            .get('/products/1/variants/999')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(404);

        expect(response.body).toEqual({
            message: 'Variante não encontrada.',
        });
    });

    // Garante que ids inválidos sejam rejeitados
    // antes de consultar o service.
    it('deve retornar 400 quando o variantId for inválido', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        await request(app)
            .get('/products/1/variants/abc')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(400);

        expect(
            getProductVariantByIdMock,
        ).not.toHaveBeenCalled();
    });
});

describe('POST /products/:productId/variants', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Apenas administradores podem cadastrar
    // variantes no catálogo.
    it('deve permitir que ADMIN crie uma variante', async () => {
        const accessToken = generateAccessToken({
            id: 1,
            role: 'ADMIN',
        });

        createProductVariantMock.mockResolvedValue(
            MOCK_VARIANT as never,
        );

        const response = await request(app)
            .post('/products/1/variants')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send(VALID_VARIANT_INPUT)
            .expect(201);

        expect(
            createProductVariantMock,
        ).toHaveBeenCalledWith({
            ...VALID_VARIANT_INPUT,
            productId: 1,
        });

        expect(response.body).toMatchObject({
            id: 1,
            productId: 1,
            sku: 'TOP-ESS-M-PRETO',
        });
    });

    // Clientes não podem cadastrar variantes.
    it('deve retornar 403 para CUSTOMER', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        await request(app)
            .post('/products/1/variants')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send(VALID_VARIANT_INPUT)
            .expect(403);

        expect(
            createProductVariantMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que o productId seja obtido da URL.
    it('deve ignorar productId enviado no body', async () => {
        const accessToken = generateAccessToken({
            id: 1,
            role: 'ADMIN',
        });

        createProductVariantMock.mockResolvedValue(
            MOCK_VARIANT as never,
        );

        await request(app)
            .post('/products/1/variants')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                ...VALID_VARIANT_INPUT,
                productId: 999,
            })
            .expect(201);

        expect(
            createProductVariantMock,
        ).toHaveBeenCalledWith({
            ...VALID_VARIANT_INPUT,
            productId: 1,
        });
    });

    // Garante que um productId inválido seja rejeitado.
    it('deve retornar 400 quando o productId for inválido', async () => {
        const accessToken = generateAccessToken({
            id: 1,
            role: 'ADMIN',
        });

        await request(app)
            .post('/products/abc/variants')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send(VALID_VARIANT_INPUT)
            .expect(400);

        expect(
            createProductVariantMock,
        ).not.toHaveBeenCalled();
    });
});

describe('PATCH /products/:productId/variants/:variantId', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Apenas administradores podem alterar variantes.
    it('deve permitir que ADMIN atualize uma variante', async () => {
        const accessToken = generateAccessToken({
            id: 1,
            role: 'ADMIN',
        });

        updateProductVariantMock.mockResolvedValue({
            ...MOCK_VARIANT,
            price: 89.9,
        } as never);

        const response = await request(app)
            .patch('/products/1/variants/1')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                price: 89.9,
            })
            .expect(200);

        expect(
            updateProductVariantMock,
        ).toHaveBeenCalledWith(
            1,
            {
                price: 89.9,
            },
        );

        expect(response.body).toMatchObject({
            id: 1,
            price: 89.9,
        });
    });

    // Clientes não podem alterar variantes.
    it('deve retornar 403 para CUSTOMER', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        await request(app)
            .patch('/products/1/variants/1')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                price: 89.9,
            })
            .expect(403);

        expect(
            updateProductVariantMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que um variantId inválido seja rejeitado.
    it('deve retornar 400 quando o variantId for inválido', async () => {
        const accessToken = generateAccessToken({
            id: 1,
            role: 'ADMIN',
        });

        await request(app)
            .patch('/products/1/variants/abc')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                price: 89.9,
            })
            .expect(400);

        expect(
            updateProductVariantMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que a autenticação seja obrigatória.
    it('deve retornar 401 sem autenticação', async () => {
        await request(app)
            .patch('/products/1/variants/1')
            .send({
                price: 89.9,
            })
            .expect(401);

        expect(
            updateProductVariantMock,
        ).not.toHaveBeenCalled();
    });
});