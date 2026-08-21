import {
  countUserAddresses,
  createAddress,
  findAddressesByUserId,
} from '../repositories/address-repository.js';

import {
    createAddressSchema,
    type CreateAddressInput,
} from '../validators/address-validator.js';

// Cria um novo endereço para o usuário autenticado.
//
// O Zod valida e normaliza a entrada.
// O service fica responsável apenas por coordenar
// as regras de negócio antes da persistência.
export async function createUserAddress(
    userId: number,
    data: CreateAddressInput,
) {
    // Valida os dados recebidos e aplica as
    // transformações definidas no schema, como trim().
    const input = createAddressSchema.parse(data);

    // Se o usuário ainda não possui endereços,
    // o primeiro é definido automaticamente como padrão.
    const addressCount = await countUserAddresses(userId);

    const isDefault = addressCount === 0;

    return createAddress(
        userId,
        input,
        isDefault,
    );
}

// Retorna somente os endereços pertencentes
// ao usuário autenticado.
export async function listUserAddresses(
  userId: number,
) {
  return findAddressesByUserId(userId);
}