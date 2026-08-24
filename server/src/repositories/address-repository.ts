import { prisma } from '../config/prisma.js';

import type {
  CreateAddressInput,
  UpdateAddressInput,
} from '../validators/address-validator.js';

import { removeUndefined } from '../lib/remove-undefined.js';

// Persiste um novo endereço associado
// ao usuário autenticado.
export async function createAddress(
  userId: number,
  input: CreateAddressInput,
  isDefault: boolean,
) {
  return prisma.address.create({
    data: {
      city: input.city,

      // Campos opcionais só são enviados ao Prisma
      // quando realmente possuem um valor.
      ...(input.complement !== undefined && {
        complement: input.complement,
      }),

      ...(input.country !== undefined && {
        country: input.country,
      }),

      isDefault,
      name: input.name,
      neighborhood: input.neighborhood,
      number: input.number,
      state: input.state,
      street: input.street,
      userId,
      zipCode: input.zipCode,
    },
  });
}

// Conta quantos endereços pertencem ao usuário.
// Essa informação permite ao service decidir
// se o novo endereço deve ser o padrão automaticamente.
export async function countUserAddresses(
  userId: number,
) {
  return prisma.address.count({
    where: {
      userId,
    },
  });
}

// Busca todos os endereços pertencentes
// ao usuário autenticado.
export async function findAddressesByUserId(
  userId: number,
) {
  return prisma.address.findMany({
    where: {
      userId,
    },
    orderBy: [
      {
        isDefault: 'desc',
      },
      {
        createdAt: 'asc',
      },
    ],
  });
}

// Busca um endereço específico garantindo que
// ele pertença ao usuário autenticado.
export async function findAddressByIdAndUserId(
  addressId: number,
  userId: number,
) {
  return prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });
}

// Atualiza somente os campos realmente enviados
// na requisição, evitando propriedades com undefined.
export async function updateAddress(
  addressId: number,
  userId: number,
  input: UpdateAddressInput,
) {
  return prisma.address.update({
    where: {
      id: addressId,
      userId,
    },
    data: removeUndefined(input),
  });
}

// Exclui um endereço pertencente
// ao usuário autenticado.
export async function deleteAddress(
  addressId: number,
  userId: number,
) {
  return prisma.address.delete({
    where: {
      id: addressId,
      userId,
    },
  });
}

// Exclui o endereço padrão e, caso ainda exista
// outro endereço, define o mais antigo como novo padrão.
//
// A transação garante que as operações sejam
// concluídas juntas ou revertidas em caso de falha.
export async function deleteDefaultAddress(
  addressId: number,
  userId: number,
) {
  return prisma.$transaction(async (tx) => {
    await tx.address.delete({
      where: {
        id: addressId,
        userId,
      },
    });

    // Após a exclusão, busca o endereço mais antigo
    // que ainda pertence ao usuário.
    const nextAddress = await tx.address.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Se havia outro endereço, ele passa
    // a ser o novo endereço padrão.
    if (nextAddress) {
      await tx.address.update({
        where: {
          id: nextAddress.id,
        },
        data: {
          isDefault: true,
        },
      });
    }
  });
}

// Define um endereço como padrão para o usuário.
//
// A transação garante que o endereço padrão anterior
// seja removido e o novo seja definido de forma atômica.
export async function setDefaultAddress(
  addressId: number,
  userId: number,
) {
  return prisma.$transaction(async (tx) => {
    // Remove o status de padrão de qualquer endereço
    // que atualmente pertença ao usuário.
    await tx.address.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Define o endereço escolhido como o novo padrão.
    return tx.address.update({
      where: {
        id: addressId,
        userId,
      },
      data: {
        isDefault: true,
      },
    });
  });
}