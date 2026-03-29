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
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
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
      {/* Page title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Welcome back! Here's what's happening with your Trading platform.</p>
      </div>

      {/* Top stats */}
      <div className="mb-6">
        <StatsGrid stats={topStats} />
      </div>

      {/*Income analytic*/}
      <div className="mb-6">
        <IncomeAnalytics stats={stats} />
      </div>

      {isLoading && (
        <div className="mb-6 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
          Loading dashboard data...
        </div>
      )}

      {!!loadError && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50/80 p-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/*Quick Action*/}
      <QuickActions actions={actions} />

      {/* Bottom section: chart (3/4) + activity (1/4) */}
      
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