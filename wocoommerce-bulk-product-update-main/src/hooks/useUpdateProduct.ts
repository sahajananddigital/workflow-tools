import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWooCommerceClient } from '../services/woocommerce';
import { useAuth } from '../features/auth/AuthContext';
import type { Product } from '../types/product';

export const useUpdateProduct = () => {
    const auth = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Partial<Product> & { id: number }) => {
            const client = createWooCommerceClient(auth);
            // Separate id from data
            const { id, ...data } = payload;
            const response = await client.put<Product>(`/products/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate products query to refetch or update cache optimistically
            // For now, simple invalidation
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};
