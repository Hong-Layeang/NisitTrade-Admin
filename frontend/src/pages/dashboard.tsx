import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatsGrid from "../components/dashboard/statGrid.tsx";
import SalesChart from "../components/dashboard/saleChart.tsx";
import RecentActivity, { ActivityItem } from "../components/dashboard/recentActivity.tsx";
import IncomeAnalytics from "../components/dashboard/incomeAnalytic.tsx";
import QuickActions from "../components/dashboard/quickAction.tsx";
import { apiRequest } from "../lib/api.ts";

type DashboardSummaryResponse = {
  stats?: {
    users?: number;
    revenue?: number;
    totalUserProduct?: number;
    remainingListing?: number;
    productSold?: number;
  };
  income?: {
    todayIncome?: number;
    weekIncome?: number;
    monthIncome?: number;
    incomeGrowth?: number;
  };
  salesOverview?: Array<{ month: string; value: number }>;
  activities?: Array<{
    text?: string;
    type?: ActivityItem["type"];
    created_at?: string;
  }>;
};

function parseNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatRelativeTime(dateValue?: string): string {
  if (!dateValue) return "just now";
  const diffMs = Date.now() - new Date(dateValue).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [stats, setStats] = useState({
    todayIncome: 0,
    weekIncome: 0,
    monthIncome: 0,
    incomeGrowth: 0,
  });

  const [topStats, setTopStats] = useState([
    { title: "Users", value: "0", icon: "bi-people", color: "#2563eb", bg: "#eff6ff" },
    { title: "Revenue", value: "$0", icon: "bi-cash-stack", color: "#16a34a", bg: "#f0fdf4" },
    { title: "Total User Product", value: "0", icon: "bi-box", color: "#ea580c", bg: "#fff7ed" },
    { title: "Remaining Listing", value: "0", icon: "bi-list-check", color: "#9333ea", bg: "#faf5ff" },
    { title: "Product Sold", value: "0", icon: "bi-bag-check", color: "#dc2626", bg: "#fef2f2" },
  ]);

  const [salesData, setSalesData] = useState<Array<{ month: string; value: number }>>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const summary = await apiRequest<DashboardSummaryResponse>("/api/dashboard/summary");
        if (!isMounted) return;

        const summaryStats = summary?.stats || {};
        const summaryIncome = summary?.income || {};
        const salesOverviewData = Array.isArray(summary?.salesOverview) ? summary.salesOverview : [];
        const mappedActivities: ActivityItem[] = (Array.isArray(summary?.activities) ? summary.activities : []).map((item) => ({
          text: item?.text || "Activity",
          time: formatRelativeTime(item?.created_at),
          type: item?.type || "listed",
        }));

        setTopStats([
          { title: "Users", value: `${parseNumber(summaryStats.users)}`, icon: "bi-people", color: "#2563eb", bg: "#eff6ff" },
          { title: "Revenue", value: `$${parseNumber(summaryStats.revenue).toLocaleString()}`, icon: "bi-cash-stack", color: "#16a34a", bg: "#f0fdf4" },
          { title: "Total User Product", value: `${parseNumber(summaryStats.totalUserProduct)}`, icon: "bi-box", color: "#ea580c", bg: "#fff7ed" },
          { title: "Remaining Listing", value: `${parseNumber(summaryStats.remainingListing)}`, icon: "bi-list-check", color: "#9333ea", bg: "#faf5ff" },
          { title: "Product Sold", value: `${parseNumber(summaryStats.productSold)}`, icon: "bi-bag-check", color: "#dc2626", bg: "#fef2f2" },
        ]);

        setStats({
          todayIncome: parseNumber(summaryIncome.todayIncome),
          weekIncome: parseNumber(summaryIncome.weekIncome),
          monthIncome: parseNumber(summaryIncome.monthIncome),
          incomeGrowth: parseNumber(summaryIncome.incomeGrowth),
        });
        setSalesData(salesOverviewData);
        setActivities(mappedActivities);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load dashboard data");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();
    return () => { isMounted = false; };
  }, []);

  const actions = useMemo(() => [
    {
      label: "Admin Shop",
      onClick: () => navigate("/admin-shop"),
      icon: <i className="bi bi-shop" />,
      color: "bg-[#2C3E50]/10 text-[#2C3E50] hover:bg-[#2C3E50]/20",
    },
    {
      label: "Users",
      onClick: () => navigate("/users"),
      icon: <i className="bi bi-person-check" />,
      color: "bg-[#27AE60]/10 text-[#27AE60] hover:bg-[#27AE60]/20",
    },
    {
      label: "User Product",
      onClick: () => navigate("/users-product"),
      icon: <i className="bi bi-bar-chart-line" />,
      color: "bg-[#8E44AD]/10 text-[#8E44AD] hover:bg-[#8E44AD]/20",
    },
    {
      label: "Add Product",
      onClick: () => navigate("/admin-shop"),
      icon: <i className="bi bi-plus-circle" />,
      color: "bg-brand text-white hover:opacity-95",
    },
  ], [navigate]);

  return (
    <>
      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand/10">
            <i className="bi bi-speedometer2 text-brand text-base" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] dark:text-white">Admin Dashboard</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base ml-10">
          Welcome back! Here's what's happening with your trading platform.
        </p>
      </div>

      {/* Loading / error banners */}
      {isLoading && (
        <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/60 px-4 py-3 text-sm text-slate-500 dark:text-slate-300">
          <svg className="animate-spin h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading dashboard data…
        </div>
      )}

      {!!loadError && (
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <i className="bi bi-exclamation-circle-fill mt-0.5 shrink-0" />
          {loadError}
        </div>
      )}

      {/* Top stats */}
      <div className="mb-6">
        <StatsGrid stats={topStats} />
      </div>

      {/* Income analytics */}
      <div className="mb-6">
        <IncomeAnalytics stats={stats} />
      </div>

      {/* Quick actions */}
      <QuickActions actions={actions} />

      {/* Chart + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-5">
        <div className="lg:col-span-3">
          <SalesChart data={salesData} />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;