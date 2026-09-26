import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';
import { getProductById, getProducts } from '@/services/product-service';

vi.mock('@/lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

describe('product-service', () => {
    it('deve buscar os produtos ativos', async () => {
        const products = [
            {
                id: 1,
                name: 'Top Essential',
                slug: 'top-essential',
            },
        ];

        vi.mocked(api.get).mockResolvedValueOnce({
            data: products,
        });

        const result = await getProducts();

        expect(api.get).toHaveBeenCalledWith('/products');
        expect(result).toEqual(products);
    });

    it('deve buscar um produto pelo ID', async () => {
        const product = {
            id: 1,
            name: 'Top Essential',
            slug: 'top-essential',
        };

        vi.mocked(api.get).mockResolvedValueOnce({
            data: product,
        });

        const result = await getProductById(1);

        expect(api.get).toHaveBeenCalledWith('/products/1');
        expect(result).toEqual(product);
    });
});