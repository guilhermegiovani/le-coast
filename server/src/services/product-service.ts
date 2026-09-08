import { AppError } from '../errors/app-error.js';
import {
  createProductRepository,
  findProductByIdRepository,
  findProductBySlugRepository,
  findProductsRepository,
  updateProductRepository,
} from '../repositories/product-repository.js';

import {
  findCategoryByIdRepository,
} from '../repositories/category-repository.js';

import {
  createProductSchema,
  type CreateProductInput,
  updateProductSchema,
  type UpdateProductInput,
} from '../validators/product-validator.js';

/**
 * Cria um novo produto.
 *
 * Antes da persistência, garante que a categoria exista
 * e que o slug ainda não esteja sendo utilizado.
 */
export async function createProduct(
  data: CreateProductInput,
) {
  const input = createProductSchema.parse(data);

  // Impede produtos associados a categorias inexistentes.
  const category = await findCategoryByIdRepository(input.categoryId);

  if (!category) {
    throw new AppError(
      'Categoria não encontrada.',
      404,
    );
  }

  // Impede que dois produtos utilizem o mesmo slug.
  const existingProduct = await findProductBySlugRepository(input.slug);

  if (existingProduct) {
    throw new AppError(
      'Já existe um produto com este slug.',
      409,
    );
  }

  return createProductRepository({
    categoryId: input.categoryId,
    name: input.name,
    slug: input.slug,
    ...(input.description !== undefined && {
      description: input.description,
    }),
  });
}

/**
 * Busca um produto pelo identificador.
 *
 * Retornar null aqui permite que o controller decida
 * como representar a ausência do recurso na API.
 */
export async function getProductById(
  productId: number,
) {
  return findProductByIdRepository(productId);
}

/**
 * Lista os produtos disponíveis no catálogo.
 */
export async function listProducts() {
  return findProductsRepository();
}

/**
 * Atualiza os dados de um produto existente.
 *
 * Quando categoria ou slug forem alterados, as novas informações
 * também precisam respeitar as regras de integridade do catálogo.
 */
export async function updateProduct(
  productId: number,
  data: UpdateProductInput,
) {
  const input = updateProductSchema.parse(data);

  const product = await findProductByIdRepository(productId);

  if (!product) {
    throw new AppError(
      'Produto não encontrado.',
      404,
    );
  }

  // Caso uma nova categoria tenha sido enviada,
  // verifica se ela realmente existe.
  if (input.categoryId !== undefined) {
    const category = await findCategoryByIdRepository(input.categoryId);

    if (!category) {
      throw new AppError(
        'Categoria não encontrada.',
        404,
      );
    }
  }

  // Caso um novo slug tenha sido enviado, garante que
  // outro produto não esteja utilizando o mesmo valor.
  if (
    input.slug !== undefined &&
    input.slug !== product.slug
  ) {
    const existingProduct = await findProductBySlugRepository(input.slug);

    if (existingProduct) {
      throw new AppError(
        'Já existe um produto com este slug.',
        409,
      );
    }
  }

  return updateProductRepository(
    productId,
    {
      ...(input.categoryId !== undefined && {
        categoryId: input.categoryId,
      }),
      ...(input.name !== undefined && {
        name: input.name,
      }),
      ...(input.slug !== undefined && {
        slug: input.slug,
      }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.isActive !== undefined && {
        isActive: input.isActive,
      }),
    },
  );
}