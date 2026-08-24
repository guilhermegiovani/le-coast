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
  deleteUserAddress,
  listUserAddresses,
  setUserDefaultAddress,
  updateUserAddress,
} from '../../services/address-service.js';

import { generateAccessToken } from '../../lib/jwt.js';
import { AppError } from '../../errors/app-error.js';

// Simula o service para que os testes HTTP
// não acessem o banco real.
vi.mock('../../services/address-service.js', () => ({
  createUserAddress: vi.fn(),
  deleteUserAddress: vi.fn(),
  listUserAddresses: vi.fn(),
  setUserDefaultAddress: vi.fn(),
  updateUserAddress: vi.fn(),
}));

const createUserAddressMock = vi.mocked(
    createUserAddress,
);

const listUserAddressesMock = vi.mocked(
  listUserAddresses,
);

const updateUserAddressMock = vi.mocked(
  updateUserAddress,
);

const deleteUserAddressMock = vi.mocked(
  deleteUserAddress,
);

const setUserDefaultAddressMock = vi.mocked(
  setUserDefaultAddress,
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

describe('PATCH /addresses/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que a atualização exija autenticação.
  it('deve retornar 401 quando o token não for informado', async () => {
    await request(app)
      .patch('/addresses/1')
      .send({
        name: 'Trabalho',
      })
      .expect(401);

    expect(
      updateUserAddressMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que ids inválidos sejam rejeitados
  // antes de chegar ao service.
  it('deve retornar 400 quando o id do endereço for inválido', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    await request(app)
      .patch('/addresses/abc')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .send({
        name: 'Trabalho',
      })
      .expect(400);

    expect(
      updateUserAddressMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que o usuário autenticado consiga
  // atualizar um endereço que pertence a ele.
  it('deve atualizar um endereço do usuário autenticado', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    updateUserAddressMock.mockResolvedValue({
      city: 'Ribeirão Preto',
      complement: 'Apto 12',
      country: 'BR',
      createdAt: new Date(),
      id: 1,
      isDefault: true,
      name: 'Trabalho',
      neighborhood: 'Centro',
      number: '100',
      state: 'SP',
      street: 'Rua Exemplo',
      updatedAt: new Date(),
      userId: 3,
      zipCode: '14000-000',
    });

    const response = await request(app)
      .patch('/addresses/1')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .send({
        name: 'Trabalho',
      })
      .expect(200);

    expect(
      updateUserAddressMock,
    ).toHaveBeenCalledWith(
      3,
      1,
      {
        name: 'Trabalho',
      },
    );

    expect(response.body).toMatchObject({
      id: 1,
      name: 'Trabalho',
      userId: 3,
    });
  });

  // Garante que endereços inexistentes ou pertencentes
  // a outro usuário retornem a mesma resposta.
  it('deve retornar 404 quando o endereço não for encontrado', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    updateUserAddressMock.mockRejectedValue(
      new AppError(
        'Endereço não encontrado.',
        404,
      ),
    );

    const response = await request(app)
      .patch('/addresses/10')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .send({
        name: 'Trabalho',
      })
      .expect(404);

    expect(response.body).toEqual({
      message: 'Endereço não encontrado.',
    });
  });
});

describe('DELETE /addresses/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que a exclusão exija autenticação.
  it('deve retornar 401 quando o token não for informado', async () => {
    await request(app)
      .delete('/addresses/1')
      .expect(401);

    expect(
      deleteUserAddressMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que ids inválidos sejam rejeitados
  // antes de chegar ao service.
  it('deve retornar 400 quando o id do endereço for inválido', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    await request(app)
      .delete('/addresses/abc')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(400);

    expect(
      deleteUserAddressMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que o usuário autenticado consiga
  // excluir um endereço que pertence a ele.
  it('deve excluir um endereço do usuário autenticado', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    deleteUserAddressMock.mockResolvedValue(undefined);

    const response = await request(app)
      .delete('/addresses/1')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(204);

    // O service deve receber o userId vindo do JWT
    // e o id informado no parâmetro da rota.
    expect(
      deleteUserAddressMock,
    ).toHaveBeenCalledWith(
      3,
      1,
    );

    // Uma resposta 204 não deve possuir corpo.
    expect(response.body).toEqual({});
  });

  // Garante que endereços inexistentes ou pertencentes
  // a outro usuário retornem a mesma resposta.
  it('deve retornar 404 quando o endereço não for encontrado', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    deleteUserAddressMock.mockRejectedValue(
      new AppError(
        'Endereço não encontrado.',
        404,
      ),
    );

    const response = await request(app)
      .delete('/addresses/10')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(404);

    expect(
      deleteUserAddressMock,
    ).toHaveBeenCalledWith(
      3,
      10,
    );

    expect(response.body).toEqual({
      message: 'Endereço não encontrado.',
    });
  });
});

describe('PATCH /addresses/:id/default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Garante que a alteração do endereço padrão
  // exija autenticação.
  it('deve retornar 401 quando o token não for informado', async () => {
    await request(app)
      .patch('/addresses/1/default')
      .expect(401);

    expect(
      setUserDefaultAddressMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que ids inválidos sejam rejeitados
  // antes de chegar ao service.
  it('deve retornar 400 quando o id do endereço for inválido', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    await request(app)
      .patch('/addresses/abc/default')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(400);

    expect(
      setUserDefaultAddressMock,
    ).not.toHaveBeenCalled();
  });

  // Garante que o usuário autenticado consiga
  // definir um de seus endereços como padrão.
  it('deve definir um endereço como padrão', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    setUserDefaultAddressMock.mockResolvedValue({
      city: 'Ribeirão Preto',
      complement: null,
      country: 'BR',
      createdAt: new Date(),
      id: 2,
      isDefault: true,
      name: 'Trabalho',
      neighborhood: 'Centro',
      number: '200',
      state: 'SP',
      street: 'Rua Trabalho',
      updatedAt: new Date(),
      userId: 3,
      zipCode: '14000-001',
    });

    const response = await request(app)
      .patch('/addresses/2/default')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(200);

    // O userId deve vir do JWT e o addressId
    // deve vir do parâmetro da rota.
    expect(
      setUserDefaultAddressMock,
    ).toHaveBeenCalledWith(
      3,
      2,
    );

    expect(response.body).toMatchObject({
      id: 2,
      isDefault: true,
      userId: 3,
    });
  });

  // Garante que um endereço inexistente ou pertencente
  // a outro usuário retorne a mesma resposta.
  it('deve retornar 404 quando o endereço não for encontrado', async () => {
    const accessToken = generateAccessToken({
      id: 3,
      role: 'CUSTOMER',
    });

    setUserDefaultAddressMock.mockRejectedValue(
      new AppError(
        'Endereço não encontrado.',
        404,
      ),
    );

    const response = await request(app)
      .patch('/addresses/10/default')
      .set(
        'Authorization',
        `Bearer ${accessToken}`,
      )
      .expect(404);

    expect(
      setUserDefaultAddressMock,
    ).toHaveBeenCalledWith(
      3,
      10,
    );

    expect(response.body).toEqual({
      message: 'Endereço não encontrado.',
    });
  });
});