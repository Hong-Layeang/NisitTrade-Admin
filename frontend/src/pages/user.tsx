import React, { useMemo, useState, useEffect } from "react";
import { ExportButtons } from "../components/ui/exportButton.tsx";
import { exportTableToPDF, exportTableToDocx, type ExportColumn } from "../lib/exporters.ts";
import DeleteProductModal from "../components/modals/deleteProductModal.tsx";
import { apiRequest } from "../lib/api.ts";

type UserRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
};

type ApiUser = {
  id?: number | string;
  full_name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  createdAt?: string;
};

type ApiUsersResponse = {
  total?: number;
  items?: ApiUser[];
};

type SortBy = "newest" | "oldest" | "name-asc" | "name-desc";

function parseNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const Users: React.FC = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [page, setPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await apiRequest<ApiUsersResponse>("/api/users?limit=300");
        if (!isMounted) return;

        const mappedUsers: UserRow[] = (Array.isArray(response?.items) ? response.items : []).map((item) => ({
          id: parseNumber(item?.id),
          name: item?.full_name || "Unknown User",
          phone: item?.phone || "-",
          email: item?.email || "-",
          createdAt: item?.created_at || item?.createdAt || "",
        }));

        setUsers(mappedUsers);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load users");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let rows = [...users];
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
  }, [users, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible    = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [search, sortBy]);

  // Remove button color (same scheme used elsewhere)
  const removeBtn =
    "inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-medium " +
    "border border-[#FF004F] text-[#FF004F] bg-[#FFC5C5] " +
    "hover:brightness-95 active:brightness-90 " +
    "focus:outline-none focus:ring-2 focus:ring-[#FF004F]/40";

  // Remove user from admin panel by deleting the user account.
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setIsDeleting(true);
      setDeleteError("");

      await apiRequest<void>(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      setUsers((prev) => prev.filter((p) => p.id !== selectedUser.id));
      setIsDeleteOpen(false);
      setSelectedUser(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to remove user");
    } finally {
      setIsDeleting(false);
    }
  };
  
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

        {isLoading && (
          <div className="mt-4 rounded-md border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/40 p-3 text-sm text-slate-500 dark:text-slate-300">
            Loading users...
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
                    <button className={removeBtn} onClick={() => {
                      setSelectedUser(u);
                      setIsDeleteOpen(true);
                    }}>
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
            Showing <span className="font-medium">{filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}</span> –{" "}
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
        user={selectedUser}
        isLoading={isDeleting}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default Users;