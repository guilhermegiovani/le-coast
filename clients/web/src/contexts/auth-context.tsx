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
    async function restoreSession() {
      try {
        const result = await refreshSession();

        setUser(result.user);
        setAccessToken(result.accessToken);
      } catch {
        // A ausência de uma sessão válida é um estado normal
        // para usuários que ainda não fizeram login.
        setUser(null);
        setAccessToken(null);
      } finally {
        // A partir daqui sabemos se existe ou não
        // uma sessão autenticada.
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, []);

  // Autentica o usuário através da API e mantém
  // os dados da sessão somente em memória.
  async function login(input: LoginInput) {
    const result = await loginApi(input);

    setUser(result.user);
    setAccessToken(result.accessToken);
  }

  // Encerra a sessão no backend e limpa
  // imediatamente os dados mantidos no frontend.
  async function logout() {
    try {
      await logoutApi();
    } finally {
      // Limpamos o estado mesmo se houver falha de rede.
      // Assim, o frontend não continua se considerando autenticado.
      setUser(null);
      setAccessToken(null);
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