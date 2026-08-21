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
  createUserAddress,
  listUserAddresses,
} from '../../services/address-service.js';
import { generateAccessToken } from '../../lib/jwt.js';

// Simula o service para que os testes HTTP
// não acessem o banco real.
vi.mock('../../services/address-service.js', () => ({
  createUserAddress: vi.fn(),
  listUserAddresses: vi.fn(),
}));

const createUserAddressMock = vi.mocked(
    createUserAddress,
);

const listUserAddressesMock = vi.mocked(
  listUserAddresses,
);

describe('POST /addresses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Garante que apenas usuários autenticados
    // consigam criar endereços.
    it('deve retornar 401 quando o token não for informado', async () => {
        await request(app)
            .post('/addresses')
            .send({
                city: 'Ribeirão Preto',
                name: 'Casa',
                neighborhood: 'Centro',
                number: '100',
                state: 'SP',
                street: 'Rua Exemplo',
                zipCode: '14000-000',
            })
            .expect(401);

        expect(
            createUserAddressMock,
        ).not.toHaveBeenCalled();
    });

    // Garante que um usuário autenticado consiga
    // criar um endereço válido.
    it('deve criar um endereço para o usuário autenticado', async () => {
        const accessToken = generateAccessToken({
            id: 1,
            role: 'CUSTOMER',
        });

        createUserAddressMock.mockResolvedValue({
            city: 'Ribeirão Preto',
            complement: null,
            country: 'BR',
            createdAt: new Date(),
            id: 1,
            isDefault: true,
            name: 'Casa',
            neighborhood: 'Centro',
            number: '100',
            state: 'SP',
            street: 'Rua Exemplo',
            updatedAt: new Date(),
            userId: 1,
            zipCode: '14000-000',
        });

        const response = await request(app)
            .post('/addresses')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                city: 'Ribeirão Preto',
                name: 'Casa',
                neighborhood: 'Centro',
                number: '100',
                state: 'SP',
                street: 'Rua Exemplo',
                zipCode: '14000-000',
            })
            .expect(201);

        expect(
            createUserAddressMock,
        ).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                city: 'Ribeirão Preto',
                name: 'Casa',
                neighborhood: 'Centro',
                number: '100',
                state: 'SP',
                street: 'Rua Exemplo',
                zipCode: '14000-000',
            }),
        );

        expect(response.body).toMatchObject({
            id: 1,
            isDefault: true,
            userId: 1,
        });
    });

    // Garante que o userId utilizado pelo service
    // venha do token autenticado e não do body.
    it('deve ignorar userId enviado no body', async () => {
        const accessToken = generateAccessToken({
            id: 1,
            role: 'CUSTOMER',
        });

        createUserAddressMock.mockResolvedValue({
            city: 'Ribeirão Preto',
            complement: null,
            country: 'BR',
            createdAt: new Date(),
            id: 1,
            isDefault: true,
            name: 'Casa',
            neighborhood: 'Centro',
            number: '100',
            state: 'SP',
            street: 'Rua Exemplo',
            updatedAt: new Date(),
            userId: 1,
            zipCode: '14000-000',
        });

        await request(app)
            .post('/addresses')
            .set(
                'Authorization',
                `Bearer ${accessToken}`,
            )
            .send({
                city: 'Ribeirão Preto',
                name: 'Casa',
                neighborhood: 'Centro',
                number: '100',
                state: 'SP',
                street: 'Rua Exemplo',
                userId: 999,
                zipCode: '14000-000',
            })
            .expect(201);

        expect(
            createUserAddressMock,
        ).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                city: 'Ribeirão Preto',
                name: 'Casa',
                neighborhood: 'Centro',
                number: '100',
                state: 'SP',
                street: 'Rua Exemplo',
                zipCode: '14000-000',
            }),
        );
    });
});

describe('GET /addresses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que a listagem exija autenticação.
  it('deve retornar 401 quando o token não for informado', async () => {
    await request(app)
      .get('/addresses')
      .expect(401);

    expect(
      listUserAddressesMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que sejam retornados apenas
  // os endereços do usuário autenticado.
  it('deve listar os endereços do usuário autenticado', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    listUserAddressesMock.mockResolvedValue([
      {
        city: 'Ribeirão Preto',
        complement: 'Apto 12',
        country: 'BR',
        createdAt: new Date(),
        id: 1,
        isDefault: true,
        name: 'Casa',
        neighborhood: 'Centro',
        number: '100',
        state: 'SP',
        street: 'Rua Exemplo',
        updatedAt: new Date(),
        userId: 3,
        zipCode: '14000-000',
      },
    ]);

    const response = await request(app)
      .get('/addresses')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(200);

    expect(
      listUserAddressesMock,
    ).toHaveBeenCalledWith(3);

    expect(response.body).toHaveLength(1);

    expect(response.body[0]).toMatchObject({
      id: 1,
      isDefault: true,
      userId: 3,
    });
  });

  // Garante que usuários sem endereços
  // recebam uma lista vazia.
  it('deve retornar lista vazia quando não houver endereços', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    listUserAddressesMock.mockResolvedValue([]);

    const response = await request(app)
      .get('/addresses')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(200);

    expect(response.body).toEqual([]);
  });
});
