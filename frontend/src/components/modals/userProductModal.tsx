import React, { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
    id: number;
    title: string;
    userId: number;
    category: string;
    price: number;
    reported?: boolean;
    createdAt: string;
    ProductImages?: { id?: number; image_url?: string }[];
};

type Report = {
    id: number;
    reason: string;
    status: "open" | "reviewing" | "closed" | string;
    createdAt: string;
    reporterName?: string;
};

type Props = {
    open: boolean;
    product: Product | null;
    onClose: () => void;
    onProductDeleted: (productId: number) => void;
};

// ─── Inline fetch helper (no api.ts needed) ───────────────────────────────────

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers ?? {}),
        },
    });
    if (res.status === 204) return null as T;
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.message ?? `Error ${res.status}`);
    return body as T;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        open: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
        reviewing: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
        closed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    };
    const cls = map[status] ?? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls} capitalize`}>
            {status}
        </span>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const ProductReportModal: React.FC<Props> = ({ open, product, onClose, onProductDeleted }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (!open || !product) return;
        let isMounted = true;
        setReports([]);
        setLoadError("");
        setDeleteError("");
        setShowDeleteConfirm(false);

        const fetchReports = async () => {
            setIsLoading(true);
            try {
                const res = await apiFetch<{ total?: number; items?: any[] }>(
                    `/api/reports?reportable_type=product&reportable_id=${product.id}&limit=50`
                );
                if (!isMounted) return;
                const items: Report[] = (res?.items ?? []).map((r: any) => ({
                    id: Number(r.id),
                    reason: r.reason ?? "No reason provided",
                    status: r.status ?? "open",
                    createdAt: r.created_at ?? r.createdAt ?? "",
                    reporterName: r.Reporter?.name ?? r.Reporter?.email ?? undefined,
                }));
                setReports(items);
            } catch (err) {
                if (!isMounted) return;
                setLoadError(err instanceof Error ? err.message : "Failed to load reports");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchReports();
        return () => { isMounted = false; };
    }, [open, product]);

    const handleDeleteProduct = async () => {
        if (!product) return;
        setIsDeleting(true);
        setDeleteError("");
        try {
            await apiFetch<void>(`/api/products/${product.id}`, { method: "DELETE" });
            onProductDeleted(product.id);
            onClose();
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Failed to delete product");
            setIsDeleting(false);
        }
    };

    if (!open || !product) return null;

    const thumb = product.ProductImages?.[0]?.image_url ?? null;

    const formatDate = (str: string) => {
        if (!str) return "—";
        const d = new Date(str);
        return isNaN(d.getTime())
            ? str
            : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
            onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) onClose(); }}
        >
            <div
                className="relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: "90vh" }}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-red-600 via-rose-600 to-pink-700 px-6 pt-6 pb-5 text-white shrink-0">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors disabled:opacity-40"
                    >
                        <i className="bi bi-x-lg text-sm" />
                    </button>

                    <div className="flex items-start gap-4">
                        {thumb ? (
                            <img src={thumb} alt={product.title} className="h-16 w-16 rounded-xl object-cover border-2 border-white/30 shrink-0" />
                        ) : (
                            <div className="h-16 w-16 rounded-xl border-2 border-white/30 flex items-center justify-center bg-white/10 shrink-0">
                                <i className="bi bi-image text-white/60 text-xl" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1 pt-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <i className="bi bi-flag-fill text-white/80 text-xs" />
                                <span className="text-xs font-semibold tracking-widest uppercase text-white/70">Product Reports</span>
                            </div>
                            <h2 className="text-lg font-bold leading-tight text-white truncate">{product.title}</h2>
                            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-white/75">
                                <span><span className="opacity-60">ID</span> UP{product.id}</span>
                                <span><span className="opacity-60">User</span> {product.userId}</span>
                                <span><span className="opacity-60">Cat.</span> {product.category}</span>
                                <span><span className="opacity-60">Price</span> $ {product.price}</span>
                            </div>
                        </div>
                    </div>

                    {!isLoading && (
                        <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold text-white">
                            <i className="bi bi-exclamation-triangle-fill text-yellow-300" />
                            {reports.length} report{reports.length !== 1 ? "s" : ""} found
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="bg-white dark:bg-gray-900 flex-1 overflow-y-auto px-6 py-5 space-y-3">
                    {isLoading && (
                        <div className="flex items-center gap-3 py-8 justify-center text-slate-400 dark:text-slate-500">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            <span className="text-sm">Loading reports…</span>
                        </div>
                    )}

                    {!!loadError && (
                        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                            <i className="bi bi-exclamation-circle-fill mt-0.5 shrink-0" />
                            {loadError}
                        </div>
                    )}

                    {!isLoading && !loadError && reports.length === 0 && (
                        <div className="py-12 flex flex-col items-center text-slate-400 dark:text-slate-500 gap-2">
                            <i className="bi bi-check-circle text-3xl text-emerald-400" />
                            <p className="text-sm">No active reports for this product.</p>
                        </div>
                    )}

                    {!isLoading && reports.map((r, idx) => (
                        <div key={r.id} className="rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-gray-700">
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                    #{idx + 1} · Report ID {r.id}
                                </span>
                                <StatusBadge status={r.status} />
                            </div>
                            <div className="px-4 py-3 space-y-2">
                                <div>
                                    <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Reason</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{r.reason}</p>
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
                                    {r.reporterName && (
                                        <div>
                                            <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Reported by</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-300">{r.reporterName}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Date</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-300">{formatDate(r.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 px-6 py-4 shrink-0">
                    {!!deleteError && (
                        <div className="mb-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                            <i className="bi bi-exclamation-circle-fill mt-0.5 shrink-0" />
                            {deleteError}
                        </div>
                    )}

                    {!showDeleteConfirm ? (
                        <div className="flex items-center justify-between gap-3">
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isDeleting || isLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold disabled:opacity-40 transition-colors"
                            >
                                <i className="bi bi-trash3-fill text-xs" />
                                Delete Product
                            </button>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3">
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-3">
                                <i className="bi bi-exclamation-triangle-fill mr-1.5" />
                                Permanently delete <strong>"{product.title}"</strong>? This cannot be undone.
                            </p>
                            <div className="flex items-center gap-2 justify-end">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-700 text-sm text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-40 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteProduct}
                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
                                >
                                    {isDeleting ? (
                                        <>
                                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Deleting…
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-trash3-fill text-xs" />
                                            Confirm Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductReportModal;