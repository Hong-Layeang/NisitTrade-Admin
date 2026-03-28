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

const initialData: Product[] = [
  { id: 100000, title: "Mouse", category: "Electronic", price: 5, status: "Active", createdAt: "2024-12-01" },
  { id: 100001, title: "Phone", category: "Electronic", price: 100, status: "Sold", createdAt: "2024-12-02" },
  { id: 100002, title: "Laptop", category: "Electronic", price: 250, status: "Active", createdAt: "2024-12-03" },
  { id: 100003, title: "Keyboard", category: "Electronic", price: 30, status: "Active", createdAt: "2024-12-04" },
  { id: 100004, title: "Shirt", category: "Clothing", price: 15, status: "Active", createdAt: "2024-12-05" },
  { id: 100005, title: "Shoes", category: "Clothing", price: 50, status: "Sold", createdAt: "2024-12-06" },
  { id: 100006, title: "Hoodie", category: "Clothing", price: 25, status: "Active", createdAt: "2024-12-07" },
  { id: 100007, title: "Jacket", category: "Clothing", price: 75, status: "Active", createdAt: "2024-12-08" },
  { id: 100008, title: "Ring", category: "Accessory", price: 1, status: "Sold", createdAt: "2024-12-09" },
  { id: 100009, title: "Airpod", category: "Electronic", price: 10, status: "Active", createdAt: "2024-12-10" },
];

const AdminShop: React.FC = () => {
  const [rows, setRows] = useState<Product[]>(initialData);
  const [categories, setCategories] = useState<Category[]>(["Electronic", "Clothing", "Accessory"]);

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

    const loadCategories = async () => {
      try {
        const response = await apiRequest<ApiCategory[]>("/api/categories");
        if (!isMounted) return;

        const names = (Array.isArray(response) ? response : [])
          .map((item) => (item?.name || "").trim())
          .filter(Boolean);

        if (names.length > 0) {
          setCategories(names);
        }
      } catch {
        // Keep fallback categories if API is unavailable.
      }
    };

    loadCategories();

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
  const handleAddProduct = (data: AddProductPayload) => {
    const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 100000;
    const today = new Date();
    const createdAt = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const newRow: Product = {
      id: nextId,
      title: data.title,
      category: data.category,
      price: data.price,
      status: "Active",
      createdAt,
    };

    setRows((prev) => [newRow, ...prev]);
    setOpenAdd(false);
  };

  // ---- Edit ----
  const handleEditProduct = (updated: Product) => {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditTarget(null);
  };

  // ---- Delete ----
  const handleDeleteProduct = () => {
    if (!deleteTarget) return;
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
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

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <colgroup>
              <col style={{ width: "140px" }} />
              <col style={{ width: "360px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "110px" }} />
            </colgroup>

            <thead>
              <tr className="border-b border-slate-200 dark:border-gray-800 text-left">
                <th className="py-3 px-2 text-slate-500 font-medium">Product ID</th>
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

                return (
                  <tr key={p.id} className="border-b last:border-b-0 border-slate-100 dark:border-gray-800">
                    <td className="py-3 px-2">{p.id}</td>
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