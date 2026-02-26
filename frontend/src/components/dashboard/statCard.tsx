import React from "react";

type Props = {
  title: string;
  value: string;
  icon: string;
};

const StatCard: React.FC<Props> = ({ title, value, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <i className={`bi ${icon}`} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );
};

export default StatCard;
