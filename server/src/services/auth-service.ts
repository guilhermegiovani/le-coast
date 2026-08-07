import bcrypt from 'bcryptjs';

import {
  createUser,
  findUserByEmail,
} from '../repositories/user-repository.js';
import type {
  RegisterUserInput,
  RegisterUserResult,
} from '../types/auth.js';

// Quantidade de rounds usada para gerar o hash da senha.
const PASSWORD_SALT_ROUNDS = 12;

// Cria um novo usuário garantindo e-mail único e senha protegida.
export async function registerUser(
  input: RegisterUserInput,
): Promise<RegisterUserResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedName = input.name.trim();

  // Impede cadastro duplicado antes de tentar inserir no banco.
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error('E-mail já cadastrado.');
  }

  // Nunca salvamos a senha original no banco.
  const passwordHash = await bcrypt.hash(
    input.password,
    PASSWORD_SALT_ROUNDS,
  );

  return createUser({
    email: normalizedEmail,
    name: normalizedName,
    passwordHash,
  });
}