import React, { useMemo, useState, useEffect } from "react";
import { exportTableToPDF, exportTableToDocx, type ExportColumn } from "../lib/exporters.ts";
import { ExportButtons } from "../components/ui/exportButton.tsx";
import AddProductModal, { AddProductPayload } from "../components/modals/addProductModal.tsx";
import EditProductModal, { Product } from "../components/modals/editProductModal.tsx";
import DeleteProductModal from "../components/modals/deleteProductModal.tsx";
import ProductDetailModal from "../components/modals/productDetailModal.tsx";
import { apiRequest } from "../lib/api.ts";

type Category = string;
type Status = "Active" | "Sold";
type SortBy = "newest" | "oldest" | "price-asc" | "price-desc" | "title-asc";

type ApiCategory = { id?: number | string; name?: string };
type ApiProduct = {
  id?: number | string; title?: string; price?: number | string; status?: string;
  created_at?: string; createdAt?: string; User?: { role?: string };
  Category?: { id?: number | string; name?: string };
  ProductImages?: Array<{ id?: number; image_url?: string }>;
};
type PresignedUrlResponse = { s3Key?: string; presignedUrl?: string; expiresIn?: number };
type ShopProduct = Product & { ownerRole?: string };

const FALLBACK_CATEGORIES: Category[] = ["Electronic", "Clothing", "Accessory"];

function formatProductId(id: number, ownerRole?: string) { return `${ownerRole === "admin" ? "AP" : "UP"}${id}`; }
function parseNumber(value: unknown, fallback = 0) { const p = Number(value); return Number.isFinite(p) ? p : fallback; }
function mapBackendStatusToUi(s?: string): Status { return s === "sold" ? "Sold" : "Active"; }
function mapUiStatusToBackend(s: Status) { return s === "Sold" ? "sold" : "available"; }
async function toRenderableImageUrl(imageUrl?: string): Promise<string | undefined> {
  if (!imageUrl) return undefined;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  try {
    const r = await apiRequest<PresignedUrlResponse>("/api/presigned-url", { method: "POST", body: JSON.stringify({ s3Key: imageUrl }) });
    return r?.presignedUrl || imageUrl;
  } catch { return imageUrl; }
}

const selectCls =
  "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 " +
  "text-slate-700 dark:text-slate-200 text-sm px-3 py-2 " +
  "focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors";

