import React, { useMemo, useState, useEffect } from "react";
import "../styles/adminShop.css";

type Category = "Electronic" | "Clothing" | "Accessory";
type Status = "Active" | "Sold";

type Product = {
  id: number;
  title: string;
  category: Category;
  price: number;
  status: Status;
  createdAt: string;
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

type SortBy = "newest" | "oldest" | "price-asc" | "price-desc" | "title-asc";

const AdminShop: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [page, setPage] = useState(1);

  const pageSize = 8;

  const filtered = useMemo(() => {
    let rows = [...initialData];

    const q = search.toLowerCase().trim();
    if (q) {
      rows = rows.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          String(p.id).includes(q)
      );
    }

    if (category !== "All")
      rows = rows.filter((p) => p.category === category);

    if (status !== "All")
      rows = rows.filter((p) => p.status === status);

    rows.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return +new Date(b.createdAt) - +new Date(a.createdAt);
        case "oldest":
          return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "title-asc":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return rows;
  }, [search, category, status, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const visible = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [search, category, status, sortBy]);

  return (
    <>
      <h2 className="page-title">Admin Shop</h2>

      <div className="table-card">

        {/* Toolbar */}
        <div className="table-toolbar">

          <h5 className="toolbar-title">All Products</h5>

          <div className="toolbar-right">

            <div className="searchbox">
              <i className="bi bi-search" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product or ID"
              />
            </div>

            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="All">Category</option>
              <option value="Electronic">Electronic</option>
              <option value="Clothing">Clothing</option>
              <option value="Accessory">Accessory</option>
            </select>

            <select
              className="select"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="All">Status</option>
              <option value="Active">Active</option>
              <option value="Sold">Sold</option>
            </select>

            <select
              className="select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as SortBy)
              }
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price-asc">Price Low → High</option>
              <option value="price-desc">Price High → Low</option>
              <option value="title-asc">Title A → Z</option>
            </select>

          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">

          <table className="admin-table">

            <colgroup>
  <col style={{ width: "140px" }} />
  <col style={{ width: "360px" }} />
  <col style={{ width: "160px" }} />
  <col style={{ width: "110px" }} />
  <col style={{ width: "130px" }} />
  <col style={{ width: "110px" }} />
</colgroup>

            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Title</th>
                <th>Category</th>
                <th className="th-right">Price</th>
                <th>Status</th>
                <th className="th-center">Action</th>
              </tr>
            </thead>

            <tbody>

              {visible.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>

                  <td>{p.title}</td>

                  <td className="cell-muted">
                    {p.category}
                  </td>

                  <td className="td-right">
                    <span className="num">
                      ${p.price}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-pill ${p.status.toLowerCase()}`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="actions">

                    <button className="btn-icon-xs edit">
                      <i className="bi bi-pencil-square" />
                    </button>

                    <button className="btn-icon-xs danger">
                      <i className="bi bi-trash" />
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>
    </>
  );
};

export default AdminShop;