import 'dotenv/config';

import type { StringValue } from 'ms';

// Define o formato das configurações de autenticação.
type AuthConfig = {
  jwt: {
    expiresIn: StringValue | number;
    secret: string;
  };
  refreshToken: {
    expiresInDays: number;
  };
};

// Garante que o segredo JWT esteja configurado.
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    'A variável de ambiente JWT_SECRET não foi definida.',
  );
}

// Converte a duração do refresh token para número.
const refreshTokenExpiresInDays = Number(
  process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? 30,
);

// Impede que uma configuração inválida seja aceita silenciosamente.
if (
  Number.isNaN(refreshTokenExpiresInDays) ||
  refreshTokenExpiresInDays <= 0
) {
  throw new Error(
    'REFRESH_TOKEN_EXPIRES_IN_DAYS deve ser um número positivo.',
  );
}

// Centraliza as configurações utilizadas na autenticação.
export const authConfig: AuthConfig = {
  jwt: {
    expiresIn: (process.env.JWT_EXPIRES_IN ??
      '15m') as StringValue,
    secret: jwtSecret,
  },
  refreshToken: {
    expiresInDays: refreshTokenExpiresInDays,
  },
};