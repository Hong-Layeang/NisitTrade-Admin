import React, { useMemo, useState, useEffect } from "react";
import { ExportButtons } from "../components/ui/exportButton.tsx";
import { exportTableToPDF, exportTableToDocx, type ExportColumn } from "../lib/exporters.ts";
import DeleteProductModal from "../components/modals/deleteProductModal.tsx";
import ProductReportModal from "../components/modals/userProductModal.tsx";
import ProductDetailModal from "../components/modals/productDetailModal.tsx";

type Category = string;
type ProductImage = { id?: number; image_url?: string };
type Product = {
  id: number; title: string; userId: number; category: Category;
  price: number; reported?: boolean; createdAt: string; ProductImages?: ProductImage[];
};
type SortBy = "newest" | "oldest" | "price-asc" | "price-desc" | "title-asc" | "reported-first";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) } });
  if (res.status === 204) return null as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.message ?? `Error ${res.status}`);
  return body as T;
}

function formatUserProductId(id: number) { return `UP${id}`; }

const selectCls =
  "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 " +
  "text-slate-700 dark:text-slate-200 text-sm px-3 py-2 " +
  "focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors";

const UsersProduct: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [reportedOnly, setReportedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportProduct, setReportProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [detailTarget, setDetailTarget] = useState<Product | null>(null);
  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;
    const parseNumber = (v: unknown, fallback = 0) => { const p = Number(v); return Number.isFinite(p) ? p : fallback; };
    (async () => {
      try {
        setIsLoading(true); setLoadError("");
        const [catRes, prodRes] = await Promise.all([
          apiFetch<any[]>("/api/categories"),
          apiFetch<any[]>("/api/products?owner_role=user&limit=200"),
        ]);
        let reportItems: any[] = [];
        try { const r = await apiFetch<{ items?: any[] }>("/api/reports?limit=500"); reportItems = Array.isArray(r?.items) ? r.items : []; } catch { reportItems = []; }
        const reportedIds = new Set(reportItems.filter((i: any) => i.status !== "closed").map((i: any) => parseNumber(i.reportable_id)).filter((id: number) => id > 0));
        if (!isMounted) return;
        setCategories((Array.isArray(catRes) ? catRes : []).map((i: any) => (i?.name || "").trim()).filter(Boolean).sort((a: string, b: string) => a.localeCompare(b)));
        setProducts((Array.isArray(prodRes) ? prodRes : [])
          .filter((i: any) => !i?.User?.role || i.User.role === "user")
          .map((i: any) => ({ id: parseNumber(i.id), title: i.title || "Untitled", userId: parseNumber(i.user_id ?? i.User?.id), category: i.Category?.name || "Unknown", price: parseNumber(i.price), reported: reportedIds.has(parseNumber(i.id)), createdAt: i.created_at || i.createdAt || "", ProductImages: i.ProductImages || [] })));
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load user products");
      } finally { if (isMounted) setIsLoading(false); }
    })();
    return () => { isMounted = false; };
  }, []);

  const categoryOptions = useMemo(() => [...new Set([...categories, ...products.map((p) => p.category).filter(Boolean)])].sort(), [categories, products]);

  const filtered = useMemo(() => {
    let rows = [...products];
    const q = search.toLowerCase().trim();
    if (q) rows = rows.filter((p) => p.title.toLowerCase().includes(q) || String(p.id).includes(q) || String(p.userId).includes(q));
    if (category !== "All") rows = rows.filter((p) => p.category === category);
    if (reportedOnly) rows = rows.filter((p) => !!p.reported);
    rows.sort((a, b) => {
      switch (sortBy) {
        case "newest": return +new Date(b.createdAt) - +new Date(a.createdAt);
        case "oldest": return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "price-asc": return a.price - b.price; case "price-desc": return b.price - a.price;
        case "title-asc": return a.title.localeCompare(b.title);
        case "reported-first": if ((b.reported ? 1 : 0) !== (a.reported ? 1 : 0)) return (b.reported ? 1 : 0) - (a.reported ? 1 : 0); return +new Date(b.createdAt) - +new Date(a.createdAt);
        default: return 0;
      }
    });
    return rows;
  }, [products, search, category, sortBy, reportedOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [search, category, sortBy, reportedOnly]);
  const reportedCount = useMemo(() => products.filter((p) => p.reported).length, [products]);

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      setIsDeleting(true); setDeleteError("");
      await apiFetch<void>(`/api/products/${selectedProduct.id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setIsDeleteOpen(false); setSelectedProduct(null);
    } catch (error) { setDeleteError(error instanceof Error ? error.message : "Failed to delete product"); }
    finally { setIsDeleting(false); }
  };

  const handleProductDeletedFromReport = (productId: number) => setProducts((prev) => prev.filter((p) => p.id !== productId));

  const columns: ExportColumn[] = [
    { header: "Product ID", dataKey: "id" }, { header: "Product Title", dataKey: "title" },
    { header: "User ID", dataKey: "userId" }, { header: "Category", dataKey: "category" },
    { header: "Price", dataKey: "priceFormatted" }, { header: "Reported", dataKey: "reportedLabel" },
    { header: "Created At", dataKey: "createdAt" },
  ];
  const rowsForExport = filtered.map((p) => ({ id: p.id, title: p.title, userId: p.userId, category: p.category, priceFormatted: `$ ${p.price}`, reportedLabel: p.reported ? "Yes" : "No", createdAt: p.createdAt }));
  const onExportPDF = () => exportTableToPDF({ title: "User Product", columns, rows: rowsForExport, orientation: "l" });
  const onExportDocx = () => exportTableToDocx({ title: "User Product", columns, rows: rowsForExport });

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10">
            <i className="bi bi-box-seam text-brand text-base" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] dark:text-white">User Products</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base ml-10">Browse and moderate all user-listed products.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100">All Products</h5>
              {reportedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                  <i className="bi bi-flag-fill text-[10px]" />{reportedCount} reported
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, ID, user ID…" className="pl-8 pr-3 py-2 w-60 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors" />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><i className="bi bi-x text-sm" /></button>}
            </div>
            <select className={selectCls} value={category} onChange={(e) => setCategory(e.target.value as any)}>
              <option value="All">All Categories</option>
              {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className={selectCls} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
              <option value="newest">Newest</option><option value="oldest">Oldest</option>
              <option value="price-asc">Price ↑</option><option value="price-desc">Price ↓</option>
              <option value="title-asc">Title A–Z</option><option value="reported-first">Reported First</option>
            </select>
            <button
              onClick={() => setReportedOnly((v) => !v)}
              className={"inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors " + (reportedOnly ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300" : "border-gray-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-gray-800")}
            >
              <i className={`bi bi-flag${reportedOnly ? "-fill" : ""} text-xs`} />Reported only
            </button>
            <ExportButtons onPDF={onExportPDF} onDocx={onExportDocx} variant="brand" size="md" />
          </div>
        </div>

        {isLoading && (
          <div className="mx-5 mt-4 flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/60 px-4 py-3 text-sm text-slate-500 dark:text-slate-300">
            <svg className="animate-spin h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
            Loading user products…
          </div>
        )}
        {!!loadError && <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"><i className="bi bi-exclamation-circle-fill mt-0.5 shrink-0" />{loadError}</div>}
        {!!deleteError && <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"><i className="bi bi-exclamation-circle-fill mt-0.5 shrink-0" />{deleteError}</div>}

        {/* Table */}
        <div className="overflow-x-auto px-5 pb-2">
          <table className="min-w-full text-sm">
            <colgroup>
              <col style={{ width: "96px" }} /><col style={{ width: "72px" }} /><col style={{ width: "240px" }} />
              <col style={{ width: "90px" }} /><col style={{ width: "120px" }} /><col style={{ width: "100px" }} />
              <col style={{ width: "100px" }} /><col style={{ width: "130px" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 dark:border-gray-800">
                <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Product ID</th>
                <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Image</th>
                <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Title</th>
                <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">User ID</th>
                <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Category</th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Price</th>
                <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Reported</th>
                <th className="py-3 px-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-gray-800/60">
              {visible.map((p) => (
                <tr key={p.id} className={`group transition-colors ${p.reported ? "bg-red-50/30 dark:bg-red-950/10 hover:bg-red-50/60 dark:hover:bg-red-950/20" : "hover:bg-slate-50/60 dark:hover:bg-gray-800/30"}`}>
                  <td className="py-3 px-2 tabular-nums text-xs font-mono text-slate-400 dark:text-slate-500">{formatUserProductId(p.id)}</td>
                  <td className="py-3 px-2">
                    {p.ProductImages && p.ProductImages.length > 0 ? (
                      <img src={p.ProductImages[0].image_url} alt={p.title} className={`h-11 w-11 object-cover rounded-lg border shadow-sm ${p.reported ? "border-red-200 dark:border-red-800" : "border-gray-100 dark:border-gray-700"}`} />
                    ) : (
                      <div className="h-11 w-11 rounded-lg border border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <i className="bi bi-image text-gray-300 dark:text-gray-600 text-xs" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`font-medium line-clamp-2 ${p.reported ? "text-red-700 dark:text-red-300" : "text-slate-800 dark:text-slate-200"}`}>{p.title}</span>
                  </td>
                  <td className="py-3 px-2 tabular-nums text-xs font-mono text-slate-500 dark:text-slate-400">#{p.userId}</td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">{p.category}</span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className={`font-semibold tabular-nums ${p.reported ? "text-red-600 dark:text-red-400" : "text-slate-800 dark:text-slate-200"}`}>${p.price.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-2">
                    {p.reported ? (
                      <button onClick={() => { setReportProduct(p); setIsReportOpen(true); }} title="View reports" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                        <i className="bi bi-flag-fill text-[10px]" />Yes
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 text-xs text-slate-400 dark:text-slate-500">No</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* View Detail */}
                      <button
                        onClick={() => setDetailTarget(p)}
                        className="w-8 h-8 grid place-items-center rounded-lg border border-slate-200 text-slate-500 bg-slate-50/50 hover:bg-slate-100 dark:border-gray-700 dark:text-slate-400 dark:bg-transparent dark:hover:bg-gray-800 transition-colors"
                        title="View Detail"
                      >
                        <i className="bi bi-eye text-xs" />
                      </button>
                      {/* Remove */}
                      <button
                        onClick={() => { setSelectedProduct(p); setIsDeleteOpen(true); }}
                        className="w-8 h-8 grid place-items-center rounded-lg border border-red-200 text-red-500 bg-red-50/50 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:bg-red-950/20 dark:hover:bg-red-950/40 transition-colors"
                        title="Remove"
                      >
                        <i className="bi bi-trash text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && !isLoading && (
                <tr><td colSpan={8} className="py-16 text-center">
                  <i className="bi bi-box-seam text-3xl text-slate-200 dark:text-slate-700 block mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">No products found</p>
                  {(search || category !== "All" || reportedOnly) && <button onClick={() => { setSearch(""); setCategory("All"); setReportedOnly(false); }} className="mt-2 text-xs text-brand hover:underline">Clear filters</button>}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}</span> – <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(page * pageSize, filtered.length)}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
          </p>
          <div className="inline-flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">← Prev</button>
            <span className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">{page}</span> / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">Next →</button>
          </div>
        </div>
      </div>

      <DeleteProductModal open={isDeleteOpen} product={selectedProduct} isLoading={isDeleting} onClose={() => { if (isDeleting) return; setIsDeleteOpen(false); setSelectedProduct(null); }} onConfirm={handleConfirmDelete} />
      <ProductReportModal open={isReportOpen} product={reportProduct} onClose={() => { setIsReportOpen(false); setReportProduct(null); }} onProductDeleted={handleProductDeletedFromReport} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={!!detailTarget}
        product={detailTarget}
        mode="user"
        onClose={() => setDetailTarget(null)}
        onDelete={(p) => { setSelectedProduct(p as Product); setIsDeleteOpen(true); }}
      />
    </>
  );
};

export default UsersProduct;