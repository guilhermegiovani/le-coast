import type {
  Request,
  Response,
} from 'express';

import { AppError } from '../errors/app-error.js';
import { createUserOrder, getUserOrderById, listUserOrders, updateOrderStatus } from '../services/order-service.js';

// Cria um novo pedido para o usuário autenticado.
export async function createOrderController(
  request: Request,
  response: Response,
) {
  // A rota utiliza authMiddleware, mas esta guarda
  // também garante ao TypeScript que request.user existe.
  if (!request.user) {
    throw new AppError(
      'Usuário não autenticado.',
      401,
    );
  }

  // O userId vem exclusivamente do JWT.
  // O cliente envia apenas endereço e itens do pedido.
  const order = await createUserOrder(
    request.user.id,
    request.body,
  );

  return response.status(201).json(order);
}

// Lista os pedidos pertencentes
// ao usuário autenticado.
export async function listOrdersController(
  request: Request,
  response: Response,
) {
  // A rota já utiliza authMiddleware, mas esta guarda
  // também garante ao TypeScript que request.user existe.
  if (!request.user) {
    throw new AppError(
      'Usuário não autenticado.',
      401,
    );
  }

  const orders = await listUserOrders(
    request.user.id,
  );

  return response.status(200).json(orders);
}

// Retorna um pedido específico pertencente
// ao usuário autenticado.
export async function getOrderByIdController(
  request: Request,
  response: Response,
) {
  if (!request.user) {
    throw new AppError(
      'Usuário não autenticado.',
      401,
    );
  }

  const orderId = Number(request.params.id);

  // Impede consultas com identificadores
  // que não representem inteiros positivos.
  if (
    !Number.isInteger(orderId) ||
    orderId <= 0
  ) {
    throw new AppError(
      'Pedido inválido.',
      400,
    );
  }

  const order = await getUserOrderById(
    request.user.id,
    orderId,
  );

  // Também retorna 404 quando o pedido existe,
  // mas pertence a outro usuário, evitando expor
  // informações sobre pedidos de outras contas.
  if (!order) {
    throw new AppError(
      'Pedido não encontrado.',
      404,
    );
  }

  return response.status(200).json(order);
}

// Atualiza o status de um pedido.
//
// Esta operação é administrativa e a autorização
// de acesso é garantida pelos middlewares da rota.
export async function updateOrderStatusController(
  request: Request,
  response: Response,
) {
  const orderId = Number(request.params.id);

  // Impede atualizações com identificadores
  // que não representem inteiros positivos.
  if (
    !Number.isInteger(orderId) ||
    orderId <= 0
  ) {
    throw new AppError(
      'Pedido inválido.',
      400,
    );
  }

  const order = await updateOrderStatus(
    orderId,
    request.body,
  );

  return response.status(200).json(order);
}