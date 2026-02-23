import React from "react";

const activities = [
  { text: "New user registered", time: "2 mins ago" },
  { text: "Product sold", time: "10 mins ago" },
  { text: "New product listed", time: "30 mins ago" },
  { text: "Admin updated shop", time: "1 hour ago" },
  { text: "Revenue updated", time: "2 hours ago" },
];

const RecentActivity: React.FC = () => {
  return (
    <div className="activity-card">
      <h5>Recent Activity</h5>

      {activities.map((activity, index) => (
        <div key={index} className="activity-item">
          <div>{activity.text}</div>
          <small>{activity.time}</small>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;
