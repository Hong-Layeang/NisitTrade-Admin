import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatsGrid from "../components/dashboard/statGrid.tsx";
import SalesChart from "../components/dashboard/saleChart.tsx";
import RecentActivity from "../components/dashboard/recentActivity.tsx";
import IncomeAnalytics from "../components/dashboard/incomeAnalytic.tsx";
import QuickActions from "../components/dashboard/quickAction.tsx";
import DailyIncomeChart from "../components/dashboard/chart/dailyincomeCard.tsx";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const Adminshop = () => {
    navigate("/admin-shop");
  };

  const UserProduct = () => {
    navigate("/users-product");
  };

  const handleManageUser = () => {
    navigate("/users");
  };
  
  const actions = [
    { label: "Admin Shop", onClick: Adminshop, icon: <span>+</span>, color: "bg-blue-500/10" },
    { label: "User Product", onClick: UserProduct, icon: <span>👤</span>, color: "bg-green-500/10" },
    { label: "Users", onClick: handleManageUser, icon: <span>👤</span>, color: "bg-green-500/10" },
  ];


  const [stats, setStats] = useState({
    todayIncome: 0,
    weekIncome: 0,
    monthIncome: 0,
    incomeGrowth: 0,
  });
  const [dailyIncomeData, setDailyIncomeData] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [courseData, setCourseData] = useState([]);

  return (
    <>
      {/* Page title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Welcome back! Here's what's happening with your Trading platform.</p>
      </div>

      {/* Top stats */}
      <div className="mb-6">
        <StatsGrid />
      </div>

      {/*Income analytic*/}
      <div className="mb-6">
        <IncomeAnalytics stats={stats} />
      </div>

      {/*Quick Action*/}
      <QuickActions actions={actions} />

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