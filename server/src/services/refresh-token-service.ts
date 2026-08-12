import crypto from 'node:crypto';

import { prisma } from '../config/prisma.js';
import { authConfig } from '../config/auth.js';

// Gera um token aleatório seguro para ser entregue ao cliente.
function generateRefreshTokenValue() {
  return crypto.randomBytes(64).toString('hex');
}

// Gera um hash SHA-256 do refresh token.
// Somente o hash é persistido no banco.
function hashRefreshToken(token: string) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

// Calcula a data de expiração do refresh token.
function getRefreshTokenExpirationDate() {
  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() +
    authConfig.refreshToken.expiresInDays,
  );

  return expiresAt;
}

// Cria uma nova sessão renovável para o usuário.
export async function createRefreshToken(
  userId: number,
) {
  const token = generateRefreshTokenValue();
  const tokenHash = hashRefreshToken(token);
  const expiresAt = getRefreshTokenExpirationDate();

  await prisma.refreshToken.create({
    data: {
      expiresAt,
      tokenHash,
      userId,
    },
  });

  // O token original é retornado apenas neste momento
  // para ser entregue ao cliente.
  return {
    expiresAt,
    token,
  };
}

// Busca uma sessão pelo refresh token original recebido do cliente.
// O valor é convertido para hash antes da consulta ao banco.
export async function findRefreshToken(
  token: string,
) {
  const tokenHash = hashRefreshToken(token);

  return prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });
}

// Revoga uma sessão para impedir que o mesmo
// refresh token seja utilizado novamente.
export async function revokeRefreshToken(
  id: number,
) {
  return prisma.refreshToken.update({
    where: {
      id,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}