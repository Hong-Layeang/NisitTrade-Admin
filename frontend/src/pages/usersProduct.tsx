import React, { useMemo, useState, useEffect } from "react";
import { ExportButtons } from "../components/ui/exportButton.tsx";
import { exportTableToPDF, exportTableToDocx, type ExportColumn } from "../lib/exporters.ts";
import DeleteProductModal from "../components/modals/deleteProductModal.tsx";
import { apiRequest } from "../lib/api.ts";

type Category = string;

type ProductImage = {
  id?: number;
  image_url?: string;
};

type Product = {
  id: number;
  title: string;
  userId: number;
  category: Category;
  price: number;
  reported?: boolean;
  createdAt: string;
  ProductImages?: ProductImage[];
};

type ApiProduct = {
  id?: number | string;
  title?: string;
  user_id?: number | string;
  price?: number | string;
  created_at?: string;
  createdAt?: string;
  Category?: {
    name?: string;
  };
  User?: {
    id?: number | string;
    role?: string;
  };
  Reports?: unknown[];
  ProductImages?: Array<{
    id?: number;
    image_url?: string;
  }>;
};

type ApiReportItem = {
  id?: number | string;
  status?: "open" | "reviewing" | "closed" | string;
  reportable_id?: number | string;
};

type ApiReportListResponse = {
  total?: number;
  items?: ApiReportItem[];
};

type ApiCategory = {
  id?: number | string;
  name?: string;
};

type SortBy = "newest" | "oldest" | "price-asc" | "price-desc" | "title-asc" | "reported-first";

