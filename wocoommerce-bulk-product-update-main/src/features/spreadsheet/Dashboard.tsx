import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { ProductTable } from './components/ProductTable';
import { useAuth } from '../auth/AuthContext';
import { LogOut, Plus } from 'lucide-react';
import { AddProductModal } from '../products/components/AddProductModal';
import './Spreadsheet.css';

export const Dashboard: React.FC = () => {
    const { logout, storeUrl } = useAuth();
    const [page, setPage] = useState(1);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const { data, isLoading } = useProducts({ page });

    return (
        <div className="container" style={{ maxWidth: '100%', padding: '0' }}>
            <header className="toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Bulk Editor</h1>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{storeUrl}</span>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => setIsAddProductOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', height: '30px' }}
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <a
                        href="/wocoommerce-bulk-product-update/docs/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', color: 'var(--color-text)' }}
                        title="View Documentation"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg> Help
                    </a>

                    <div style={{ fontSize: '0.875rem' }}>
                        Page {page} of {data?.totalPages || 1}
                    </div>
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.5rem' }}
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => setPage((p) => (data?.totalPages && p < data.totalPages ? p + 1 : p))}
                        disabled={!data?.totalPages || page >= data.totalPages}
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.5rem' }}
                    >
                        Next
                    </button>
                    <button
                        onClick={logout}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <div style={{ padding: '1rem' }}>
                <ProductTable data={data?.products || []} isLoading={isLoading} />

                <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    Powered by <a href="https://sahajananddigital.in" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>Sahajanand Digital</a>
                </div>
            </div>

            <AddProductModal
                isOpen={isAddProductOpen}
                onClose={() => setIsAddProductOpen(false)}
            />
        </div>
    );
};
