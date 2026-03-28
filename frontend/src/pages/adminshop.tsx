import React, { useMemo, useState, useEffect } from "react";
import { exportTableToPDF, exportTableToDocx, type ExportColumn } from "../lib/exporters.ts";
import { ExportButtons } from "../components/ui/exportButton.tsx";
import AddProductModal, { AddProductPayload } from "../components/modals/addProductModal.tsx";
import EditProductModal, { Product } from "../components/modals/editProductModal.tsx";
import DeleteProductModal from "../components/modals/deleteProductModal.tsx";
import { apiRequest } from "../lib/api.ts";

// ---- Types ----
type Category = string;
type Status = "Active" | "Sold";
type SortBy = "newest" | "oldest" | "price-asc" | "price-desc" | "title-asc";

type ApiCategory = {
  id?: number | string;
  name?: string;
};

type ApiProduct = {
  id?: number | string;
  title?: string;
  price?: number | string;
  status?: string;
  created_at?: string;
  createdAt?: string;
  User?: {
    role?: string;
  };
  Category?: {
    id?: number | string;
    name?: string;
  };
  ProductImages?: Array<{
    id?: number;
    image_url?: string;
  }>;
};

type PresignedUrlResponse = {
  s3Key?: string;
  presignedUrl?: string;
  expiresIn?: number;
};

const FALLBACK_CATEGORIES: Category[] = ["Electronic", "Clothing", "Accessory"];

function parseNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapBackendStatusToUi(status: string | undefined): Status {
  return status === "sold" ? "Sold" : "Active";
}

function mapUiStatusToBackend(status: Status): "sold" | "available" {
  return status === "Sold" ? "sold" : "available";
}

async function toRenderableImageUrl(imageUrl?: string): Promise<string | undefined> {
  if (!imageUrl) return undefined;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  try {
    const response = await apiRequest<PresignedUrlResponse>("/api/presigned-url", {
      method: "POST",
      body: JSON.stringify({ s3Key: imageUrl }),
    });

    return response?.presignedUrl || imageUrl;
  } catch {
    return imageUrl;
  }
}

