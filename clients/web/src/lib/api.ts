import axios from 'axios';

// Cria uma instância HTTP compartilhada pela aplicação.
// Assim, configurações comuns da API ficam centralizadas
// em vez de serem repetidas em cada service.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  // Permite que o navegador envie e receba cookies
  // nas requisições para o backend.
  //
  // Isso será necessário principalmente para o
  // refresh token armazenado em cookie HttpOnly.
  withCredentials: true,
});