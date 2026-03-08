import React from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { month: "Jan", value: 400 },
  { month: "Feb", value: 600 },
  { month: "Mar", value: 500 },
  { month: "Apr", value: 800 },
  { month: "May", value: 750 },
  { month: "Jun", value: 950 },
];

const SalesChart: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-card border border-card dark:border-gray-800 p-4 md:p-5 overflow-hidden h-[360px]">
      <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
        Sales Overview
      </h5>

      <div className="h-[calc(100%-1.75rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#00A3E7" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;