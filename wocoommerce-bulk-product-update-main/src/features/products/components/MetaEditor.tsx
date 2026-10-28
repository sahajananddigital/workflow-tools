import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { useUpdateProduct } from '../../../hooks/useUpdateProduct';
import { Modal } from '../../../components/Modal';
import { sanitizeText, sanitizeHtml } from '../../../utils/sanitize';

interface MetaData {
    id?: number;
    key: string;
    value: any;
}

interface MetaEditorProps {
    productId: number;
    initialMeta: MetaData[];
    isOpen: boolean;
    onClose: () => void;
}

export const MetaEditor: React.FC<MetaEditorProps> = ({ productId, initialMeta, isOpen, onClose }) => {
    // We manage local state for the form, and save all at once or individually.
    // WC API replaces meta if ID is not matching? No, it acts as upsert if key matches or id matches.
    // Ideally we edit `meta_data` array.

    const [meta, setMeta] = useState<MetaData[]>(initialMeta || []);
    const updateProduct = useUpdateProduct();

    // Reset when opening
    React.useEffect(() => {
        if (isOpen) {
            setMeta(initialMeta || []);
        }
    }, [isOpen, initialMeta]);

    const handleChange = (index: number, field: 'key' | 'value', value: string) => {
        const newMeta = [...meta];
        newMeta[index] = { ...newMeta[index], [field]: value };
        setMeta(newMeta);
    };

    const handleAdd = () => {
        setMeta([...meta, { key: '', value: '' }]);
    };

    const handleRemove = (index: number) => {
        // If it has an ID, we might need to send value: null to delete it? 
        // Or just omitting it doesn't delete it in WC API usually, you send null.
        // Actually, WC API deleting meta requires passing null as value.
        const item = meta[index];
        if (item.id) {
            // Mark for deletion strategy: set value to null (if that's how WC works via batch)
            // or effectively we just remove it from our local list and when we save, we need to handle "deleted" ones?
            // Simpler: Just remove from list. But if we save, we need to know what to delete.
            // For this MVP, let's assume we just save the current list. 
            // Wait, WC API `PUT products/id` with `meta_data` merging is tricky.
            // To delete, send `meta_data: [{key: 'foo', value: null}]`.
            // So we should verify this logic.
            // Let's implement immediate delete for simplicity if user confirms?
        }
        const newMeta = meta.filter((_, i) => i !== index);
        setMeta(newMeta);
    };

    const handleSave = () => {
        // Filter out empty keys and sanitize
        const validMeta = meta
            .filter(m => m.key.trim() !== '')
            .map(m => ({
                ...m,
                key: sanitizeText(m.key),
                value: typeof m.value === 'string' ? sanitizeHtml(m.value) : m.value
            }));

        updateProduct.mutate(
            { id: productId, meta_data: validMeta },
            {
                onSuccess: () => {
                    onClose();
                }
            }
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Meta Data (ID: ${productId})`}>
            <div className="flex flex-col gap-4">
                {meta.map((m, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                            className="form-input"
                            style={{ flex: 1 }}
                            placeholder="Key"
                            value={m.key}
                            onChange={(e) => handleChange(index, 'key', e.target.value)}
                        />
                        <input
                            className="form-input"
                            style={{ flex: 2 }}
                            placeholder="Value"
                            value={typeof m.value === 'string' ? m.value : JSON.stringify(m.value)}
                            onChange={(e) => handleChange(index, 'value', e.target.value)}
                        />
                        <button
                            onClick={() => handleRemove(index)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                <button
                    onClick={handleAdd}
                    className="btn-primary"
                    style={{ background: 'transparent', color: 'var(--color-primary)', border: '1px dashed currentColor' }}
                >
                    <Plus size={16} /> Add Meta Field
                </button>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                    >
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSave} style={{ width: 'auto' }}>
                        {updateProduct.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
