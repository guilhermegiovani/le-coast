import cors from 'cors';
import express, {
  type Express,
} from 'express';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middlewares/error-handler.js';
import { authRoutes } from './routes/auth-routes.js';
import { addressRoutes } from './routes/address-routes.js';
import { orderRoutes } from './routes/order-routes.js';
import { productRoutes } from './routes/product-routes.js';
import { cartRoutes } from './routes/cart-routes.js';
import { paymentRoutes } from './routes/payment-routes.js';
import { paymentWebhookRoutes } from './routes/payment-webhook-routes.js';

console.log('[APP ENTRYPOINT] Arquivo principal do Express carregado');

// Cria a aplicação Express com tipagem explícita.
// Isso evita problemas de inferência de tipos
// com as dependências internas do Express.
export const app: Express = express();

app.use((request, _response, next) => {
  if (request.path === '/cart') {
    console.log('[CORS DEBUG]', {
      method: request.method,
      origin: request.headers.origin,
      requestedMethod:
        request.headers['access-control-request-method'],
    });
  }

  next();
});

// Permite que o frontend acesse a API
// e envie cookies utilizados na autenticação.
//
// Como frontend e backend rodam em origins diferentes
// durante o desenvolvimento, o CORS precisa permitir
// explicitamente a origem do frontend.
app.use(
  cors({
    // Permite o frontend local e o endereço público usado no teste.
    origin: [
      'http://localhost:3000',
      'https://le-coast-web.vercel.app',
      'https://le-coast-nw5v42171-guilhermegiovanis-projects.vercel.app',
      'https://le-coast-web-git-feat-order-c-107368-guilhermegiovanis-projects.vercel.app'
    ],
    credentials: true,
  }),
);

app.use((request, response, next) => {
  if (request.path === '/cart') {
    console.log('[CORS RESPONSE MIDDLEWARE]', request.method, request.path);

    response.on('finish', () => {
      console.log('[CORS RESPONSE]', {
        method: request.method,
        origin: request.headers.origin,
        status: response.statusCode,
        allowOrigin: response.getHeader('access-control-allow-origin'),
        allowCredentials: response.getHeader(
          'access-control-allow-credentials',
        ),
        allowMethods: response.getHeader('access-control-allow-methods'),
        allowHeaders: response.getHeader('access-control-allow-headers'),
      });
    });
  }

  next();
});

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
app.use('/orders', orderRoutes);
app.use('/products', productRoutes);

// Registra as rotas do carrinho.
app.use('/cart', cartRoutes);

// Registra as rotas de pagamento.
app.use('/', paymentRoutes);

app.use('/webhooks', paymentWebhookRoutes);

// O middleware global de erros deve ser registrado
// depois de todas as rotas.
//
// Assim, erros lançados por controllers, services
// ou middlewares anteriores chegam até ele e são
// convertidos para a resposta JSON padronizada da API.
app.use(errorHandler);