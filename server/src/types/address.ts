// Representa os dados necessários para
// cadastrar um novo endereço do usuário.
export type CreateAddressInput = {
  city: string;
  complement?: string;
  country?: string;
  name: string;
  neighborhood: string;
  number: string;
  state: string;
  street: string;
  zipCode: string;
};