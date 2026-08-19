import { api } from '@/lib/api';

// Dados enviados pelo formulário de cadastro.
export type RegisterInput = {
  email: string;
  name: string;
  password: string;
};

// Dados públicos retornados pelo backend
// depois que um usuário é criado.
export type RegisterResponse = {
  email: string;
  id: number;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
};

// Dados enviados pelo formulário de login.
export type LoginInput = {
  email: string;
  password: string;
};

// Dados públicos do usuário autenticado.
export type AuthUser = {
  email: string;
  id: number;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
};

// Resposta pública do login.
// O refresh token não aparece aqui porque ele é
// enviado pelo backend em cookie HttpOnly.
export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

// Cria uma nova conta utilizando a API do backend.
export async function register(
  input: RegisterInput,
) {
  const response =
    await api.post<RegisterResponse>(
      '/auth/register',
      input,
    );

  return response.data;
}

// Autentica o usuário utilizando e-mail e senha.
//
// O backend retorna o access token no JSON e envia
// o refresh token separadamente em cookie HttpOnly.
export async function login(
  input: LoginInput,
) {
  const response =
    await api.post<LoginResponse>(
      '/auth/login',
      input,
    );

  return response.data;
}

// Encerra a sessão renovável no backend.
//
// O refresh token é enviado automaticamente pelo navegador
// através do cookie HttpOnly por causa do withCredentials.
export async function logout() {
  await api.post('/auth/logout');
}

// Renova a sessão utilizando o refresh token
// armazenado em cookie HttpOnly.
//
// O frontend não acessa esse cookie diretamente;
// o navegador o envia automaticamente para a API.
export async function refreshSession() {
  const response =
    await api.post<LoginResponse>(
      '/auth/refresh',
    );

  return response.data;
}

// Formato padrão das mensagens de erro
// retornadas pelo backend.
export type ApiErrorResponse = {
  message: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

// Solicita o envio de um e-mail de recuperação
// de senha para o endereço informado.
//
// A resposta do backend é propositalmente genérica
// para não revelar se uma conta existe ou não.
export async function forgotPassword(
  input: ForgotPasswordInput,
) {
  const response =
    await api.post<ForgotPasswordResponse>(
      '/auth/forgot-password',
      input,
    );

  return response.data;
}