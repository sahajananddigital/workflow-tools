import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWooCommerceClient } from '../services/woocommerce';
import { useAuth } from '../features/auth/AuthContext';
import type { Product } from '../types/product';

interface BatchUpdatePayload {
    create?: Partial<Product>[];
    update?: (Partial<Product> & { id: number })[];
    delete?: number[];
}

export const useBulkUpdateProducts = () => {
    const auth = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: BatchUpdatePayload) => {
            const client = createWooCommerceClient(auth);
            const response = await client.post('/products/batch', payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};
