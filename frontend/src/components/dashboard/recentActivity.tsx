import React from "react";
import { FaUserPlus, FaShoppingCart, FaBoxOpen, FaEdit, FaDollarSign } from "react-icons/fa";

const activities = [
  { text: "New user registered", time: "2 mins ago", icon: <FaUserPlus />, color: "#2563eb", bg: "#eff6ff" },
  { text: "Product sold", time: "10 mins ago", icon: <FaShoppingCart />, color: "#16a34a", bg: "#f0fdf4" },
  { text: "New product listed", time: "30 mins ago", icon: <FaBoxOpen />, color: "#ea580c", bg: "#fff7ed" },
  { text: "Admin updated shop", time: "1 hour ago", icon: <FaEdit />, color: "#9333ea", bg: "#faf5ff" },
  { text: "Revenue updated", time: "2 hours ago", icon: <FaDollarSign />, color: "#dc2626", bg: "#fef2f2" },
];

const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-card border border-card dark:border-gray-800 p-3 h-[360px] flex flex-col">
      <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 truncate">
        Recent Activity
      </h5>

      {/* Scrollable list to keep card height fixed */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-gray-800">
        {activities.map((activity, index) => (
          <div key={index} className="py-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-[10px] text-[16px] shrink-0"
                style={{ color: activity.color, backgroundColor: activity.bg }}
              >
                {activity.icon}
              </div>

              <div className="min-w-0">
                <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {activity.text}
                </div>
                <small className="text-[12px] text-slate-400">{activity.time}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;