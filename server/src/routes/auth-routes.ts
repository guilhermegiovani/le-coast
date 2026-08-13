import {
  Router,
  type Router as ExpressRouter,
} from 'express';

import { authMiddleware } from '../middlewares/auth-middleware.js';

import {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resetPasswordController,
} from '../controllers/auth-controller.js';
export const authRoutes: ExpressRouter = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/reset-password', resetPasswordController);
authRoutes.post('/logout', logout);
authRoutes.get('/me', authMiddleware, me);
authRoutes.post('/refresh', refresh);