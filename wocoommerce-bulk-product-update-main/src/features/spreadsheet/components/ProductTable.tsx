import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
} from '@tanstack/react-table';
import { Settings } from 'lucide-react';
import type { Product } from '../../../types/product';
import { EditableCell } from './EditableCell';
import { BulkActionToolbar } from './BulkActionToolbar';
import { MetaEditor } from '../../products/components/MetaEditor';
import { DescriptionEditor } from '../../products/components/DescriptionEditor';
import { ImageManagerModal } from '../../products/components/ImageManagerModal';
import '../Spreadsheet.css';

interface ProductTableProps {
    data: Product[];
    isLoading: boolean;
}

export const ProductTable: React.FC<ProductTableProps> = ({ data, isLoading }) => {
    const [rowSelection, setRowSelection] = useState({});
    const [editingMetaProduct, setEditingMetaProduct] = useState<Product | null>(null);
    const [editingDescProduct, setEditingDescProduct] = useState<Product | null>(null);
    const [editImages, setEditImages] = useState<{ productId: number; currentImages: { id: number; src: string }[]; isOpen: boolean }>({
        productId: 0,
        currentImages: [],
        isOpen: false
    });

    const onEditImages = (productId: number, images: { id: number; src: string }[]) => {
        setEditImages({
            productId,
            currentImages: images || [],
            isOpen: true
        });
    };

    const columns = React.useMemo<ColumnDef<Product>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <input
                        type="checkbox"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                    />
                ),
                size: 40,
            },
            {
                accessorKey: 'id',
                header: 'ID',
                size: 60,
            },
            {
                accessorKey: 'images',
                header: 'Image',
                cell: info => {
                    const images = info.getValue() as Product['images'];
                    const src = images && images.length > 0 ? images[0].src : null;
                    return (
                        <div
                            onClick={() => onEditImages(info.row.original.id, images || [])}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                backgroundColor: '#f0f0f1',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Click to manage images"
                        >
                            {src ? (
                                <img src={src} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '10px', color: '#888' }}>img</span>
                            )}
                        </div>
                    );
                },
                size: 60,
                enableSorting: false,
            },
            {
                accessorKey: 'name',
                header: 'Name',
                cell: (info) => (
                    <EditableCell
                        id={info.row.original.id}
                        value={info.getValue() as string}
                        field="name"
                    />
                ),
            },
            {
                accessorKey: 'sku',
                header: 'SKU',
                cell: (info) => (
                    <EditableCell
                        id={info.row.original.id}
                        value={info.getValue() as string}
                        field="sku"
                    />
                ),
            },
            {
                accessorKey: 'regular_price',
                header: 'Reg. Price',
                cell: (info) => (
                    <EditableCell
                        id={info.row.original.id}
                        value={info.getValue() as string}
                        field="regular_price"
                    />
                ),
            },
            {
                accessorKey: 'sale_price',
                header: 'Sale Price',
                cell: (info) => (
                    <EditableCell
                        id={info.row.original.id}
                        value={info.getValue() as string}
                        field="sale_price"
                    />
                ),
            },
            {
                accessorKey: 'stock_quantity',
                header: 'Stock',
                cell: (info) => (
                    <EditableCell
                        id={info.row.original.id}
                        value={info.getValue() as number}
                        field="stock_quantity"
                        type="number"
                    />
                ),
            },

            {
                accessorKey: 'status',
                header: 'Status',
                cell: (info) => {
                    const status = info.getValue() as string;
                    return <span className={`status-badge status-${status}`}>{status}</span>;
                },
            },
            {
                id: 'meta',
                header: 'Meta',
                cell: ({ row }) => (
                    <button
                        className="btn-icon"
                        onClick={() => setEditingMetaProduct(row.original)}
                        title="Edit Meta Fields"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                    >
                        <Settings size={18} />
                    </button>
                ),
                size: 50,
            },
            {
                id: 'content',
                header: 'Content',
                cell: ({ row }) => (
                    <button
                        className="btn-primary"
                        onClick={() => setEditingDescProduct(row.original)}
                        style={{ fontSize: '11px', padding: '2px 6px', height: 'auto' }}
                    >
                        Edit
                    </button>
                ),
                size: 70,
            },
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        state: {
            rowSelection,
        },
        onRowSelectionChange: setRowSelection,
        getRowId: (row) => row.id.toString(),
    });

    if (isLoading) {
        return <div className="p-4">Loading products...</div>;
    }

    const selectedIds = Object.keys(rowSelection).map((id) => parseInt(id, 10));

    return (
        <div className="spreadsheet-container">
            <BulkActionToolbar
                selectedIds={selectedIds}
                onClearSelection={() => setRowSelection({})}
            />

            <table className="spreadsheet-table">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} style={{ width: header.getSize() }}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingMetaProduct && (
                <MetaEditor
                    productId={editingMetaProduct.id}
                    initialMeta={editingMetaProduct.meta_data}
                    isOpen={true}
                    onClose={() => setEditingMetaProduct(null)}
                />
            )}

            {editingDescProduct && (
                <DescriptionEditor
                    productId={editingDescProduct.id}
                    initialDescription={editingDescProduct.description}
                    initialShortDescription={editingDescProduct.short_description}
                    isOpen={true}
                    onClose={() => setEditingDescProduct(null)}
                />
            )}
            {editImages.isOpen && (
                <ImageManagerModal
                    productId={editImages.productId}
                    currentImages={editImages.currentImages}
                    isOpen={editImages.isOpen}
                    onClose={() => setEditImages({ ...editImages, isOpen: false })}
                />
            )}
        </div >
    );
};
