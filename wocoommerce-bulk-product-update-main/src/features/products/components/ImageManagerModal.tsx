import React, { useState } from 'react';
import { useMedia, useUploadMedia } from '../../../hooks/useMedia';
import { Modal } from '../../../components/Modal';
import { Check, Upload, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import './ImageManagerModal.css';
import { useUpdateProduct } from '../../../hooks/useUpdateProduct';
import type { MediaItem } from '../../../types/media';

interface ImageManagerModalProps {
    productId: number;
    currentImages: { id: number; src: string }[];
    isOpen: boolean;
    onClose: () => void;
}

export const ImageManagerModal: React.FC<ImageManagerModalProps> = ({ productId, currentImages, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
    const [selectedImages, setSelectedImages] = useState<number[]>(currentImages.map(img => img.id));
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data: mediaData, isLoading } = useMedia(page, search);
    const uploadMutation = useUploadMedia();
    const updateProduct = useUpdateProduct();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        multiple: true,
        onDrop: (acceptedFiles) => {
            acceptedFiles.forEach(file => {
                uploadMutation.mutate(file, {
                    onSuccess: (data: MediaItem) => {
                        // Auto select uploaded image
                        setSelectedImages(prev => [...prev, data.id]);
                        setActiveTab('library');
                    }
                });
            });
        }
    });

    const toggleSelection = (id: number) => {
        if (selectedImages.includes(id)) {
            setSelectedImages(selectedImages.filter(imgId => imgId !== id));
        } else {
            // If strictly single image per product? No, WC supports gallery.
            // But usually first is featured.
            setSelectedImages([...selectedImages, id]);
        }
    };

    const handleSave = () => {
        // Map selected IDs to the format expected by WC API: { id: 123 }
        const imagesPayload = selectedImages.map(id => ({ id }));

        updateProduct.mutate(
            { id: productId, images: imagesPayload as any },
            {
                onSuccess: () => {
                    onClose();
                }
            }
        );
    };

    // Note: useMedia hook currently resets data on page change (simple query). 
    // To implement "Load More", we'd need infinite query.
    // For MVP, lets just do simple pagination buttons or keep it simple page 1.
    // Let's switch to simple "Next/Prev" if we don't do infinite scroll, 
    // or just let the user search.

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Product Images">
            <div className="image-manager-modal">
                <div className="image-manager-tabs">
                    <div
                        className={`image-manager-tab ${activeTab === 'library' ? 'active' : ''}`}
                        onClick={() => setActiveTab('library')}
                    >
                        Media Library
                    </div>
                    <div
                        className={`image-manager-tab ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        Upload Files
                    </div>
                </div>

                <div className="image-manager-content">
                    {activeTab === 'upload' ? (
                        <div {...getRootProps()} className={`upload-area ${isDragActive ? 'dragging' : ''}`}>
                            <input {...getInputProps()} />
                            <Upload size={48} />
                            {isDragActive ? (
                                <p>Drop the files here ...</p>
                            ) : (
                                <p>Drag 'n' drop some files here, or click to select files</p>
                            )}
                            {uploadMutation.isPending && <p>Uploading...</p>}
                        </div>
                    ) : (
                        <div>
                            <input
                                className="form-input"
                                placeholder="Search media..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ marginBottom: '1rem', width: '100%' }}
                            />

                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <div className="media-grid">
                                    {mediaData?.data.map((item: MediaItem) => (
                                        <div
                                            key={item.id}
                                            className={`media-item ${selectedImages.includes(item.id) ? 'selected' : ''}`}
                                            onClick={() => toggleSelection(item.id)}
                                        >
                                            <img
                                                src={item.media_details?.sizes?.thumbnail?.source_url || item.source_url}
                                                alt={item.alt_text}
                                            />
                                            {selectedImages.includes(item.id) && (
                                                <div className="media-check"><Check size={12} /></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between p-4 border-t mt-4">
                                <button
                                    className="btn-secondary"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    Previous
                                </button>
                                <span>Page {page} of {mediaData?.totalPages || 1}</span>
                                <button
                                    className="btn-secondary"
                                    disabled={page >= (mediaData?.totalPages || 1)}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSave} style={{ width: 'auto' }}>
                        {updateProduct.isPending ? 'Saving...' : `Set Product Images (${selectedImages.length})`}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
