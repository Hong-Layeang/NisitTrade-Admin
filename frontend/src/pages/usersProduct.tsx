import React, { useMemo, useState, useEffect } from "react";
import { ExportButtons } from "../components/ui/exportButton.tsx";
import { exportTableToPDF, exportTableToDocx, type ExportColumn } from "../lib/exporters.ts";
import DeleteProductModal from "../components/modals/deleteProductModal.tsx";
type Category = "Electronic" | "Clothing" | "Accessory";
type Product = {
  id: number;
  title: string;
  userId: number;
  category: Category;
  price: number;
  reported?: boolean;
  createdAt: string;
};

const initialData: Product[] = [
  { id: 100000, title: "shirt",   userId: 10000, category: "Clothing",  price: 60,  reported: true,  createdAt: "2024-12-01" },
  { id: 100001, title: "Phone",   userId: 10001, category: "Electronic", price: 100, createdAt: "2024-12-02" },
  { id: 100002, title: "Laptop",  userId: 10002, category: "Electronic", price: 250, createdAt: "2024-12-03" },
  { id: 100003, title: "Keyboard",userId: 10003, category: "Electronic", price: 30,  createdAt: "2024-12-04" },
  { id: 100004, title: "Shirt",   userId: 10004, category: "Clothing",  price: 35.5,createdAt: "2024-12-05" },
  { id: 100005, title: "Shoes",   userId: 10005, category: "Clothing",  price: 10,  createdAt: "2024-12-06" },
  { id: 100006, title: "Hoodie",  userId: 10006, category: "Clothing",  price: 7.75,createdAt: "2024-12-07" },
  { id: 100007, title: "Jacket",  userId: 10007, category: "Clothing",  price: 7.75,createdAt: "2024-12-08" },
  { id: 100008, title: "Ring",    userId: 10008, category: "Accessory", price: 1,   createdAt: "2024-12-09" },
  { id: 100009, title: "Airpod",  userId: 10009, category: "Electronic", price: 10,  createdAt: "2024-12-10" },
];

type SortBy = "newest" | "oldest" | "price-asc" | "price-desc" | "title-asc" | "reported-first";

const UsersProduct: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [reportedOnly, setReportedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(initialData);

  const pageSize = 10;

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
  const handleConfirmDelete = () => {
    if (!selectedProduct) return;

    setProducts((prev) =>
      prev.filter((p) => p.id !== selectedProduct.id)
    );

    setIsDeleteOpen(false);
    setSelectedProduct(null);
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
              <option value="Electronic">Electronic</option>
              <option value="Clothing">Clothing</option>
              <option value="Accessory">Accessory</option>
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

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <colgroup>
              <col style={{ width: "140px" }} />
              <col style={{ width: "360px" }} />
              <col style={{ width: "130px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
            </colgroup>

            <thead>
              <tr className="border-b border-slate-200 dark:border-gray-800 text-left">
                <th className="py-3 px-2 text-slate-500 font-medium">Product ID</th>
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
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default UsersProduct;
