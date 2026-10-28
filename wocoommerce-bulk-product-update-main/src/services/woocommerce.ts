import axios, { type AxiosInstance } from 'axios';
import type { AuthCredentials } from '../types/auth';
import type { Product } from '../types/product';

export const createWooCommerceClient = ({ storeUrl, consumerKey, consumerSecret }: AuthCredentials): AxiosInstance => {
    // Ensure protocol
    let baseURL = storeUrl;
    if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
        baseURL = `https://${baseURL}`;
    }
    // Remove trailing slash
    baseURL = baseURL.replace(/\/$/, '');

    // Append API root
    baseURL = `${baseURL}/wp-json/wc/v3`;

    // Base64 encode credentials
    const authHeader = `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`;

    const client = axios.create({
        baseURL,
        headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
        },
    });

    return client;
};

export const createProduct = async (config: AuthCredentials, data: Partial<Product>) => {
    const client = createWooCommerceClient(config);
    const response = await client.post<Product>('/products', data);
    return response.data;
};

export const updateProduct = async (config: AuthCredentials, id: number, data: Partial<Product>) => {
    const client = createWooCommerceClient(config);
    const response = await client.put<Product>(`/products/${id}`, data);
    return response.data;
};

export const batchUpdateProducts = async (config: AuthCredentials, data: { update: Partial<Product>[] }) => {
    const client = createWooCommerceClient(config);
    const response = await client.post('/products/batch', data);
    return response.data;
};

// WP REST API for Media (Not WC API, but standard WP API)
export const getMedia = async (config: AuthCredentials, page = 1, perPage = 20, search = '') => {
    const client = createWooCommerceClient(config);
    // Note: WC Client usually prefixes /wc/v3, but media is /wp/v2
    // We need to override the baseURL or use absolute URL if the helper locks it.
    // The current createWooCommerceClient logic sets baseURL to /wp-json/wc/v3.
    // We need to adjust calls to point to /wp-json/wp/v2/media.

    // Actually, let's just use ".." to go up, or better, make the client base URL just /wp-json and append path.
    // But refactoring that might break existing calls. 
    // Let's use the full relative path from the domain root if axios allows, or parent path.

    // The current client baseURL is `${storeUrl}/wp-json/wc/v3`
    // So `../../wp/v2/media` should work.
    const response = await client.get('/../../wp/v2/media', {
        params: {
            page,
            per_page: perPage,
            search,
            media_type: 'image'
        }
    });
    return {
        data: response.data,
        total: parseInt(response.headers['x-wp-total'] || '0', 10),
        totalPages: parseInt(response.headers['x-wp-totalpages'] || '0', 10)
    };
};

export const uploadMedia = async (config: AuthCredentials, file: File) => {
    const client = createWooCommerceClient(config);
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/../../wp/v2/media', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            // Axios will set boundary automatically with FormData, but we need to ensure Auth header is kept.
            // The interceptor or default header handles Auth.
            // But 'Content-Type': 'application/json' might be set as default?
            // createWooCommerceClient sets 'Content-Type': 'application/json'. 
            // We need to override it.
        }
    });
    return response.data;
};

// Helper to check connection
export const checkConnection = async (credentials: AuthCredentials): Promise<boolean> => {
    try {
        const client = createWooCommerceClient(credentials);
        // Fetch system status or just 1 product to verify
        await client.get('/products', { params: { per_page: 1 } });
        return true;
    } catch (error) {
        console.error('Connection check failed:', error);
        return false;
    }
};
