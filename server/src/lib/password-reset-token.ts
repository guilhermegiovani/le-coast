import crypto from 'node:crypto';

// Gera um token aleatório seguro para ser enviado
// ao usuário durante a recuperação de senha.
export function generatePasswordResetTokenValue() {
  return crypto.randomBytes(48).toString('hex');
}

// Gera o hash SHA-256 utilizado para comparar
// tokens de recuperação sem armazenar o valor original.
export function hashPasswordResetToken(
  token: string,
) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}