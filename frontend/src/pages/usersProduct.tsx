import React, { useMemo, useState, useEffect } from "react";
import { ExportButtons } from "../components/ui/exportButton.tsx";
import { exportTableToPDF, exportTableToDocx, type ExportColumn } from "../lib/exporters.ts";
import {
  createProduct,
  fetchCategories,
  fetchProducts,
  type ApiCategory,
  type ApiProduct,
} from "../lib/api.ts";

// ---- Types & data ----
type Category = string;
type Status = "all" | "available" | "reserved" | "sold" | "hidden";

type Product = {
  id: number;
  title: string;
  category: Category;
  price: number;
  status: Status;
  createdAt: string;
};

type SortBy = "newest" | "oldest" | "price-asc" | "price-desc" | "title-asc" | "reported-first";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().slice(0, 10);
}

function mapProduct(item: ApiProduct): Product {
  return {
    id: item.id,
    title: item.title,
    category: item.Category?.name || "Unknown",
    price: Number(item.price),
    status: item.status,
    createdAt: formatDate(item.createdAt || item.created_at),
  };
}

const UsersProduct: React.FC = () => {
  const [rows, setRows] = useState<Product[]>([]);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [status, setStatus] = useState<Status>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [categoriesData, productsData] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
        ]);

        setApiCategories(categoriesData);
        setRows(productsData.map(mapProduct));
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const filtered = useMemo(() => {
    let data = [...rows];
    const q = search.toLowerCase().trim();

    if (q) {
      data = data.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          String(p.id).includes(q)
      );
    }
    if (category !== "All") data = data.filter((p) => p.category === category);
    if (status !== "all") data = data.filter((p) => p.status === status);

    data.sort((a, b) => {
      switch (sortBy) {
        case "newest": return +new Date(b.createdAt) - +new Date(a.createdAt);
        case "oldest": return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "title-asc": return a.title.localeCompare(b.title);
        case "reported-first": return 0;
        default: return 0;
      }
    });

    return data;
  }, [rows, search, category, status, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible    = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [search, category, status, sortBy]);

  // --- Export setup ---
  const columns: ExportColumn[] = [
    { header: "Product ID",    dataKey: "id" },
    { header: "Product Title", dataKey: "title" },
    { header: "Category",      dataKey: "category" },
    { header: "Price",         dataKey: "priceFormatted" },
    { header: "Status",        dataKey: "status" },
    { header: "Created At",    dataKey: "createdAt" },
  ];

  const rowsForExport = filtered.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    priceFormatted: `$ ${p.price}`,
    status: p.status,
    createdAt: p.createdAt,
  }));

  const onExportPDF = () =>
    exportTableToPDF({ title: "User Product", columns, rows: rowsForExport, orientation: "l" });

  const onExportDocx = () =>
    exportTableToDocx({ title: "User Product", columns, rows: rowsForExport });

  const categoryOptions = apiCategories.map((c) => c.name);

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">User Product</h2>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

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
                placeholder="Search product / ID"
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
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/50"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value="all">Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
              <option value="hidden">Hidden</option>
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

            {/* Export buttons */}
            <ExportButtons onPDF={onExportPDF} onDocx={onExportDocx} variant="brand" size="md" />
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
              {!isLoading && visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No products found
                  </td>
                </tr>
              )}
              {visible.map((p) => {
                const isActive = p.status === "available" || p.status === "reserved";
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
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="w-7 h-7 grid place-items-center rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/40"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square" />
                        </button>
                        <button
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
    </>
  );
};

export default UsersProduct;
