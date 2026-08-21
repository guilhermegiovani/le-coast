import { prisma } from '../config/prisma.js';

import type { CreateAddressInput } from '../validators/address-validator.js';

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