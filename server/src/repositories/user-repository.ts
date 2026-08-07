import { prisma } from '../config/prisma.js';
import type { UserRole } from '../generated/prisma/client.js';

type CreateUserData = {
  email: string;
  name: string;
  passwordHash: string;
  role?: UserRole;
};

// Busca um usuário pelo e-mail.
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

// Cria um novo usuário no banco.
export async function createUser(data: CreateUserData) {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      ...(data.role !== undefined && {
        role: data.role,
      }),
    },
    select: {
      email: true,
      id: true,
      name: true,
      role: true,
    },
  });
}