const UsersProduct: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [reportedOnly, setReportedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;

    const parseNumber = (value: unknown, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const categoriesResponse = await apiRequest<ApiCategory[]>("/api/categories");
        const productsResponse = await apiRequest<ApiProduct[]>("/api/products?owner_role=user&limit=200");

        // Reports endpoint is admin-only; if it fails, keep rendering products with fallback flags.
        let reportItems: ApiReportItem[] = [];
        try {
          const reportsResponse = await apiRequest<ApiReportListResponse>("/api/reports?limit=500");
          reportItems = Array.isArray(reportsResponse?.items) ? reportsResponse.items : [];
        } catch {
          reportItems = [];
        }

        const reportedProductIds = new Set(
          reportItems
            .filter((item) => item.status !== "closed")
            .map((item) => parseNumber(item.reportable_id))
            .filter((id) => id > 0)
        );

        if (!isMounted) return;

        const categoryNames = (Array.isArray(categoriesResponse) ? categoriesResponse : [])
          .map((item) => (item?.name || "").trim())
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        setCategories(categoryNames);

        const mappedProducts: Product[] = (Array.isArray(productsResponse) ? productsResponse : [])
          .filter((item) => !item?.User?.role || item.User.role === "user")
          .map((item) => ({
            id: parseNumber(item.id),
            title: item.title || "Untitled",
            userId: parseNumber(item.user_id ?? item.User?.id),
            category: item.Category?.name || "Unknown",
            price: parseNumber(item.price),
            reported: reportedProductIds.has(parseNumber(item.id)),
            createdAt: item.created_at || item.createdAt || "",
            ProductImages: item.ProductImages || [],
          }));

        setProducts(mappedProducts);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load user products");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = useMemo(
    () => [...new Set([...categories, ...products.map((p) => p.category).filter(Boolean)])].sort(),
    [categories, products]
  );

  const filtered = useMemo(() => {
    let rows = [...products];
    const q = search.toLowerCase().trim();

    if (q) {
      rows = rows.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          String(p.id).includes(q) ||
          String(p.userId).includes(q)
      );
    }
    if (category !== "All") rows = rows.filter((p) => p.category === category);
    if (reportedOnly) rows = rows.filter((p) => !!p.reported);

    rows.sort((a, b) => {
      switch (sortBy) {
        case "newest": return +new Date(b.createdAt) - +new Date(a.createdAt);
        case "oldest": return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "title-asc": return a.title.localeCompare(b.title);
        case "reported-first":
          if ((b.reported ? 1 : 0) !== (a.reported ? 1 : 0)) return (b.reported ? 1 : 0) - (a.reported ? 1 : 0);
          return +new Date(b.createdAt) - +new Date(a.createdAt);
        default: return 0;
      }
    });

    return rows;
  }, [products, search, category, sortBy, reportedOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible    = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [search, category, sortBy, reportedOnly]);

  // Remove button style (exact colors requested)
  const removeBtn =
    "inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-medium " +
    "border border-[#FF004F] text-[#FF004F] bg-[#FFC5C5] " +
    "hover:brightness-95 active:brightness-90 " +
    "focus:outline-none focus:ring-2 focus:ring-[#FF004F]/40";
  //handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      setIsDeleting(true);
      setDeleteError("");

      await apiRequest<void>(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
      });

      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setIsDeleteOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Export setup ---
  const columns: ExportColumn[] = [
    { header: "Product ID",    dataKey: "id" },
    { header: "Product Title", dataKey: "title" },
    { header: "User ID",       dataKey: "userId" },
    { header: "Category",      dataKey: "category" },
    { header: "Price",         dataKey: "priceFormatted" },
    { header: "Reported",      dataKey: "reportedLabel" },
    { header: "Created At",    dataKey: "createdAt" },
  ];

  const rowsForExport = filtered.map((p) => ({
    id: p.id,
    title: p.title,
    userId: p.userId,
    category: p.category,
    priceFormatted: `$ ${p.price}`,
    reportedLabel: p.reported ? "Yes" : "No",
    createdAt: p.createdAt,
  }));

  const onExportPDF = () =>
    exportTableToPDF({ title: "User Product", columns, rows: rowsForExport, orientation: "l" });

  const onExportDocx = () =>
    exportTableToDocx({ title: "User Product", columns, rows: rowsForExport });

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">User Product</h2>

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
                placeholder="Search product / ID / user ID"
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
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="price-asc">Price Low → High</option>
              <option value="price-desc">Price High → Low</option>
              <option value="title-asc">Title A → Z</option>
              <option value="reported-first">Reported First</option>
            </select>

            {/* Reported Only */}
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={reportedOnly}
                onChange={(e) => setReportedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand/50"
              />
              Reported only
            </label>

            {/* Export buttons */}
            <ExportButtons onPDF={onExportPDF} onDocx={onExportDocx} variant="brand" size="md" />
          </div>
        </div>

        {isLoading && (
          <div className="mt-4 rounded-md border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/40 p-3 text-sm text-slate-500 dark:text-slate-300">
            Loading user products...
          </div>
        )}

        {!!loadError && (
          <div className="mt-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
            {loadError}
          </div>
        )}

        {!!deleteError && (
          <div className="mt-4 rounded-md border border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
            {deleteError}
          </div>
        )}

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <colgroup>
              <col style={{ width: "100px" }} />
              <col style={{ width: "80px" }} />
              <col style={{ width: "280px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "100px" }} />
              <col style={{ width: "110px" }} />
            </colgroup>

            <thead>
              <tr className="border-b border-slate-200 dark:border-gray-800 text-left">
                <th className="py-3 px-2 text-slate-500 font-medium">Product ID</th>
                <th className="py-3 px-2 text-slate-500 font-medium">Image</th>
                <th className="py-3 px-2 text-slate-500 font-medium">Product Title</th>
                <th className="py-3 px-2 text-slate-500 font-medium">User ID</th>
                <th className="py-3 px-2 text-slate-500 font-medium">Category</th>
                <th className="py-3 px-2 text-slate-500 font-medium text-right">Price</th>
                <th className="py-3 px-2 text-slate-500 font-medium">Reported</th>
                <th className="py-3 px-2 text-slate-500 font-medium text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((p) => {
                const redTxt = p.reported ? "text-red-600" : "";
                const redPrice = p.reported ? "text-red-600" : "text-slate-900 dark:text-slate-100";
                return (
                  <tr key={p.id} className="border-b last:border-b-0 border-slate-100 dark:border-gray-800">
                    <td className={`py-3 px-2 tabular-nums ${redTxt}`}>{p.id}</td>
                    <td className="py-3 px-2">
                      {p.ProductImages && p.ProductImages.length > 0 ? (
                        <img
                          src={p.ProductImages[0].image_url}
                          alt={p.title}
                          className="h-12 w-12 object-cover rounded border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                          <i className="bi bi-image text-gray-400 text-xs" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`truncate block ${redTxt}`}>{p.title}</span>
                    </td>
                    <td className={`py-3 px-2 tabular-nums ${redTxt}`}>{p.userId}</td>
                    <td className={`py-3 px-2 ${redTxt}`}>{p.category}</td>
                    <td className="py-3 px-2 text-right">
                      <span className={`font-semibold tabular-nums ${redPrice}`}>$ {p.price}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={p.reported ? "text-red-600 font-medium" : "text-slate-500"}>{p.reported ? "Yes" : "No"}</span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className={removeBtn} onClick={() => {
                        setSelectedProduct(p);
                        setIsDeleteOpen(true);
                      }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> –{" "}
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
      <DeleteProductModal
        open={isDeleteOpen}
        product={selectedProduct}
        isLoading={isDeleting}
        onClose={() => {
          if (isDeleting) return;
          setIsDeleteOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default UsersProduct;
