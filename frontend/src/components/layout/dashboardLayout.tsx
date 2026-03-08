import React from "react";
import Sidebar from "./sidebar.tsx";
import Header from "./header.tsx";

type Props = { children: React.ReactNode };

const DashboardLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-body text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* Header is fixed height (h-16) */}
      <Header />

      <div className="flex">
        {/* Desktop sidebar: wide (256px), sticky under header, its own scroll */}
        <aside
          className={[
            "hidden lg:block",
            "w-64 shrink-0 border-r border-gray-200 dark:border-gray-800",
            "sticky top-16 h-[calc(100vh-64px)] overflow-y-auto",
          ].join(" ")}
        >
          <Sidebar />
        </aside>

        {/* Main content — min-w-0 prevents children from forcing sideways scroll */}
        <main className="flex-1 min-w-0 p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;