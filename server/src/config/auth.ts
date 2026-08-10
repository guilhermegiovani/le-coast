import 'dotenv/config';
import type { StringValue } from 'ms';

// Define o formato das configurações de autenticação.
type AuthConfig = {
  jwt: {
    expiresIn: StringValue | number;
    secret: string;
  };
};

// Garante que o segredo JWT esteja configurado.
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    'A variável de ambiente JWT_SECRET não foi definida.',
  );
}

// Centraliza as configurações utilizadas na autenticação JWT.
export const authConfig: AuthConfig = {
  jwt: {
    expiresIn: (process.env.JWT_EXPIRES_IN ??
      '7d') as StringValue,
    secret: jwtSecret,
  },
};