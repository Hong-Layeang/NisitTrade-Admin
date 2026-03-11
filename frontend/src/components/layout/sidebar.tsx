import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  const menu = [
    { name: "Dashboard", path: "/", icon: "bi-speedometer2" },
    { name: "Admin Shop", path: "/admin-shop", icon: "bi-shop" },
    { name: "User Product", path: "/users-product", icon: "bi-box-seam" },
    { name: "User", path: "/users", icon: "bi-people" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 px-3 py-5">
      <nav className="space-y-3">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 w-full no-underline",
                "rounded-xl px-3 py-3",
                !isActive &&
                  "text-slate-700 hover:bg-slate-100 dark:text-gray-200",
                isActive && "text-brand bg-brand/10",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <span className="flex items-center justify-center w-9 h-9 text-lg text-slate-500 dark:text-gray-300">
              <i className={`bi ${item.icon}`} />
            </span>

            <span className="text-[15px] font-medium whitespace-nowrap">
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;