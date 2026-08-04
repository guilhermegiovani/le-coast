import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  getAddressByZipCode,
  ZipCodeNotFoundError,
} from '@/services/zip-code-service';

describe('getAddressByZipCode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve rejeitar um CEP com menos de oito dígitos', async () => {
    await expect(
      getAddressByZipCode('14010'),
    ).rejects.toThrow('O CEP deve conter 8 dígitos.');
  });

  it('deve retornar o endereço encontrado', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          bairro: 'Centro',
          cep: '14010-120',
          localidade: 'Ribeirão Preto',
          logradouro: 'Rua das Flores',
          uf: 'SP',
        }),
        {
          status: 200,
        },
      ),
    );

    await expect(
      getAddressByZipCode('14010-120'),
    ).resolves.toEqual({
      city: 'Ribeirão Preto',
      neighborhood: 'Centro',
      state: 'SP',
      street: 'Rua das Flores',
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/14010120/json/',
    );
  });

  it('deve lançar erro quando o CEP não existir', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          erro: true,
        }),
        {
          status: 200,
        },
      ),
    );

    await expect(
      getAddressByZipCode('99999-999'),
    ).rejects.toBeInstanceOf(ZipCodeNotFoundError);
  });

  it('deve lançar erro quando a consulta falhar', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 500,
      }),
    );

    await expect(
      getAddressByZipCode('14010-120'),
    ).rejects.toThrow('Não foi possível consultar o CEP.');
  });
});