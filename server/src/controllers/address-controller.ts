import type {
  Request,
  Response,
} from 'express';

import { AppError } from '../errors/app-error.js';
import {
  createUserAddress,
  deleteUserAddress,
  listUserAddresses,
  updateUserAddress,
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

// Atualiza um endereço pertencente
// ao usuário autenticado.
export async function updateAddressController(
  request: Request,
  response: Response,
) {
  if (!request.user) {
    throw new AppError(
      'Usuário não autenticado.',
      401,
    );
  }

  const addressId = Number(request.params.id);

  if (
    !Number.isInteger(addressId) ||
    addressId <= 0
  ) {
    throw new AppError(
      'Endereço inválido.',
      400,
    );
  }

  const address = await updateUserAddress(
    request.user.id,
    addressId,
    request.body,
  );

  return response.status(200).json(address);
}

// ao usuário autenticado.
// Exclui um endereço pertencente ao usuário autenticado.
export async function deleteAddressController(
  request: Request,
  response: Response,
) {
  // Embora a rota utilize o authMiddleware, esta verificação
  // também garante ao TypeScript que request.user está definido.
  if (!request.user) {
    throw new AppError(
      'Usuário não autenticado.',
      401,
    );
  }

  // Converte o parâmetro recebido pela URL para número.
  const addressId = Number(request.params.id);

  // O id deve representar um inteiro positivo válido.
  // Isso evita enviar identificadores inválidos ao service.
  if (
    !Number.isInteger(addressId) ||
    addressId <= 0
  ) {
    throw new AppError(
      'Endereço inválido.',
      400,
    );
  }

  // O userId vem exclusivamente da sessão autenticada.
  // O service garante que o endereço pertence a esse usuário
  // antes de permitir sua exclusão.
  await deleteUserAddress(
    request.user.id,
    addressId,
  );

  // 204 No Content indica que a exclusão foi concluída
  // com sucesso e não há conteúdo para retornar.
  return response.status(204).send();
}