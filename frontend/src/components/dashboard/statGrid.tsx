import React from "react";
import StatCard from "./statCard.tsx";

const StatsGrid: React.FC = () => {
  const stats = [
    { title: "Users", value: "1245", icon: "bi-people" },
    { title: "Revenue", value: "$23,450", icon: "bi-cash-stack" },
    { title: "Total User Product", value: "532", icon: "bi-box" },
    { title: "Remaining Listing", value: "89", icon: "bi-list-check" },
    { title: "Product Sold", value: "1,024", icon: "bi-bag-check" },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;