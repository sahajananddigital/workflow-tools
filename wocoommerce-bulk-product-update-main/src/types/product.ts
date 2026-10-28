export interface Product {
    id: number;
    name: string;
    slug: string;
    permalink: string;
    type: 'simple' | 'variable' | 'grouped' | 'external';
    status: 'publish' | 'draft' | 'pending' | 'private';
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    stock_quantity: number | null;
    stock_status: 'instock' | 'outofstock' | 'onbackorder';
    manage_stock: boolean;
    images: { id: number; src: string; alt: string }[];
    meta_data: { id?: number; key: string; value: any }[];
    short_description: string;
    description: string;
}

export interface ProductsResponse {
    products: Product[];
    total: number;
    totalPages: number;
}
