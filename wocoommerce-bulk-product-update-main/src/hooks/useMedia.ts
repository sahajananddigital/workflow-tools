import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../features/auth/AuthContext';
import { getMedia, uploadMedia } from '../services/woocommerce';

export const useMedia = (page: number, search: string) => {
    const { storeUrl, consumerKey, consumerSecret, isAuthenticated } = useAuth();

    // Construct credentials object strictly if authenticated
    const credentials = isAuthenticated ? { storeUrl, consumerKey, consumerSecret } : null;

    return useQuery({
        queryKey: ['media', page, search],
        queryFn: () => getMedia(credentials!, page, 20, search),
        enabled: !!credentials,
        placeholderData: (previousData) => previousData,
    });
};

export const useUploadMedia = () => {
    const { storeUrl, consumerKey, consumerSecret, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const credentials = isAuthenticated ? { storeUrl, consumerKey, consumerSecret } : null;

    return useMutation({
        mutationFn: (file: File) => uploadMedia(credentials!, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
        },
    });
};
