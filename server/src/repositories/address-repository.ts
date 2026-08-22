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