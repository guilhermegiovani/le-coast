type ViaCepResponse = {
  bairro: string;
  cep: string;
  erro?: boolean;
  localidade: string;
  logradouro: string;
  uf: string;
};

export type ZipCodeAddress = {
  city: string;
  neighborhood: string;
  state: string;
  street: string;
};

export class ZipCodeNotFoundError extends Error {
  constructor() {
    super('CEP não encontrado.');
    this.name = 'ZipCodeNotFoundError';
  }
}

// Consulta o endereço correspondente ao CEP informado.
export async function getAddressByZipCode(
  zipCode: string,
): Promise<ZipCodeAddress> {
  const digits = zipCode.replace(/\D/g, '');

  if (digits.length !== 8) {
    throw new Error('O CEP deve conter 8 dígitos.');
  }

  const response = await fetch(
    `https://viacep.com.br/ws/${digits}/json/`,
  );

  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP.');
  }

  const data = (await response.json()) as ViaCepResponse;

  if (data.erro) {
    throw new ZipCodeNotFoundError();
  }

  return {
    city: data.localidade,
    neighborhood: data.bairro,
    state: data.uf,
    street: data.logradouro,
  };
}