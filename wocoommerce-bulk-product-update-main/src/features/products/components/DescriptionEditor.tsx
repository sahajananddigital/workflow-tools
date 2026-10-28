import React, { useState, useEffect } from 'react';
import { useUpdateProduct } from '../../../hooks/useUpdateProduct';
import { Modal } from '../../../components/Modal';
import { RichTextEditor } from '../../../components/RichTextEditor';
import { sanitizeHtml } from '../../../utils/sanitize';

interface DescriptionEditorProps {
    productId: number;
    initialDescription: string;
    initialShortDescription: string;
    isOpen: boolean;
    onClose: () => void;
}

export const DescriptionEditor: React.FC<DescriptionEditorProps> = ({
    productId,
    initialDescription,
    initialShortDescription,
    isOpen,
    onClose
}) => {
    const [description, setDescription] = useState(initialDescription);
    const [shortDescription, setShortDescription] = useState(initialShortDescription);
    const updateProduct = useUpdateProduct();

    useEffect(() => {
        if (isOpen) {
            setDescription(initialDescription || '');
            setShortDescription(initialShortDescription || '');
        }
    }, [isOpen, initialDescription, initialShortDescription]);

    const handleSave = () => {
        updateProduct.mutate(
            {
                id: productId,
                description: sanitizeHtml(description),
                short_description: sanitizeHtml(shortDescription)
            },
            {
                onSuccess: () => {
                    onClose();
                }
            }
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Content (ID: ${productId})`}>
            <div className="flex flex-col gap-6" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>

                <RichTextEditor
                    label="Short Description"
                    value={shortDescription}
                    onChange={setShortDescription}
                    height="150px"
                />

                <RichTextEditor
                    label="Main Description"
                    value={description}
                    onChange={setDescription}
                    height="250px"
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <button
                        onClick={onClose}
                        style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSave} style={{ width: 'auto' }}>
                        {updateProduct.isPending ? 'Saving...' : 'Save Content'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
