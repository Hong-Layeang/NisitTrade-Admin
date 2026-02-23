import React from "react";
import StatsGrid from "../components/dashboard/statGrid.tsx";
import SalesChart from "../components/dashboard/saleChart.tsx";
import RecentActivity from "../components/dashboard/recentActivity.tsx";
import "../styles/dashboard.css";

const Dashboard: React.FC = () => {
  return (
    <>
      <h2 className="page-title">Dashboard</h2>

      <StatsGrid />

      <div className="dashboard-bottom">
        <SalesChart />
        <RecentActivity />
      </div>
    </>
  );
};

export default Dashboard;
