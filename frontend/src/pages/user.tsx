import React, { useMemo, useState, useEffect } from "react";
import { ExportButtons } from "../components/ui/exportButton.tsx";
import { exportTableToPDF, exportTableToDocx, type ExportColumn } from "../lib/exporters.ts";
import DeleteProductModal from "../components/modals/deleteProductModal.tsx";
import { apiRequest } from "../lib/api.ts";

type UserRow = {
  id: number;
  name: string;
  role: string;
  email: string;
  createdAt: string;
};

type ApiUser = {
  id?: number | string;
  full_name?: string;
  email?: string;
  role?: string;
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

// Role badge colours
function roleBadgeClass(role: string): string {
  switch (role.toLowerCase()) {
    case "admin": return "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-900/20 dark:text-purple-300 dark:ring-purple-500/20";
    case "seller": return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-500/20";
    default: return "bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-600/20";
  }
}

// Initials avatar colour
function avatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-orange-500",
    "bg-pink-500", "bg-violet-500", "bg-teal-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

const selectCls =
  "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 " +
  "text-slate-700 dark:text-slate-200 text-sm px-3 py-2 " +
  "focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors";

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
          role: item?.role || "-",
          email: item?.email || "-",
          createdAt: item?.created_at || item?.createdAt || "",
        }));
        setUsers(mappedUsers);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load users");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadUsers();
    return () => { isMounted = false; };
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
          u.role.toLowerCase().includes(q)
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
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [search, sortBy]);

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsDeleting(true);
      setDeleteError("");
      await apiRequest<void>(`/api/users/${selectedUser.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((p) => p.id !== selectedUser.id));
      setIsDeleteOpen(false);
      setSelectedUser(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to remove user");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ExportColumn[] = [
    { header: "User ID", dataKey: "id" },
    { header: "Name", dataKey: "name" },
    { header: "Role", dataKey: "role" },
    { header: "Email", dataKey: "email" },
    { header: "Created At", dataKey: "createdAt" },
  ];
  const onExportPDF = () => exportTableToPDF({ title: "Users", columns, rows: filtered, orientation: "l" });
  const onExportDocx = () => exportTableToDocx({ title: "Users", columns, rows: filtered });

  return (
    <>
      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10">
            <i className="bi bi-people text-brand text-base" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] dark:text-white">Users</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base ml-10">
          Manage all registered users on your platform.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100">User Information</h5>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{filtered.length} user{filtered.length !== 1 ? "s" : ""} found</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID, role, email…"
                className="pl-8 pr-3 py-2 w-64 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <i className="bi bi-x text-sm" />
                </button>
              )}
            </div>

            <select className={selectCls} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
            </select>

            <ExportButtons onPDF={onExportPDF} onDocx={onExportDocx} variant="brand" size="md" />
          </div>
        </div>

        {/* Banners */}
        {isLoading && (
          <div className="mx-5 mt-4 flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/60 px-4 py-3 text-sm text-slate-500 dark:text-slate-300">
            <svg className="animate-spin h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Loading users…
          </div>
        )}
        {!!loadError && (
          <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            <i className="bi bi-exclamation-circle-fill mt-0.5 shrink-0" />
            {loadError}
          </div>
        )}
        {!!deleteError && (
          <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            <i className="bi bi-exclamation-circle-fill mt-0.5 shrink-0" />
            {deleteError}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto px-5 pb-2">
          <table className="min-w-full text-sm">
            <colgroup>
              <col style={{ width: "90px" }} />
              <col style={{ width: "260px" }} />
              <col style={{ width: "130px" }} />
              <col />
              <col style={{ width: "110px" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 dark:border-gray-800">
                <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">ID</th>
                <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Name</th>
                <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Role</th>
                <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Email</th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-gray-800/60">
              {visible.map((u) => (
                <tr key={`${u.id}-${u.email}`} className="group hover:bg-slate-50/60 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-2 tabular-nums text-xs font-mono text-slate-400 dark:text-slate-500">#{u.id}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-semibold shrink-0 ${avatarColor(u.name)}`}>
                        {getInitials(u.name)}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${roleBadgeClass(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-500 dark:text-slate-400 truncate max-w-[220px]">{u.email}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => { setSelectedUser(u); setIsDeleteOpen(true); }}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:bg-transparent dark:hover:bg-red-950/30 transition-colors"
                    >
                      <i className="bi bi-person-x text-xs" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              {visible.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <i className="bi bi-people text-3xl text-slate-200 dark:text-slate-700 block mb-2" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">No users found</p>
                    {search && (
                      <button onClick={() => setSearch("")} className="mt-2 text-xs text-brand hover:underline">
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>{" "}–{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {Math.min(page * pageSize, filtered.length)}
            </span>{" "}of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
          </p>
          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
            >
              ← Prev
            </button>
            <span className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold">{page}</span> / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <DeleteProductModal
        open={isDeleteOpen}
        user={selectedUser}
        isLoading={isDeleting}
        onClose={() => { if (isDeleting) return; setIsDeleteOpen(false); setSelectedUser(null); }}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default Users;