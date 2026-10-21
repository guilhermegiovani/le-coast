'use client';

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  login as loginApi,
  logout as logoutApi,
  refreshSession,
  type AuthUser,
  type LoginInput,
} from '@/services/auth-service';

import { setApiAccessToken } from '@/lib/api';

import { useCartStore } from '@/stores/cart-store';

// Define os dados e ações que ficarão disponíveis
// globalmente para os componentes da aplicação.
type AuthContextData = {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  user: AuthUser | null;
};

// O contexto começa sem valor porque ele só deve
// ser utilizado dentro do AuthProvider.
const AuthContext = createContext<AuthContextData | null>(
  null,
);

type AuthProviderProps = {
  children: ReactNode;
};

// Mantém o estado global da sessão autenticada
// durante a execução da aplicação.
export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<AuthUser | null>(
    null,
  );

  const [accessToken, setAccessToken] = useState<
    string | null
  >(null);

  // Tenta restaurar uma sessão existente quando
  // a aplicação é carregada.
  //
  // O refresh token não precisa ser lido pelo JavaScript.
  // O navegador o envia automaticamente através
  // do cookie HttpOnly.
  useEffect(() => {

    // FAZER COMMIT

    async function restoreSession() {
      try {
        // Primeiro, restaura e valida a sessão do usuário.
        const result = await refreshSession();

        setUser(result.user);
        setAccessToken(result.accessToken);
        setApiAccessToken(result.accessToken);
      } catch {
        // Só limpa a autenticação se a restauração da sessão falhar.
        setUser(null);
        setAccessToken(null);
        setApiAccessToken(null);
        return;
      } finally {
        setIsLoading(false);
      }

      // O carrinho é independente da autenticação:
      // se ele falhar, o usuário continua logado.
      try {
        await useCartStore.getState().loadCart();
      } catch (error) {
        console.error('Erro ao carregar o carrinho:', error);
      }
    }


    void restoreSession();
  }, []);

  // Autentica o usuário através da API e mantém
  // os dados da sessão somente em memória.
  async function login(input: LoginInput) {
    const result = await loginApi(input);

    // Mantém o token em memória no Context
    // e também configura as próximas requisições da API.
    setUser(result.user);
    setAccessToken(result.accessToken);
    setApiAccessToken(result.accessToken);
    await useCartStore.getState().syncCartWithBackend();
  }

  // Encerra a sessão no backend e limpa
  // todos os dados de autenticação mantidos no frontend.
  async function logout() {
    try {
      await logoutApi();
    } finally {
      // A sessão local precisa ser limpa mesmo se
      // a chamada de logout ao backend falhar.
      setUser(null);
      setAccessToken(null);

      // Remove também o header Authorization da instância
      // compartilhada da API para impedir que um token antigo
      // continue sendo enviado após o logout.
      setApiAccessToken(null);
      useCartStore.getState().clearCart();
    }
  }

  // A autenticação só é considerada ativa quando
  // temos usuário e access token em memória.
  const isAuthenticated =
    user !== null && accessToken !== null;

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Facilita o consumo do contexto e impede
// uso acidental fora do AuthProvider.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth deve ser utilizado dentro de AuthProvider.',
    );
  }

  return context;
}