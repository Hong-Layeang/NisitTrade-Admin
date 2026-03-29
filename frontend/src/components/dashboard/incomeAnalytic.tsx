import React from "react";

// Define the props type
interface IncomeAnalyticsProps {
    stats: {
        todayIncome: number;
        weekIncome: number;
        monthIncome: number;
        incomeGrowth: number;
    };
}

const IncomeAnalytics: React.FC<IncomeAnalyticsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg shadow-sm">
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1">Today's Income</p>
                            <p className="text-xl sm:text-2xl font-bold">${stats.todayIncome.toLocaleString()}</p>
                            <p className="text-blue-200 text-xs sm:text-sm mt-1">Revenue today</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500 to-green-600 text-white rounded-lg shadow-sm">
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-xs sm:text-sm font-medium mb-1">This Week</p>
                            <p className="text-xl sm:text-2xl font-bold">${stats.weekIncome.toLocaleString()}</p>
                            <p className="text-green-200 text-xs sm:text-sm mt-1">Weekly revenue</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg shadow-sm">
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-xs sm:text-sm font-medium mb-1">This Month</p>
                            <p className="text-xl sm:text-2xl font-bold">${stats.monthIncome.toLocaleString()}</p>
                            <p className="text-purple-200 text-xs sm:text-sm mt-1">{stats.incomeGrowth}% growth</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomeAnalytics;