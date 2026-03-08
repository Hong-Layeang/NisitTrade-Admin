import React from "react";
import StatsGrid from "../components/dashboard/statGrid.tsx";
import SalesChart from "../components/dashboard/saleChart.tsx";
import RecentActivity from "../components/dashboard/recentActivity.tsx";

const Dashboard: React.FC = () => {
  return (
    <>
      {/* Page title */}
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        Dashboard
      </h2>

      {/* Top stats */}
      <StatsGrid />

      {/* Bottom section: chart (3/4) + activity (1/4) */}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-5">
        <div className="lg:col-span-3">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>

    </>
  );
};

export default Dashboard;