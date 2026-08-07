import {
  Router,
  type Router as ExpressRouter,
} from 'express';

import { register } from '../controllers/auth-controller.js';

export const authRoutes: ExpressRouter = Router();

authRoutes.post('/register', register);