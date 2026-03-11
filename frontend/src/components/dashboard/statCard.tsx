// src/components/dashboard/statCard.tsx
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bg }) => {
  return (
    <div
      className={[
        "p-4 flex items-center gap-3",
        "rounded-card border border-card bg-white shadow-card",
        "transition duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        "dark:bg-gray-900 dark:border-gray-800",
      ].join(" ")}
    >
      <div
        className="grid place-items-center w-[36px] h-[36px] rounded-[10px] text-[20px] shrink-0"
        style={{ color, backgroundColor: bg }}
      >
        <i className={`bi ${icon}`} />
      </div>

      <div className="min-w-0">
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{title}</div>
        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {value}
        </div>
      </div>
    </div>
  );
};

export default StatCard;