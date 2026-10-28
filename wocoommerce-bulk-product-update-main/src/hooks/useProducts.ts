import { useQuery } from '@tanstack/react-query';
import { createWooCommerceClient } from '../services/woocommerce';
import { useAuth } from '../features/auth/AuthContext';
import type { Product } from '../types/product';

interface UseProductsParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
}

export const useProducts = ({ page = 1, per_page = 20, search = '', status = '' }: UseProductsParams) => {
    const auth = useAuth();

    return useQuery({
        queryKey: ['products', page, per_page, search, status],
        queryFn: async () => {
            const client = createWooCommerceClient(auth);
            const params: any = { page, per_page };
            if (search) params.search = search;
            if (status) params.status = status;

            const response = await client.get<Product[]>('/products', { params });

            const total = parseInt(response.headers['x-wp-total'] || '0', 10);
            const totalPages = parseInt(response.headers['x-wp-totalpages'] || '0', 10);

            return {
                products: response.data,
                total,
                totalPages
            };
        },
        enabled: auth.isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
