import crypto from 'node:crypto';

import { prisma } from '../config/prisma.js';
import { findUserByEmail, updateUserPassword } from '../repositories/user-repository.js';
import { validateForgotPasswordInput } from '../validators/auth-validator.js';

import bcrypt from 'bcryptjs';

import { AppError } from '../errors/app-error.js';
import { generatePasswordResetTokenValue, hashPasswordResetToken } from '../lib/password-reset-token.js';
import { findPasswordResetToken, markPasswordResetTokenAsUsed } from '../repositories/password-reset-repository.js';
import { revokeAllRefreshTokens } from './refresh-token-service.js';

// Tempo de validade do token de recuperação em minutos.
// Tokens desse tipo devem possuir vida curta por permitirem
// a alteração de uma credencial sensível.
const PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES = 30;

// Calcula a data limite para utilização do token.
function getPasswordResetExpirationDate() {
  const expiresAt = new Date();

  expiresAt.setMinutes(
    expiresAt.getMinutes() +
    PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES,
  );

  return expiresAt;
}

// Cria uma solicitação de recuperação de senha.
// A função não revela externamente se o e-mail existe ou não.
export async function requestPasswordReset(
  email: string,
) {
  // Valida o formato antes de consultar qualquer usuário.
  validateForgotPasswordInput(email);
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  // Se não existir usuário com esse e-mail, encerramos silenciosamente.
  // Isso evita permitir enumeração de contas através da API.
  if (!user) {
    return null;
  }

  const token = generatePasswordResetTokenValue();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = getPasswordResetExpirationDate();

  await prisma.passwordResetToken.create({
    data: {
      expiresAt,
      tokenHash,
      userId: user.id,
    },
  });

  // O token original é retornado somente para a camada responsável
  // por enviá-lo ao usuário. Ele nunca é salvo em texto puro.
  return {
    email: user.email,
    expiresAt,
    token,
  };
}

// Redefine a senha a partir de um token de recuperação válido.
// O token é de uso único e, após a troca, todas as sessões
// renováveis do usuário são revogadas.
export async function resetPassword(
  token: string,
  newPassword: string,
) {
  // Localiza a solicitação pelo hash do token recebido.
  const storedResetToken =
    await findPasswordResetToken(token);

  // Tokens inexistentes não permitem redefinição.
  if (!storedResetToken) {
    throw new AppError(
      'Token de recuperação inválido.',
      401,
    );
  }

  // Um token já utilizado não pode ser reaproveitado.
  if (storedResetToken.usedAt) {
    throw new AppError(
      'Token de recuperação inválido.',
      401,
    );
  }

  // Tokens expirados também deixam de ser válidos.
  if (
    storedResetToken.expiresAt.getTime() <=
    Date.now()
  ) {
    throw new AppError(
      'Token de recuperação expirado.',
      401,
    );
  }

  // Usuários desativados não devem conseguir
  // redefinir a senha por esse fluxo.
  if (!storedResetToken.user.isActive) {
    throw new AppError(
      'Usuário inativo.',
      403,
    );
  }

  // A nova senha também precisa respeitar a
  // política mínima definida pela aplicação.
  if (!newPassword) {
    throw new AppError(
      'Informe a nova senha.',
      400,
    );
  }

  if (newPassword.length < 8) {
    throw new AppError(
      'A senha deve conter pelo menos 8 caracteres.',
      400,
    );
  }

  // Gera um novo hash bcrypt para substituir
  // a senha antiga armazenada no banco.
  const passwordHash = await bcrypt.hash(
    newPassword,
    12,
  );

  // Executa todas as alterações sensíveis da recuperação
  // de senha dentro de uma única transação.
  //
  // Se qualquer operação falhar, o Prisma desfaz todas
  // as alterações anteriores automaticamente.
  await prisma.$transaction(async (transaction) => {
    // Atualiza a senha utilizando o repository,
    // mas dentro do mesmo contexto transacional.
    await updateUserPassword(
      storedResetToken.user.id,
      passwordHash,
      transaction,
    );

    // Marca o token como utilizado usando
    // a mesma transação.
    await markPasswordResetTokenAsUsed(
      storedResetToken.id,
      transaction,
    );

    // Revoga todas as sessões antigas do usuário
    // dentro da mesma operação atômica.
    await revokeAllRefreshTokens(
      storedResetToken.user.id,
      transaction,
    );
  });
}