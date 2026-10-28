import React, { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { useCreateProduct } from '../../../hooks/useCreateProduct';
import type { Product } from '../../../types/product';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'simple' | 'variable'>('simple');
    const [regularPrice, setRegularPrice] = useState('');
    const [sku, setSku] = useState('');

    const createProductMutation = useCreateProduct();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newProduct: Partial<Product> = {
            name,
            type,
            regular_price: regularPrice,
            sku
        };

        createProductMutation.mutate(newProduct, {
            onSuccess: () => {
                onClose();
                // Reset form
                setName('');
                setRegularPrice('');
                setSku('');
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Product">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '400px' }}>
                <div className="form-group">
                    <label>Product Name <span className="required">*</span></label>
                    <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        placeholder="e.g. Blue T-Shirt"
                    />
                </div>

                <div className="form-group">
                    <label>Product Type</label>
                    <select
                        className="form-input"
                        value={type}
                        onChange={e => setType(e.target.value as 'simple' | 'variable')}
                    >
                        <option value="simple">Simple Product</option>
                        <option value="variable">Variable Product</option>
                    </select>
                </div>

                <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Regular Price ({type === 'variable' ? 'Base' : ''})</label>
                        <input
                            type="text"
                            className="form-input"
                            value={regularPrice}
                            onChange={e => setRegularPrice(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                        <label>SKU</label>
                        <input
                            type="text"
                            className="form-input"
                            value={sku}
                            onChange={e => setSku(e.target.value)}
                            placeholder="Optional"
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={createProductMutation.isPending || !name}
                    >
                        {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
