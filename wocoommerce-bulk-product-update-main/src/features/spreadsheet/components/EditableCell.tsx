import React, { useState, useEffect } from 'react';
import { useUpdateProduct } from '../../../hooks/useUpdateProduct';
import '../Spreadsheet.css';
import { sanitizeText } from '../../../utils/sanitize';

interface EditableCellProps {
    id: number;
    value: string | number;
    field: string;
    type?: 'text' | 'number';
}

export const EditableCell: React.FC<EditableCellProps> = ({ id, value: initialValue, field, type = 'text' }) => {
    const [value, setValue] = useState(initialValue);
    const updateProduct = useUpdateProduct();

    // Sync with external updates
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const onBlur = () => {
        if (value !== initialValue) {
            let cleanValue = value;
            if (typeof value === 'string' && field !== 'description' && field !== 'short_description') {
                cleanValue = sanitizeText(value);
            }

            updateProduct.mutate({ id, [field]: cleanValue });
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <input
            className="cell-input"
            type={type}
            value={value ?? ''}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
        />
    );
};
