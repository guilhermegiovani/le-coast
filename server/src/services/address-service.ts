import { AppError } from '../errors/app-error.js';
import {
  deleteAddress,
  deleteDefaultAddress,
  countUserAddresses,
  createAddress,
  findAddressByIdAndUserId,
  findAddressesByUserId,
  updateAddress,
  setDefaultAddress,
} from '../repositories/address-repository.js';

import {
  createAddressSchema,
  updateAddressSchema,
  type CreateAddressInput,
  type UpdateAddressInput,
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

// Atualiza um endereço pertencente ao usuário autenticado.
export async function updateUserAddress(
  userId: number,
  addressId: number,
  data: UpdateAddressInput,
) {
  const input = updateAddressSchema.parse(data);

  const address = await findAddressByIdAndUserId(
    addressId,
    userId,
  );

  // Não diferenciamos endereço inexistente de endereço
  // pertencente a outro usuário.
  if (!address) {
    throw new AppError(
      'Endereço não encontrado.',
      404,
    );
  }

  return updateAddress(
    addressId,
    userId,
    input,
  );
}

// Exclui um endereço pertencente ao usuário autenticado.
//
// Se o endereço excluído for o padrão,
// outro endereço será promovido automaticamente.
export async function deleteUserAddress(
  userId: number,
  addressId: number,
) {
  const address = await findAddressByIdAndUserId(
    addressId,
    userId,
  );

  // Não diferencia endereço inexistente de um
  // endereço pertencente a outro usuário.
  if (!address) {
    throw new AppError(
      'Endereço não encontrado.',
      404,
    );
  }

  if (address.isDefault) {
    await deleteDefaultAddress(
      addressId,
      userId,
    );

    return;
  }

  await deleteAddress(
    addressId,
    userId,
  );
}

// Define um endereço pertencente ao usuário
// autenticado como seu endereço padrão.
export async function setUserDefaultAddress(
  userId: number,
  addressId: number,
) {
  const address = await findAddressByIdAndUserId(
    addressId,
    userId,
  );

  // Não diferencia um endereço inexistente de um
  // endereço pertencente a outro usuário.
  if (!address) {
    throw new AppError(
      'Endereço não encontrado.',
      404,
    );
  }

  // Se ele já for o endereço padrão, não precisamos
  // realizar nenhuma alteração no banco.
  if (address.isDefault) {
    return address;
  }

  return setDefaultAddress(
    addressId,
    userId,
  );
}