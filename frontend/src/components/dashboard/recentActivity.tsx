import React from "react";
import { FaUserPlus, FaShoppingCart, FaBoxOpen, FaEdit, FaDollarSign } from "react-icons/fa";

const iconByType = {
  user: <FaUserPlus />,
  sold: <FaShoppingCart />,
  listed: <FaBoxOpen />,
  report: <FaEdit />,
  revenue: <FaDollarSign />,
} as const;

const styleByType = {
  user: { color: "#2563eb", bg: "#eff6ff" },
  sold: { color: "#16a34a", bg: "#f0fdf4" },
  listed: { color: "#ea580c", bg: "#fff7ed" },
  report: { color: "#9333ea", bg: "#faf5ff" },
  revenue: { color: "#dc2626", bg: "#fef2f2" },
} as const;

type ActivityType = keyof typeof iconByType;

export type ActivityItem = {
  text: string;
  time: string;
  type: ActivityType;
};

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-card border border-card dark:border-gray-800 p-3 h-[360px] flex flex-col">
      <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 truncate">
        Recent Activity
      </h5>

      {/* Scrollable list to keep card height fixed */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-gray-800">
        {activities.map((activity, index) => {
          const style = styleByType[activity.type];
          const icon = iconByType[activity.type];
          return (
          <div key={index} className="py-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-[10px] text-[16px] shrink-0"
                style={{ color: style.color, backgroundColor: style.bg }}
              >
                {icon}
              </div>

              <div className="min-w-0">
                <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {activity.text}
                </div>
                <small className="text-[12px] text-slate-400">{activity.time}</small>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;