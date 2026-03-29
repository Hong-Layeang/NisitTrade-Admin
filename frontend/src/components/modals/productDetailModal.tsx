import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DetailProductImage = {
    id?: number;
    image_url?: string;
};

export type DetailProduct = {
    id: number;
    title: string;
    category: string;
    price: number;
    status?: "Active" | "Sold";     // admin products
    reported?: boolean;              // user products
    createdAt: string;
    userId?: number;                 // user products only
    ownerRole?: string;              // admin products only
    ProductImages?: DetailProductImage[];
};

interface ProductDetailModalProps {
    open: boolean;
    product: DetailProduct | null;
    mode?: "admin" | "user";        // controls which fields to show
    onClose: () => void;
    /** Optional: open edit modal directly from detail */
    onEdit?: (product: DetailProduct) => void;
    /** Optional: open delete confirm from detail */
    onDelete?: (product: DetailProduct) => void;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return "—";
    try {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateStr));
    } catch {
        return dateStr;
    }
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    open,
    product,
    mode = "admin",
    onClose,
    onEdit,
    onDelete,
}) => {
    const [imgIdx, setImgIdx] = useState(0);

    if (!open || !product) return null;

    const images = (product.ProductImages ?? []).filter(
        (img) => img.image_url && /^https?:\/\//i.test(img.image_url)
    );
    const activeImage = images[imgIdx]?.image_url;

    const isActive = product.status === "Active";
    const isReported = !!product.reported;

    const idPrefix = mode === "admin"
        ? product.ownerRole === "admin" ? "AP" : "UP"
        : "UP";

    // Stat row helper
    const Stat = ({ label, value, mono = false, className = "" }: {
        label: string;
        value: React.ReactNode;
        mono?: boolean;
        className?: string;
    }) => (
        <div className={`flex flex-col gap-0.5 ${className}`}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
            <span className={`text-sm font-medium text-slate-800 dark:text-slate-100 ${mono ? "font-mono" : ""}`}>{value}</span>
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand/10">
                            <i className="bi bi-box-seam text-brand text-sm" />
                        </span>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">Product Detail</h3>
                            <p className="text-[10px] text-slate-400 font-mono">{idPrefix}{product.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 grid place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                    >
                        <i className="bi bi-x-lg text-xs" />
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <div className="overflow-y-auto flex-1">

                    {/* Image gallery */}
                    <div className="relative bg-slate-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                        {activeImage ? (
                            <img
                                src={activeImage}
                                alt={product.title}
                                className="w-full h-56 object-contain"
                            />
                        ) : (
                            <div className="w-full h-44 flex flex-col items-center justify-center gap-2 text-slate-300 dark:text-slate-600">
                                <i className="bi bi-image text-4xl" />
                                <span className="text-xs">No image available</span>
                            </div>
                        )}

                        {/* Image count badge */}
                        {images.length > 0 && (
                            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold">
                                {imgIdx + 1} / {images.length}
                            </span>
                        )}

                        {/* Nav arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                                    disabled={imgIdx === 0}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                >
                                    <i className="bi bi-chevron-left text-xs" />
                                </button>
                                <button
                                    onClick={() => setImgIdx((i) => Math.min(images.length - 1, i + 1))}
                                    disabled={imgIdx === images.length - 1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                >
                                    <i className="bi bi-chevron-right text-xs" />
                                </button>
                            </>
                        )}

                        {/* Thumbnail strip */}
                        {images.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setImgIdx(i)}
                                        className={`w-10 h-10 rounded-md border-2 overflow-hidden transition-all ${i === imgIdx ? "border-brand scale-105" : "border-white/60 dark:border-gray-700 opacity-70 hover:opacity-100"}`}
                                    >
                                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product info */}
                    <div className="px-5 py-4 space-y-4">

                        {/* Title + badges row */}
                        <div className="flex items-start justify-between gap-3">
                            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug flex-1">
                                {product.title}
                            </h2>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                {/* Admin: status badge */}
                                {mode === "admin" && product.status && (
                                    <span className={
                                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset " +
                                        (isActive
                                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-500/20"
                                            : "bg-slate-100 text-slate-500 ring-slate-400/20 dark:bg-gray-800 dark:text-slate-400 dark:ring-slate-600/20")
                                    }>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                                        {product.status}
                                    </span>
                                )}
                                {/* User: reported badge */}
                                {mode === "user" && (
                                    <span className={
                                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset " +
                                        (isReported
                                            ? "bg-red-50 text-red-700 ring-red-300 dark:bg-red-900/20 dark:text-red-300 dark:ring-red-800"
                                            : "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-gray-800 dark:text-slate-400 dark:ring-slate-700")
                                    }>
                                        <i className={`bi bi-flag${isReported ? "-fill" : ""} text-[9px]`} />
                                        {isReported ? "Reported" : "Clean"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Price highlight */}
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-brand/5 dark:bg-brand/10 border border-brand/10 dark:border-brand/20">
                            <i className="bi bi-tag-fill text-brand text-sm" />
                            <span className="text-xl font-bold text-brand tabular-nums">
                                ${product.price.toLocaleString()}
                            </span>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700">
                                <Stat label="Category" value={product.category} />
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700">
                                <Stat label="Product ID" value={`${idPrefix}${product.id}`} mono />
                            </div>
                            {mode === "user" && product.userId !== undefined && (
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700">
                                    <Stat label="User ID" value={`#${product.userId}`} mono />
                                </div>
                            )}
                            <div className={`p-3 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 ${mode === "user" && product.userId !== undefined ? "" : "col-span-2"}`}>
                                <Stat
                                    label="Listed On"
                                    value={formatDate(product.createdAt)}
                                    className=""
                                />
                            </div>
                        </div>

                        {/* Image count info */}
                        {images.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                                <i className="bi bi-images" />
                                {images.length} image{images.length !== 1 ? "s" : ""} attached
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer actions ── */}
                <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 flex gap-2 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Close
                    </button>

                    {onDelete && (
                        <button
                            onClick={() => { onClose(); onDelete(product); }}
                            className="px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-300 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                        >
                            <i className="bi bi-trash mr-1.5 text-xs" />
                            Delete
                        </button>
                    )}

                    {onEdit && mode === "admin" && (
                        <button
                            onClick={() => { onClose(); onEdit(product); }}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-brand text-sm font-semibold text-white hover:opacity-90 active:opacity-80 transition-opacity shadow-sm"
                        >
                            <i className="bi bi-pencil mr-1.5 text-xs" />
                            Edit Product
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;