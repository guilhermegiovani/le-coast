import { prisma } from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';
import { hashPasswordResetToken } from '../lib/password-reset-token.js';

// Busca um token de recuperação pelo valor original recebido.
// Antes da consulta, o token é convertido para SHA-256,
// porque o valor puro nunca é armazenado no banco.
export async function findPasswordResetToken(
  token: string,
) {
  const tokenHash = hashPasswordResetToken(token);

  return prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });
}

// Marca um token de recuperação como utilizado.
// Quando um client transacional é informado, a operação
// participa da mesma transação da redefinição da senha.
export async function markPasswordResetTokenAsUsed(
  id: number,
  client: Prisma.TransactionClient = prisma,
) {
  return client.passwordResetToken.update({
    where: {
      id,
    },
    data: {
      usedAt: new Date(),
    },
  });
}