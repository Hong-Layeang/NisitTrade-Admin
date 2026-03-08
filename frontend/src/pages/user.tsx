import React, { useMemo, useState, useEffect } from "react";
import { ExportButtons } from "../components/ui/exportButton.tsx";
import { exportTableToPDF, exportTableToDocx, type ExportColumn } from "../lib/exporters.ts";
type UserRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
};

const initialUsers: UserRow[] = [
  { id: 10000, name: "Jane Cooper",     phone: "(225) 555-0118", email: "jane@microsoft.com",         createdAt: "2024-11-01" },
  { id: 10001, name: "Floyd Miles",     phone: "(205) 555-0100", email: "floyd@yahoo.com",             createdAt: "2024-11-02" },
  { id: 10002, name: "Ronald Richards", phone: "(302) 555-0107", email: "ronald@adobe.com",            createdAt: "2024-11-03" },
  { id: 10003, name: "Marvin McKinney", phone: "(252) 555-0126", email: "marvin@tesla.com",            createdAt: "2024-11-04" },
  { id: 10004, name: "Jerome Bell",     phone: "(629) 555-0129", email: "jerome@google.com",           createdAt: "2024-11-05" },
  { id: 10005, name: "Kathryn Murphy",  phone: "(406) 555-0120", email: "kathryn@microsoft.com",       createdAt: "2024-11-06" },
  { id: 10006, name: "Jacob Jones",     phone: "(208) 555-0112", email: "jacob@yahoo.com",             createdAt: "2024-11-07" },
  { id: 10007, name: "Kristin Watson",  phone: "(704) 555-0127", email: "kristin@facebook.com",        createdAt: "2024-11-08" },
  { id: 10008, name: "Jennie Kim",      phone: "(704) 555-0123", email: "jennie@gmail.com",            createdAt: "2024-11-09" },
  { id: 10009, name: "Rose Park",       phone: "(704) 555-0122", email: "rosepark@gmail.com",          createdAt: "2024-11-10" },
];

type SortBy = "newest" | "oldest" | "name-asc" | "name-desc";

const Users: React.FC = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let rows = [...initialUsers];
    const q = search.toLowerCase().trim();

    if (q) {
      rows = rows.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          String(u.id).includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q)
      );
    }

    rows.sort((a, b) => {
      switch (sortBy) {
        case "newest": return +new Date(b.createdAt) - +new Date(a.createdAt);
        case "oldest": return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

    return rows;
  }, [search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible    = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [search, sortBy]);

  // Remove button color (same scheme used elsewhere)
  const removeBtn =
    "inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-medium " +
    "border border-[#FF004F] text-[#FF004F] bg-[#FFC5C5] " +
    "hover:brightness-95 active:brightness-90 " +
    "focus:outline-none focus:ring-2 focus:ring-[#FF004F]/40";

  // --- Export setup ---
  const columns: ExportColumn[] = [
    { header: "User ID",       dataKey: "id" },
    { header: "Name",          dataKey: "name" },
    { header: "Phone Number",  dataKey: "phone" },
    { header: "Email",         dataKey: "email" },
    { header: "Created At",    dataKey: "createdAt" },
  ];

  const rowsForExport = filtered;

  const onExportPDF = () =>
    exportTableToPDF({ title: "Users", columns, rows: rowsForExport, orientation: "l" });

  const onExportDocx = () =>
    exportTableToDocx({ title: "Users", columns, rows: rowsForExport });

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">User</h2>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100">User Information</h5>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name / id / phone / email"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                className="appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 px-3 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-brand/50"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="newest">Sort by: Newest</option>
                <option value="oldest">Sort by: Oldest</option>
                <option value="name-asc">Name A → Z</option>
                <option value="name-desc">Name Z → A</option>
              </select>
              <i className="bi bi-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Export */}
            <ExportButtons onPDF={onExportPDF} onDocx={onExportDocx} variant="brand" size="md" />
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <colgroup>
              <col style={{ width: "130px" }} />
              <col style={{ width: "260px" }} />
              <col style={{ width: "200px" }} />
              <col />
              <col style={{ width: "120px" }} />
            </colgroup>

            <thead>
              <tr className="border-b border-slate-200 dark:border-gray-800 text-left">
                <th className="py-3 px-2 text-slate-500 font-medium">User ID</th>
                <th className="py-3 px-2 text-slate-500 font-medium">Name</th>
                <th className="py-3 px-2 text-slate-500 font-medium">Phone Number</th>
                <th className="py-3 px-2 text-slate-500 font-medium">Email</th>
                <th className="py-3 px-2 text-slate-500 font-medium text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((u) => (
                <tr key={`${u.id}-${u.email}`} className="border-b last:border-b-0 border-slate-100 dark:border-gray-800">
                  <td className="py-3 px-2 tabular-nums">{u.id}</td>
                  <td className="py-3 px-2"><span className="truncate block">{u.name}</span></td>
                  <td className="py-3 px-2">{u.phone}</td>
                  <td className="py-3 px-2"><span className="truncate block">{u.email}</span></td>
                  <td className="py-3 px-2 text-right">
                    <button className={removeBtn} onClick={() => alert(`Remove user ${u.id}`)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
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

export default Users;