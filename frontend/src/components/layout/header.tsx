import React from "react";
import { useNavigate } from "react-router-dom";
import { adminLogout } from "../../lib/api.ts";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch {
      // Token is still cleared by adminLogout finally block.
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div
      className={[
        "h-16 bg-white border-b border-[#eef1f5]",
        "flex items-center justify-between",
        "px-4 md:px-6",
        "dark:bg-gray-900 dark:border-gray-800",
        "sticky top-0 z-40",
      ].join(" ")}
    >
      <div className="flex items-center">
        <img
          src="/NisitTrade_logo.png"
          alt="NisitTrade"
          className="w-[100px] h-[70px] rounded-[50px] object-cover"
        />
        <span className="ml-3 text-xl font-bold text-brand">NisitTrade</span>
      </div>

      <div className="flex items-center gap-2.5">
        {["search", "bell", "gear"].map((n) => (
          <button
            key={n}
            className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lgx w-9 h-9 grid place-items-center text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800"
            aria-label={n}
          >
            <i className={`bi bi-${n}`} />
          </button>
        ))}
        <div className="w-9 h-9 rounded-full grid place-items-center ml-1 bg-[#e6f4ff] text-[#1d4ed8] dark:bg-blue-950/40 dark:text-blue-300">
          <i className="bi bi-person" />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="ml-1 inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 px-3 h-9 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800"
          title="Logout"
        >
          <i className="bi bi-box-arrow-right" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;