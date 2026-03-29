import React from "react";
import StatCard from "./statCard.tsx";

type StatItem = {
  title: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
};

interface StatsGridProps {
  stats: StatItem[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[15px]">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;