const AdminShop: React.FC = () => {
  const [rows, setRows] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [categoryIdByName, setCategoryIdByName] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [openAdd, setOpenAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [detailTarget, setDetailTarget] = useState<ShopProduct | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true); setLoadError("");
        const [catRes, prodRes] = await Promise.all([
          apiRequest<ApiCategory[]>("/api/categories"),
          apiRequest<ApiProduct[]>("/api/products?owner_role=admin&limit=300"),
        ]);
        if (!isMounted) return;
        const catMap: Record<string, number> = {};
        const catNames = (Array.isArray(catRes) ? catRes : []).map((item) => {
          const name = (item?.name || "").trim(); const id = parseNumber(item?.id, 0);
          if (name && id > 0) catMap[name] = id; return name;
        }).filter(Boolean);
        const products: ShopProduct[] = (Array.isArray(prodRes) ? prodRes : [])
          .filter((item) => !item?.User?.role || item.User.role === "admin")
          .map((item) => ({
            id: parseNumber(item.id), title: item.title || "Untitled",
            category: item.Category?.name || "Unknown", price: parseNumber(item.price),
            status: mapBackendStatusToUi(item.status), createdAt: item.created_at || item.createdAt || "",
            ProductImages: item.ProductImages || [], ownerRole: item.User?.role,
          }));
        setCategoryIdByName(catMap);
        setCategories(catNames.length > 0 ? catNames : FALLBACK_CATEGORIES);
        setRows(products);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load admin products");
      } finally { if (isMounted) setIsLoading(false); }
    })();
    return () => { isMounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let data = [...rows];
    const q = search.toLowerCase().trim();
    if (q) data = data.filter((p) => p.title.toLowerCase().includes(q) || String(p.id).includes(q));
    if (category !== "All") data = data.filter((p) => p.category === category);
    if (status !== "All") data = data.filter((p) => p.status === status);
    data.sort((a, b) => {
      switch (sortBy) {
        case "newest": return b.id - a.id; case "oldest": return a.id - b.id;
        case "price-asc": return a.price - b.price; case "price-desc": return b.price - a.price;
        case "title-asc": return a.title.localeCompare(b.title); default: return 0;
      }
    });
    return data;
  }, [rows, search, category, status, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [search, category, status, sortBy]);

  const columns: ExportColumn[] = [
    { header: "Product ID", dataKey: "id" }, { header: "Product Title", dataKey: "title" },
    { header: "Category", dataKey: "category" }, { header: "Price", dataKey: "priceFormatted" },
    { header: "Status", dataKey: "status" }, { header: "Created At", dataKey: "createdAt" },
  ];
  const rowsForExport = filtered.map((p) => ({ id: p.id, title: p.title, category: p.category, priceFormatted: `$ ${p.price}`, status: p.status, createdAt: p.createdAt }));
  const onExportPDF = () => exportTableToPDF({ title: "Admin Shop", columns, rows: rowsForExport, orientation: "l" });
  const onExportDocx = () => exportTableToDocx({ title: "Admin Shop", columns, rows: rowsForExport });

  const handleAddProduct = async (data: AddProductPayload) => {
    const categoryId = categoryIdByName[data.category];
    if (!categoryId) { setLoadError("Selected category is invalid"); return; }
    try {
      const imageUrls = data.s3Key ? [data.s3Key] : [];
      const created = await apiRequest<ApiProduct>("/api/products", { method: "POST", body: JSON.stringify({ title: data.title, description: data.description || "", price: data.price, category_id: categoryId, image_urls: imageUrls }) });
      const srcImgs = Array.isArray(created?.ProductImages) && created.ProductImages.length > 0 ? created.ProductImages : imageUrls.map((key, i) => ({ id: i + 1, image_url: key }));
      const optimisticImages = await Promise.all(srcImgs.map(async (img, i) => ({ id: img.id ?? i + 1, image_url: await toRenderableImageUrl(img.image_url) })));
      setRows((prev) => [{ id: parseNumber(created?.id), title: created?.title || data.title, category: created?.Category?.name || data.category, price: parseNumber(created?.price, data.price), status: mapBackendStatusToUi(created?.status), createdAt: created?.created_at || created?.createdAt || new Date().toISOString(), ProductImages: optimisticImages, ownerRole: "admin" }, ...prev]);
      setOpenAdd(false); setLoadError("");
    } catch (error) { setLoadError(error instanceof Error ? error.message : "Failed to add product"); }
  };

  const handleEditProduct = async (updated: Product) => {
    const categoryId = categoryIdByName[updated.category];
    if (!categoryId) { setLoadError("Selected category is invalid"); return; }
    try {
      const saved = await apiRequest<ApiProduct>(`/api/products/${updated.id}`, { method: "PUT", body: JSON.stringify({ title: updated.title, price: updated.price, category_id: categoryId, status: mapUiStatusToBackend(updated.status) }) });
      const savedImgs = Array.isArray(saved?.ProductImages) ? saved.ProductImages : updated.ProductImages || [];
      const nextImages = await Promise.all(savedImgs.map(async (img, i) => ({ id: img.id ?? i + 1, image_url: await toRenderableImageUrl(img.image_url) })));
      setRows((prev) => prev.map((r) => r.id !== updated.id ? r : { id: parseNumber(saved?.id, updated.id), title: saved?.title || updated.title, category: saved?.Category?.name || updated.category, price: parseNumber(saved?.price, updated.price), status: mapBackendStatusToUi(saved?.status), createdAt: saved?.created_at || saved?.createdAt || updated.createdAt, ProductImages: nextImages, ownerRole: saved?.User?.role }));
      setEditTarget(null); setLoadError("");
    } catch (error) { setLoadError(error instanceof Error ? error.message : "Failed to update product"); }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      await apiRequest<void>(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null); setLoadError("");
    } catch (error) { setLoadError(error instanceof Error ? error.message : "Failed to delete product"); }
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10">
            <i className="bi bi-shop text-brand text-base" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] dark:text-white">Admin Shop</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base ml-10">Manage your admin-listed products below.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100">All Products</h5>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or ID…" className="pl-8 pr-3 py-2 w-56 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors" />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><i className="bi bi-x text-sm" /></button>}
            </div>
            <select className={selectCls} value={category} onChange={(e) => setCategory(e.target.value as any)}>
              <option value="All">All Categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Sold">Sold</option>
            </select>
            <select className={selectCls} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
              <option value="newest">Newest</option><option value="oldest">Oldest</option>
              <option value="price-asc">Price ↑</option><option value="price-desc">Price ↓</option>
              <option value="title-asc">Title A–Z</option>
            </select>
            <ExportButtons onPDF={onExportPDF} onDocx={onExportDocx} variant="brand" size="md" />
            <button type="button" onClick={() => setOpenAdd(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:opacity-90 active:opacity-80 transition-opacity shadow-sm">
              <i className="bi bi-plus-lg" /> Add Product
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="mx-5 mt-4 flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/60 px-4 py-3 text-sm text-slate-500 dark:text-slate-300">
            <svg className="animate-spin h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
            Loading products…
          </div>
        )}
        {!!loadError && (
          <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            <i className="bi bi-exclamation-circle-fill mt-0.5 shrink-0" />{loadError}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto px-5 pb-2">
          <table className="min-w-full text-sm">
            <colgroup>
              <col style={{ width: "100px" }} /><col style={{ width: "76px" }} /><col style={{ width: "280px" }} />
              <col style={{ width: "140px" }} /><col style={{ width: "100px" }} /><col style={{ width: "120px" }} />
              <col style={{ width: "140px" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 dark:border-gray-800">
                {["Product ID", "Image", "Title", "Category", "Price", "Status", "Actions"].map((h, i) => (
                  <th key={h} className={`py-3 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 ${i === 4 ? "text-right" : i === 6 ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-gray-800/60">
              {visible.map((p) => {
                const isActive = p.status === "Active";
                const primaryImageUrl = p.ProductImages?.[0]?.image_url || "";
                const hasImg = /^https?:\/\//i.test(primaryImageUrl);
                return (
                  <tr key={p.id} className="group hover:bg-slate-50/60 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-2 tabular-nums text-slate-500 dark:text-slate-400 text-xs font-mono">{formatProductId(p.id, p.ownerRole)}</td>
                    <td className="py-3 px-2">
                      {hasImg ? (
                        <img src={primaryImageUrl} alt={p.title} className="h-12 w-12 object-cover rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg border border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                          <i className="bi bi-image text-gray-300 dark:text-gray-600" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2"><span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{p.title}</span></td>
                    <td className="py-3 px-2"><span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">{p.category}</span></td>
                    <td className="py-3 px-2 text-right"><span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">${p.price.toLocaleString()}</span></td>
                    <td className="py-3 px-2">
                      <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset " + (isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-500/20" : "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-600/20")}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />{p.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setDetailTarget(p)} className="w-8 h-8 grid place-items-center rounded-lg border border-slate-200 text-slate-500 bg-slate-50/50 hover:bg-slate-100 dark:border-gray-700 dark:text-slate-400 dark:bg-transparent dark:hover:bg-gray-800 transition-colors" title="View Detail">
                          <i className="bi bi-eye text-xs" />
                        </button>
                        <button onClick={() => setEditTarget(p)} className="w-8 h-8 grid place-items-center rounded-lg border border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 transition-colors" title="Edit">
                          <i className="bi bi-pencil text-xs" />
                        </button>
                        <button onClick={() => setDeleteTarget(p)} className="w-8 h-8 grid place-items-center rounded-lg border border-red-200 text-red-500 bg-red-50/50 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:bg-red-950/20 dark:hover:bg-red-950/40 transition-colors" title="Delete">
                          <i className="bi bi-trash text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && !isLoading && (
                <tr><td colSpan={7} className="py-16 text-center">
                  <i className="bi bi-box text-3xl text-slate-200 dark:text-slate-700 block mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">No products found</p>
                  {(search || category !== "All" || status !== "All") && <button onClick={() => { setSearch(""); setCategory("All"); setStatus("All"); }} className="mt-2 text-xs text-brand hover:underline">Clear filters</button>}
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

      <AddProductModal open={openAdd} onClose={() => setOpenAdd(false)} categories={categories} onSubmit={handleAddProduct} />
      <EditProductModal open={!!editTarget} product={editTarget} categories={categories} onClose={() => setEditTarget(null)} onSubmit={handleEditProduct} />
      <DeleteProductModal open={!!deleteTarget} product={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteProduct} />
      <ProductDetailModal
        open={!!detailTarget}
        product={detailTarget}
        mode="admin"
        onClose={() => setDetailTarget(null)}
        onEdit={(p) => setEditTarget(p as Product)}
        onDelete={(p) => setDeleteTarget(p as Product)}
      />
    </>
  );
};

export default AdminShop;