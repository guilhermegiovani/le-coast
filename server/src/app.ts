import cors from 'cors';
import express, {
  type Express,
} from 'express';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middlewares/error-handler.js';
import { authRoutes } from './routes/auth-routes.js';
import { addressRoutes } from './routes/address-routes.js';

// Cria a aplicação Express com tipagem explícita.
// Isso evita problemas de inferência de tipos
// com as dependências internas do Express.
export const app: Express = express();

// Permite que o frontend acesse a API
// e envie cookies utilizados na autenticação.
//
// Como frontend e backend rodam em origins diferentes
// durante o desenvolvimento, o CORS precisa permitir
// explicitamente a origem do frontend.
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

// Permite que a API receba dados JSON
// no corpo das requisições.
app.use(express.json());

// Processa cookies enviados pelo navegador.
// Isso é necessário para acessar o refresh token
// armazenado em cookie HttpOnly.
app.use(cookieParser());

// Registra as rotas de autenticação.
app.use('/auth', authRoutes);
app.use('/addresses', addressRoutes);

// O middleware global de erros deve ser registrado
// depois de todas as rotas.
//
// Assim, erros lançados por controllers, services
// ou middlewares anteriores chegam até ele e são
// convertidos para a resposta JSON padronizada da API.
app.use(errorHandler);