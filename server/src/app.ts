import cors from 'cors';
import express, { type Express } from 'express';

import { authRoutes } from './routes/auth-routes.js';

export const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/', (_request, response) => {
  response.status(200).json({
    status: 'ok',
  });
});

app.use('/auth', authRoutes);