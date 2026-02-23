import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/sidebar.css";


const Sidebar: React.FC = () => {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/", icon: "bi-speedometer2" },
    { name: "Admin Shop", path: "/admin-shop", icon: "bi-shop" },
    { name: "User Product", path: "/users-product", icon: "bi-box-seam" },
    { name: "User", path: "/users", icon: "bi-people" },
  ];

  return (
    <div className="sidebar">
      <h3 className="logo">Admin Panel</h3>

      {menu.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`sidebar-item ${
            location.pathname === item.path ? "active" : ""
          }`}
        >
          <i className={`bi ${item.icon}`} />
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;