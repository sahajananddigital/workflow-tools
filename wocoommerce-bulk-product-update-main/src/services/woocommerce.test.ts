import { describe, it, expect, vi } from 'vitest';
import { createWooCommerceClient, createProduct } from './woocommerce';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => {
    const mockPost = vi.fn();
    const mockGet = vi.fn();
    return {
        default: {
            create: vi.fn(() => ({
                defaults: { headers: {}, baseURL: '' },
                post: mockPost,
                get: mockGet,
            })),
        },
    };
});

describe('createWooCommerceClient', () => {
    it('should create an axios instance with correct baseURL', () => {
        const credentials = {
            storeUrl: 'example.com',
            consumerKey: 'ck_123',
            consumerSecret: 'cs_123',
        };
        const client = createWooCommerceClient(credentials);
        expect(client.defaults.baseURL).toBe('https://example.com/wp-json/wc/v3');
    });

    it('should handle storeUrl with http protocol', () => {
        const credentials = {
            storeUrl: 'http://local.test',
            consumerKey: 'ck_123',
            consumerSecret: 'cs_123',
        };
        const client = createWooCommerceClient(credentials);
        expect(client.defaults.baseURL).toBe('http://local.test/wp-json/wc/v3');
    });

    it('should correctly encode headers', () => {
        const credentials = {
            storeUrl: 'example.com',
            consumerKey: 'ck_123',
            consumerSecret: 'cs_123',
        };
        const client = createWooCommerceClient(credentials);
        expect(client.defaults.headers.Authorization).toContain('Basic Y2tfMTIzOmNzXzEyMw==');
    });
});

describe('Service Functions', () => {
    const mockCredentials = {
        storeUrl: 'example.com',
        consumerKey: 'ck_123',
        consumerSecret: 'cs_123',
        isAuthenticated: true
    };

    it('should create a product', async () => {
        const newProduct = { name: 'New Product', regular_price: '100' };
        const mockPost = axios.create().post as any;
        mockPost.mockResolvedValue({ data: { id: 123, ...newProduct } });

        const result = await createProduct(mockCredentials, newProduct);

        expect(result).toEqual({ id: 123, ...newProduct });
        expect(mockPost).toHaveBeenCalledWith('/products', newProduct);
    });
});
