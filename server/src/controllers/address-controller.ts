import type {
  Request,
  Response,
} from 'express';

import { AppError } from '../errors/app-error.js';
import {
  createUserAddress,
  listUserAddresses,
} from '../services/address-service.js';

// Cria um novo endereço para o usuário autenticado.
export async function createAddressController(
  request: Request,
  response: Response,
) {
  // A rota utiliza authMiddleware, mas a verificação
  // também garante segurança para a tipagem do Express.
  if (!request.user) {
    throw new AppError(
      'Usuário não autenticado.',
      401,
    );
  }

  const address = await createUserAddress(
    request.user.id,
    request.body,
  );

  return response.status(201).json(address);
}

// Lista os endereços pertencentes
// ao usuário autenticado.
export async function listAddressesController(
  request: Request,
  response: Response,
) {
  // A rota já utiliza authMiddleware, mas a guarda
  // também mantém o acesso a request.user seguro
  // para o TypeScript.
  if (!request.user) {
    throw new AppError(
      'Usuário não autenticado.',
      401,
    );
  }

  const addresses = await listUserAddresses(
    request.user.id,
  );

  return response.status(200).json(addresses);
}