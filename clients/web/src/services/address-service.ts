import { api } from '@/lib/api';

export type Address = {
  id: number;
  userId: number;
  name: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

// Busca os endereços pertencentes ao usuário autenticado.
//
// A API identifica o usuário pelo token de autenticação,
// portanto não é necessário enviar userId na requisição.
export async function getAddresses(): Promise<Address[]> {
  const response = await api.get<Address[]>(
    '/addresses',
  );

  return response.data;
}

export type CreateAddressInput = {
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
};

// Cria um novo endereço para o usuário autenticado.
export async function createAddress(
  data: CreateAddressInput,
): Promise<Address> {
  const response = await api.post<Address>(
    '/addresses',
    data,
  );

  return response.data;
}

// Define um endereço do usuário autenticado
// como novo endereço padrão.
export async function setDefaultAddress(
  addressId: number,
): Promise<Address> {
  const response = await api.patch<Address>(
    `/addresses/${addressId}/default`,
  );

  return response.data;
}

// Exclui um endereço pertencente ao usuário autenticado.
//
// A API também cuida da promoção automática de outro
// endereço caso o endereço excluído seja o padrão atual.
export async function deleteAddress(
  addressId: number,
): Promise<void> {
  await api.delete(
    `/addresses/${addressId}`,
  );
}

export type UpdateAddressInput =
  Partial<CreateAddressInput>;

// Atualiza parcialmente um endereço
// pertencente ao usuário autenticado.
export async function updateAddress(
  addressId: number,
  data: UpdateAddressInput,
): Promise<Address> {
  const response = await api.patch<Address>(
    `/addresses/${addressId}`,
    data,
  );

  return response.data;
}