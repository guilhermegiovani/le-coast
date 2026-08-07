import 'dotenv/config';

import { app } from './app.js';
import { prisma } from './config/prisma.js';

const port = Number(process.env.PORT) || 3333;

async function startServer() {
  try {
    // Confirma que o Prisma consegue se comunicar com o banco.
    await prisma.$connect();

    console.log('Database connected successfully.');

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database.', error);
    process.exit(1);
  }
}

void startServer();