import { AppError } from '../errors/app-error.js';
import type { LoginUserInput, RegisterUserInput } from '../types/auth.js';

// Valida os dados necessários para o cadastro de um usuário.
export function validateRegisterInput(
  input: RegisterUserInput,
) {
  const name = input.name.trim();
  const email = input.email.trim();
  const password = input.password;

  // Impede o cadastro sem um nome válido.
  if (!name) {
    throw new AppError('Informe seu nome.', 400);
  }

  // Garante que o e-mail seja informado.
  if (!email) {
    throw new AppError('Informe seu e-mail.', 400);
  }

  // Valida a estrutura básica esperada para um endereço de e-mail.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError('Informe um e-mail válido.', 400);
  }

  // Impede o cadastro sem uma senha.
  if (!password) {
    throw new AppError('Informe sua senha.', 400);
  }

  // Define o tamanho mínimo aceito para a senha.
  if (password.length < 8) {
    throw new AppError(
      'A senha deve conter pelo menos 8 caracteres.',
      400,
    );
  }
}

// Valida os dados necessários para autenticar um usuário.
export function validateLoginInput(
  input: LoginUserInput,
) {
  const email = input.email.trim();
  const password = input.password;

  // Garante que o e-mail seja informado.
  if (!email) {
    throw new AppError('Informe seu e-mail.', 400);
  }

  // Valida a estrutura básica esperada para um endereço de e-mail.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError('Informe um e-mail válido.', 400);
  }

  // Garante que a senha seja informada.
  if (!password) {
    throw new AppError('Informe sua senha.', 400);
  }
}

// Valida o e-mail utilizado na solicitação
// de recuperação de senha.
export function validateForgotPasswordInput(
  email: string,
) {
  const normalizedEmail = email.trim();

  // Garante que o e-mail seja informado.
  if (!normalizedEmail) {
    throw new AppError('Informe seu e-mail.', 400);
  }

  // Valida a estrutura básica esperada
  // para um endereço de e-mail.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    throw new AppError('Informe um e-mail válido.', 400);
  }
}