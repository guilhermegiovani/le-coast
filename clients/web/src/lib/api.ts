import axios from 'axios';

// Cria uma instância HTTP compartilhada pela aplicação.
// Configurações comuns ficam centralizadas aqui.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  // Permite que o navegador envie cookies HttpOnly,
  // principalmente o refresh token.
  withCredentials: true,
});

// Atualiza o access token utilizado nas
// requisições autenticadas da aplicação.
export function setApiAccessToken(
  accessToken: string | null,
) {
  if (accessToken) {
    api.defaults.headers.common.Authorization =
      `Bearer ${accessToken}`;

    return;
  }

  // Quando não existe sessão autenticada,
  // removemos o header para evitar reutilizar
  // um access token antigo.
  delete api.defaults.headers.common.Authorization;
}