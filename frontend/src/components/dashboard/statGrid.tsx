import React from "react";
import StatCard from "./statCard.tsx";

const StatsGrid: React.FC = () => {
  const stats = [
    { title: "Users", value: "1245", icon: "bi-people", color: "#2563eb", bg: "#eff6ff" },
    { title: "Revenue", value: "$23,450", icon: "bi-cash-stack", color: "#16a34a", bg: "#f0fdf4" },
    { title: "Total User Product", value: "532", icon: "bi-box", color: "#ea580c", bg: "#fff7ed" },
    { title: "Remaining Listing", value: "89", icon: "bi-list-check", color: "#9333ea", bg: "#faf5ff" },
    { title: "Product Sold", value: "1,024", icon: "bi-bag-check", color: "#dc2626", bg: "#fef2f2" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[15px]">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;