import React, { useState, useEffect } from "react";

type Category = string;
type Status = "Active" | "Sold";

export type ProductImage = {
    id?: number;
    image_url?: string;
    product_id?: number;
};

export type Product = {
    id: number;
    title: string;
    category: Category;
    price: number;
    status: Status;
    createdAt: string;
    ProductImages?: ProductImage[];
};

interface EditProductModalProps {
    open: boolean;
    product: Product | null;
    categories: Category[];
    onClose: () => void;
    onSubmit: (updated: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
    open,
    product,
    categories,
    onClose,
    onSubmit,
}) => {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<Category>(categories[0] || "");
    const [price, setPrice] = useState<number>(0);
    const [status, setStatus] = useState<Status>("Active");

    useEffect(() => {
        if (product) {
            setTitle(product.title);
            setCategory(product.category);
            setPrice(product.price);
            setStatus(product.status);
        }
    }, [product]);

    useEffect(() => {
        if (!product && categories.length > 0) setCategory(categories[0]);
    }, [categories, product]);

    if (!open || !product) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...product, title, category, price, status });
    };

    const primaryImage = product.ProductImages?.[0]?.image_url;
    const hasImage = primaryImage && /^https?:\/\//i.test(primaryImage);
    const isActive = status === "Active";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg overflow-hidden">

                {/* Hero image strip */}
                <div className="relative h-28 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-750 overflow-hidden">
                    {hasImage && (
                        <img
                            src={primaryImage}
                            alt={product.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-20"
                        />
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-transparent to-transparent" />

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full bg-white/80 dark:bg-gray-800/80 text-slate-500 dark:text-slate-300 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors backdrop-blur-sm"
                    >
                        <i className="bi bi-x-lg text-xs" />
                    </button>

                    {/* Product ID badge */}
                    <span className="absolute top-3 left-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-xs font-mono text-slate-500 dark:text-slate-400">
                        #{product.id}
                    </span>

                    {/* Product thumbnail */}
                    <div className="absolute bottom-0 left-4 translate-y-1/2">
                        {hasImage ? (
                            <img
                                src={primaryImage}
                                alt={product.title}
                                className="w-16 h-16 object-cover rounded-xl border-2 border-white dark:border-gray-900 shadow-lg"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl border-2 border-white dark:border-gray-900 shadow-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                                <i className="bi bi-image text-slate-300 dark:text-slate-600 text-xl" />
                            </div>
                        )}
                    </div>

                    {/* Status pill in header */}
                    <div className="absolute bottom-3 right-4">
                        <span className={
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset " +
                            (isActive
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-500/20"
                                : "bg-slate-100 text-slate-500 ring-slate-400/20 dark:bg-gray-800 dark:text-slate-400 dark:ring-slate-600/20")
                        }>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                            {status}
                        </span>
                    </div>
                </div>

                {/* Form body */}
                <div className="pt-12 px-5 pb-5">
                    {/* Title */}
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-0.5 truncate">
                        Editing: <span className="text-brand">{product.title}</span>
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Update the fields below and save your changes.</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {/* Title field */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                                Product Title <span className="text-red-400">*</span>
                            </label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. iPhone 15 Pro Max"
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-colors"
                            />
                        </div>

                        {/* Category + Status row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                                    Category <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as Category)}
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-colors"
                                >
                                    {categories.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as Status)}
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-colors"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Sold">Sold</option>
                                </select>
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                                Price <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500">$</span>
                                <input
                                    required
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2.5 rounded-lg bg-brand text-sm font-semibold text-white hover:opacity-90 active:opacity-80 transition-opacity shadow-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;