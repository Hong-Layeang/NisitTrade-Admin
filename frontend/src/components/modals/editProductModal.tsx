import React, { useState, useEffect } from "react";

type Category = "Electronic" | "Clothing" | "Accessory";
type Status = "Active" | "Sold";

export type Product = {
    id: number;
    title: string;
    category: Category;
    price: number;
    status: Status;
    createdAt: string;
};

interface EditProductModalProps {
    open: boolean;
    product: Product | null;
    onClose: () => void;
    onSubmit: (updated: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ open, product, onClose, onSubmit }) => {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<Category>("Electronic");
    const [price, setPrice] = useState<number>(0);
    const [status, setStatus] = useState<Status>("Active");

    // Sync form fields whenever the target product changes
    useEffect(() => {
        if (product) {
            setTitle(product.title);
            setCategory(product.category);
            setPrice(product.price);
            setStatus(product.status);
        }
    }, [product]);

    if (!open || !product) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...product, title, category, price, status });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl w-full max-w-md mx-4 p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Edit Product</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 grid place-items-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Product ID — read only */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Product ID</label>
                        <input
                            disabled
                            value={product.id}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-400 px-3 py-2 text-sm cursor-not-allowed"
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Product Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Category)}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                        >
                            <option value="Electronic">Electronic</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Accessory">Accessory</option>
                        </select>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Price ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="number"
                            min={0}
                            step={0.01}
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as Status)}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                        >
                            <option value="Active">Active</option>
                            <option value="Sold">Sold</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-md bg-brand text-sm font-medium text-white hover:opacity-90"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;