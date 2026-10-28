import React, { useState } from 'react';
import { useBulkUpdateProducts } from '../../../hooks/useBulkUpdateProducts';

interface BulkActionToolbarProps {
    selectedIds: number[];
    onClearSelection: () => void;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({ selectedIds, onClearSelection }) => {
    const bulkUpdate = useBulkUpdateProducts();
    const [action, setAction] = useState('');
    const [value, setValue] = useState('');

    if (selectedIds.length === 0) return null;

    const handleApply = () => {
        if (!action) return;

        const updates = selectedIds.map(id => {
            const update: any = { id };

            if (action === 'increase_price_percent') {
                // This effectively requires fetching current price first OR relying on server logic if available (WC doesn't natively support "increase by %" in batch without logic).
                // For simplicity in this frontend-first approach, we might need a different strategy or just set fixed values.
                // However, Setary does "Increase by %". To do this properly without fetching all, we'd implies we normally have the data in the table.
                // But for batch endpoint, we need to send the final value.
                // So we can't easily do it without access to the current rows data.
                // Let's stick to "Set Status" or "Set Price" for MVP, or handle it if we have row data.
                return null;
            }

            if (action === 'set_status') {
                update.status = value;
            }

            if (action === 'set_stock_status') {
                update.stock_status = value;
            }

            return update;
        }).filter(Boolean);

        if (updates.length > 0) {
            bulkUpdate.mutate({ update: updates }, {
                onSuccess: () => {
                    onClearSelection();
                    setAction('');
                    setValue('');
                }
            });
        }
    };

    return (
        <div className="toolbar" style={{ background: 'hsl(var(--color-primary-light) / 0.5)', borderBottom: 'none' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{selectedIds.length} Selected</span>
                <select
                    className="form-input"
                    style={{ width: 'auto' }}
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                >
                    <option value="">Choose Action...</option>
                    <option value="set_status">Set Status</option>
                    <option value="set_stock_status">Set Stock Status</option>
                </select>

                {action === 'set_status' && (
                    <select
                        className="form-input"
                        style={{ width: 'auto' }}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    >
                        <option value="">Select...</option>
                        <option value="publish">Publish</option>
                        <option value="draft">Draft</option>
                        <option value="private">Private</option>
                    </select>
                )}

                {action === 'set_stock_status' && (
                    <select
                        className="form-input"
                        style={{ width: 'auto' }}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    >
                        <option value="">Select...</option>
                        <option value="instock">In Stock</option>
                        <option value="outofstock">Out of Stock</option>
                        <option value="onbackorder">On Backorder</option>
                    </select>
                )}

                <button className="btn-primary" style={{ width: 'auto', padding: '0.4rem 1rem' }} onClick={handleApply} disabled={!action || !value || bulkUpdate.isPending}>
                    {bulkUpdate.isPending ? 'Applying...' : 'Apply'}
                </button>
            </div>
        </div>
    );
};
