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
    createProduct,
    getProductById,
    listProducts,
    updateProduct,
} from '../../services/product-service.js';

import { generateAccessToken } from '../../lib/jwt.js';

// Simula o service para que os testes HTTP
// não dependam do banco real.
vi.mock('../../services/product-service.js', () => ({
    createProduct: vi.fn(),
    getProductById: vi.fn(),
    listProducts: vi.fn(),
    updateProduct: vi.fn(),
}));

const createProductMock = vi.mocked(
    createProduct,
);

const getProductByIdMock = vi.mocked(
    getProductById,
);

const listProductsMock = vi.mocked(
    listProducts,
);

const updateProductMock = vi.mocked(
    updateProduct,
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

const VALID_PRODUCT_INPUT = {
    categoryId: 1,
    name: 'Top Essential',
    slug: 'top-essential',
    description: 'Top fitness feminino.',
};

describe('GET /products', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Clientes autenticados podem consultar
    // os produtos disponíveis no catálogo.
    it('deve listar produtos para um CUSTOMER', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        listProductsMock.mockResolvedValue([
            MOCK_PRODUCT as never,
        ]);

        const response = await request(app)
            .get('/products')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(200);

        expect(
            listProductsMock,
        ).toHaveBeenCalled();

        expect(response.body).toHaveLength(1);

        expect(response.body[0]).toMatchObject({
            id: 1,
            name: 'Top Essential',
            slug: 'top-essential',
        });
    });

    // A rota precisa exigir autenticação mesmo
    // sendo apenas uma consulta de catálogo.
    it('deve retornar 401 sem autenticação', async () => {
        await request(app)
            .get('/products')
            .expect(401);

        expect(
            listProductsMock,
        ).not.toHaveBeenCalled();
    });
});

describe('GET /products/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que um produto existente seja retornado
    // para qualquer usuário autenticado.
    it('deve retornar um produto existente', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        getProductByIdMock.mockResolvedValue(
            MOCK_PRODUCT as never,
        );

        const response = await request(app)
            .get('/products/1')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(200);

        expect(
            getProductByIdMock,
        ).toHaveBeenCalledWith(1);

        expect(response.body).toMatchObject({
            id: 1,
            name: 'Top Essential',
        });
    });

    // Garante que um produto inexistente seja
    // convertido em um erro HTTP 404.
    it('deve retornar 404 quando o produto não existir', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        getProductByIdMock.mockResolvedValue(
            null,
        );

        const response = await request(app)
            .get('/products/999')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(404);

        expect(response.body).toEqual({
            message: 'Produto não encontrado.',
        });
    });

    // Garante que ids inválidos sejam rejeitados
    // antes de chegar ao service.
    it('deve retornar 400 quando o id for inválido', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        await request(app)
            .get('/products/abc')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .expect(400);

        expect(
            getProductByIdMock,
        ).not.toHaveBeenCalled();
    });
});

describe('POST /products', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Apenas administradores podem cadastrar
    // novos produtos no catálogo.
    it('deve permitir que ADMIN crie um produto', async () => {
        const accessToken = generateAccessToken({
            id: 1,
            role: 'ADMIN',
        });

        createProductMock.mockResolvedValue(
            MOCK_PRODUCT,
        );

        const response = await request(app)
            .post('/products')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send(VALID_PRODUCT_INPUT)
            .expect(201);

        expect(
            createProductMock,
        ).toHaveBeenCalledWith(
            VALID_PRODUCT_INPUT,
        );

        expect(response.body).toMatchObject({
            id: 1,
            name: 'Top Essential',
            slug: 'top-essential',
        });
    });

    // Clientes podem visualizar produtos,
    // mas não podem cadastrar novos produtos.
    it('deve retornar 403 para CUSTOMER', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        await request(app)
            .post('/products')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send(VALID_PRODUCT_INPUT)
            .expect(403);

        expect(
            createProductMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que o endpoint continue protegido
    // mesmo quando nenhum token é fornecido.
    it('deve retornar 401 sem autenticação', async () => {
        await request(app)
            .post('/products')
            .send(VALID_PRODUCT_INPUT)
            .expect(401);

        expect(
            createProductMock,
        ).not.toHaveBeenCalled();
    });
});

describe('PATCH /products/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Apenas administradores podem alterar
    // informações do catálogo.
    it('deve permitir que ADMIN atualize um produto', async () => {
        const accessToken = generateAccessToken({
            id: 1,
            role: 'ADMIN',
        });

        updateProductMock.mockResolvedValue({
            ...MOCK_PRODUCT,
            name: 'Top Essential 2',
        });

        const response = await request(app)
            .patch('/products/1')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                name: 'Top Essential 2',
            })
            .expect(200);

        expect(
            updateProductMock,
        ).toHaveBeenCalledWith(
            1,
            {
                name: 'Top Essential 2',
            },
        );

        expect(response.body).toMatchObject({
            id: 1,
            name: 'Top Essential 2',
        });
    });

    // Clientes não podem alterar informações
    // administrativas do catálogo.
    it('deve retornar 403 para CUSTOMER', async () => {
        const accessToken = generateAccessToken({
            id: 3,
            role: 'CUSTOMER',
        });

        await request(app)
            .patch('/products/1')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                name: 'Produto alterado',
            })
            .expect(403);

        expect(
            updateProductMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que ids inválidos não cheguem
    // ao service.
    it('deve retornar 400 quando o id for inválido', async () => {
        const accessToken = generateAccessToken({
            id: 1,
            role: 'ADMIN',
        });

        await request(app)
            .patch('/products/abc')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                name: 'Produto alterado',
            })
            .expect(400);

        expect(
            updateProductMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que a ausência de autenticação
    // seja rejeitada antes da autorização.
    it('deve retornar 401 sem autenticação', async () => {
        await request(app)
            .patch('/products/1')
            .send({
                name: 'Produto alterado',
            })
            .expect(401);

        expect(
            updateProductMock,
        ).not.toHaveBeenCalled();
    });
});