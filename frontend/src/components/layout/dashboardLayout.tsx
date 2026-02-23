import React from "react";
import Sidebar from "./sidebar.tsx";
import Header from "./header.tsx";

type Props = { children: React.ReactNode };

const DashboardLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;