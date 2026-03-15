import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DailyIncomeChartProps {
    data: { date: string; income: number }[];
    isMobile: boolean;
}

const DailyIncomeChart: React.FC<DailyIncomeChartProps> = ({ data, isMobile }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs sm:text-sm text-gray-600"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis axisLine={false} tickLine={false} className="text-xs sm:text-sm text-gray-600" tickFormatter={(value) => `$${value}`} />
                <Tooltip
                    formatter={(value) => [`$${value}`, "Income"]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US')}
                />
                <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DailyIncomeChart;