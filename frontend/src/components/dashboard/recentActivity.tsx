import React, { useState } from "react";
import { FaUserPlus, FaShoppingCart, FaBoxOpen, FaEdit, FaDollarSign, FaTrashAlt, FaUserSlash } from "react-icons/fa";

const iconByType = {
  user: <FaUserPlus />,
  sold: <FaShoppingCart />,
  listed: <FaBoxOpen />,
  report: <FaEdit />,
  revenue: <FaDollarSign />,
  product_created: <FaBoxOpen />,
  product_updated: <FaEdit />,
  product_deleted: <FaTrashAlt />,
  product_marked_sold: <FaShoppingCart />,
  admin_deleted_product: <FaTrashAlt />,
  admin_banned_user: <FaUserSlash />,
  admin_updated_something: <FaEdit />,
} as const;

const styleByType = {
  user: { color: "#2563eb", bg: "#eff6ff" },
  sold: { color: "#16a34a", bg: "#f0fdf4" },
  listed: { color: "#ea580c", bg: "#fff7ed" },
  report: { color: "#9333ea", bg: "#faf5ff" },
  revenue: { color: "#dc2626", bg: "#fef2f2" },
  product_created: { color: "#ea580c", bg: "#fff7ed" },
  product_updated: { color: "#6366f1", bg: "#eef2ff" },
  product_deleted: { color: "#dc2626", bg: "#fef2f2" },
  product_marked_sold: { color: "#16a34a", bg: "#f0fdf4" },
  admin_deleted_product: { color: "#b91c1c", bg: "#fee2e2" },
  admin_banned_user: { color: "#b91c1c", bg: "#fee2e2" },
  admin_updated_something: { color: "#9333ea", bg: "#faf5ff" },
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
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-card border border-card dark:border-gray-800 p-3 h-[360px] flex flex-col">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recent Activity
          </h5>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-xs font-medium text-brand hover:underline"
          >
            See all
          </button>
        </div>

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

                <div className="min-w-0 w-full">
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

      {showAll && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <h6 className="text-base font-semibold text-slate-900 dark:text-slate-100">All Recent Activities</h6>
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="rounded-md border border-gray-200 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:text-slate-300 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100 dark:divide-gray-800">
              {activities.map((activity, index) => {
                const style = styleByType[activity.type];
                const icon = iconByType[activity.type];
                return (
                  <div key={`all-${index}`} className="py-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-[10px] text-[16px] shrink-0"
                        style={{ color: style.color, backgroundColor: style.bg }}
                      >
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 dark:text-slate-100 break-words">
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
        </div>
      )}
    </>
  );
};

export default RecentActivity;