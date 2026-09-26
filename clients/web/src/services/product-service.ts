import { api } from '@/lib/api';
import type { Product } from '@/types/product';

/**
 * Busca os produtos ativos disponíveis no catálogo.
 *
 * O backend já retorna as variantes ativas junto com
 * tamanho, cor e categoria, evitando novas requisições
 * para cada produto exibido.
 */
export async function getProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products');

    return response.data;
}

/**
 * Busca um produto específico pelo seu identificador.
 *
 * As variantes ativas e seus dados de tamanho e cor
 * são retornados pelo backend junto com o produto.
 */
export async function getProductById(
    productId: number,
): Promise<Product> {
    const response = await api.get<Product>(`/products/${productId}`);

    return response.data;
}