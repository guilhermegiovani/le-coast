import {
  Router,
  type Router as ExpressRouter,
} from 'express';

import { authMiddleware } from '../middlewares/auth-middleware.js';

import { register, login, me, refresh } from '../controllers/auth-controller.js';

export const authRoutes: ExpressRouter = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.get('/me', authMiddleware, me);
authRoutes.post('/refresh', refresh);