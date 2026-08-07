import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// Recupera a URL de conexão configurada no arquivo .env.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL não foi definida nas variáveis de ambiente.',
  );
}

// Adapter responsável por conectar o Prisma ao PostgreSQL.
const adapter = new PrismaPg({
  connectionString,
});

// Instância única do Prisma Client utilizada pela API.
export const prisma = new PrismaClient({
  adapter,
});