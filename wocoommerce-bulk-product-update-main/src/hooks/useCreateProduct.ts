import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../features/auth/AuthContext';
import { createProduct } from '../services/woocommerce';
import type { Product } from '../types/product';

export const useCreateProduct = () => {
    const { storeUrl, consumerKey, consumerSecret, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const credentials = isAuthenticated ? { storeUrl, consumerKey, consumerSecret } : null;

    return useMutation({
        mutationFn: (data: Partial<Product>) => {
            if (!credentials) throw new Error('Not authenticated');
            return createProduct(credentials, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};