const AdminShop: React.FC = () => {
  const [rows, setRows] = useState<Product[]>([]);
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

  // Modal states
  const [openAdd, setOpenAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const [categoriesResponse, productsResponse] = await Promise.all([
          apiRequest<ApiCategory[]>("/api/categories"),
          apiRequest<ApiProduct[]>("/api/products?owner_role=admin&limit=300"),
        ]);

        if (!isMounted) return;

        const categoryRecords = Array.isArray(categoriesResponse) ? categoriesResponse : [];
        const categoryMap: Record<string, number> = {};
        const categoryNames = categoryRecords
          .map((item) => {
            const name = (item?.name || "").trim();
            const id = parseNumber(item?.id, 0);
            if (name && id > 0) {
              categoryMap[name] = id;
            }
            return name;
          })
          .filter(Boolean);

        const mappedProducts: Product[] = (Array.isArray(productsResponse) ? productsResponse : [])
          .filter((item) => !item?.User?.role || item.User.role === "admin")
          .map((item) => ({
            id: parseNumber(item.id),
            title: item.title || "Untitled",
            category: item.Category?.name || "Unknown",
            price: parseNumber(item.price),
            status: mapBackendStatusToUi(item.status),
            createdAt: item.created_at || item.createdAt || "",
            ProductImages: item.ProductImages || [],
          }));

        setCategoryIdByName(categoryMap);
        setCategories(categoryNames.length > 0 ? categoryNames : FALLBACK_CATEGORIES);
        setRows(mappedProducts);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load admin products");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ---- Filtering & sorting ----
  const filtered = useMemo(() => {
    let data = [...rows];
    const q = search.toLowerCase().trim();

    if (q) data = data.filter((p) => p.title.toLowerCase().includes(q) || String(p.id).includes(q));
    if (category !== "All") data = data.filter((p) => p.category === category);
    if (status !== "All") data = data.filter((p) => p.status === status);

    data.sort((a, b) => {
      switch (sortBy) {
        case "newest": return +new Date(b.createdAt) - +new Date(a.createdAt);
        case "oldest": return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "title-asc": return a.title.localeCompare(b.title);
        default: return 0;
      }
    });
    return data;
  }, [rows, search, category, status, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [search, category, status, sortBy]);

  // ---- Export ----
  const columns: ExportColumn[] = [
    { header: "Product ID", dataKey: "id" },
    { header: "Product Title", dataKey: "title" },
    { header: "Category", dataKey: "category" },
    { header: "Price", dataKey: "priceFormatted" },
    { header: "Status", dataKey: "status" },
    { header: "Created At", dataKey: "createdAt" },
  ];

  const rowsForExport = filtered.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    priceFormatted: `$ ${p.price}`,
    status: p.status,
    createdAt: p.createdAt,
  }));

  const onExportPDF = () => exportTableToPDF({ title: "Admin Shop", columns, rows: rowsForExport, orientation: "l" });
  const onExportDocx = () => exportTableToDocx({ title: "Admin Shop", columns, rows: rowsForExport });

  // ---- Add ----
  const handleAddProduct = async (data: AddProductPayload) => {
    const categoryId = categoryIdByName[data.category];
    if (!categoryId) {
      setLoadError("Selected category is invalid");
      return;
    }

    try {
      const imageUrls = data.s3Key ? [data.s3Key] : [];

      const created = await apiRequest<ApiProduct>("/api/products", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          description: data.description || "",
          price: data.price,
          category_id: categoryId,
          image_urls: imageUrls,
        }),
      });

      const createdImages = Array.isArray(created?.ProductImages) ? created.ProductImages : [];
      const sourceImages =
        createdImages.length > 0
          ? createdImages
          : imageUrls.map((key, index) => ({ id: index + 1, image_url: key }));

      const optimisticImages = await Promise.all(
        sourceImages.map(async (img, index) => ({
          id: img.id ?? index + 1,
          image_url: await toRenderableImageUrl(img.image_url),
        }))
      );

      const newRow: Product = {
        id: parseNumber(created?.id),
        title: created?.title || data.title,
        category: created?.Category?.name || data.category,
        price: parseNumber(created?.price, data.price),
        status: mapBackendStatusToUi(created?.status),
        createdAt: created?.created_at || created?.createdAt || new Date().toISOString(),
        ProductImages: optimisticImages,
      };

      setRows((prev) => [newRow, ...prev]);
      setOpenAdd(false);
      setLoadError("");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to add product");
    }
  };

  // ---- Edit ----
  const handleEditProduct = async (updated: Product) => {
    const categoryId = categoryIdByName[updated.category];
    if (!categoryId) {
      setLoadError("Selected category is invalid");
      return;
    }

    try {
      const saved = await apiRequest<ApiProduct>(`/api/products/${updated.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: updated.title,
          price: updated.price,
          category_id: categoryId,
          status: mapUiStatusToBackend(updated.status),
        }),
      });

      const savedImages = Array.isArray(saved?.ProductImages)
        ? saved.ProductImages
        : updated.ProductImages || [];

      const nextImages = await Promise.all(
        savedImages.map(async (img, index) => ({
          id: img.id ?? index + 1,
          image_url: await toRenderableImageUrl(img.image_url),
        }))
      );

      const nextRow: Product = {
        id: parseNumber(saved?.id, updated.id),
        title: saved?.title || updated.title,
        category: saved?.Category?.name || updated.category,
        price: parseNumber(saved?.price, updated.price),
        status: mapBackendStatusToUi(saved?.status),
        createdAt: saved?.created_at || saved?.createdAt || updated.createdAt,
        ProductImages: nextImages,
      };

      setRows((prev) => prev.map((r) => (r.id === updated.id ? nextRow : r)));
      setEditTarget(null);
      setLoadError("");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to update product");
    }
  };

  // ---- Delete ----
  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;

    try {
      await apiRequest<void>(`/api/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      setLoadError("");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  return (
    <>
      {/* Title */}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Admin Shop</h2>

      {/* Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100">All Products</h5>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product or ID"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>

            {/* Category */}
            <select
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="All">Category</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            {/* Status */}
            <select
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="All">Status</option>
              <option value="Active">Active</option>
              <option value="Sold">Sold</option>
            </select>

            {/* Sort */}
            <select
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-asc">Price Low → High</option>
              <option value="price-desc">Price High → Low</option>
              <option value="title-asc">Title A → Z</option>
            </select>

            {/* Export */}
            <ExportButtons onPDF={onExportPDF} onDocx={onExportDocx} variant="brand" size="md" />

            {/* Add Product */}
            <button
              type="button"
              onClick={() => setOpenAdd(true)}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:opacity-95"
              title="Add Product"
            >
              <i className="bi bi-plus-circle" />
              Add Product
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="mt-4 rounded-md border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/40 p-3 text-sm text-slate-500 dark:text-slate-300">
            Loading admin products...
          </div>
        )}

        {!!loadError && (
          <div className="mt-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
            {loadError}
          </div>
        )}

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <colgroup>
              <col style={{ width: "100px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "360px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "110px" }} />
            </colgroup>

            <thead>
              <tr className="border-b border-slate-200 dark:border-gray-800 text-left">
                <th className="py-3 px-2 text-slate-500 font-medium">Product ID</th>
                <th className="py-3 px-2 text-slate-500 font-medium">Image</th>
                <th className="py-3 px-2 text-slate-500 font-medium">Product Title</th>
                <th className="py-3 px-2 text-slate-500 font-medium">Category</th>
                <th className="py-3 px-2 text-slate-500 font-medium text-right">Price</th>
                <th className="py-3 px-2 text-slate-500 font-medium">Status</th>
                <th className="py-3 px-2 text-slate-500 font-medium text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((p) => {
                const isActive = p.status === "Active";
                const pill = isActive
                  ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-300"
                  : "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/20 dark:text-red-300";
                const primaryImageUrl = p.ProductImages?.[0]?.image_url || "";
                const hasRenderableImage = /^https?:\/\//i.test(primaryImageUrl);

                return (
                  <tr key={p.id} className="border-b last:border-b-0 border-slate-100 dark:border-gray-800">
                    <td className="py-3 px-2">{p.id}</td>
                    <td className="py-3 px-2">
                      {hasRenderableImage ? (
                        <img
                          src={primaryImageUrl}
                          alt={p.title}
                          className="h-16 w-16 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-md border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                          <i className="bi bi-image text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2">{p.title}</td>
                    <td className="py-3 px-2 text-slate-500">{p.category}</td>
                    <td className="py-3 px-2 text-right">
                      <span className="font-semibold tabular-nums">${p.price}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${pill}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => setEditTarget(p)}
                          className="w-7 h-7 grid place-items-center rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/40"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="w-7 h-7 grid place-items-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-medium">{filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}</span> –{" "}
            <span className="font-medium">{Math.min(page * pageSize, filtered.length)}</span> of{" "}
            <span className="font-medium">{filtered.length}</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-gray-800"
            >
              Prev
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Page <span className="font-semibold">{page}</span> / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        categories={categories}
        onSubmit={handleAddProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        open={!!editTarget}
        product={editTarget}
        categories={categories}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditProduct}
      />

      {/* Delete Product Modal */}
      <DeleteProductModal
        open={!!deleteTarget}
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProduct}
      />
    </>
  );
};

export default AdminShop;