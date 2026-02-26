import React from "react";
import "../../styles/header.css";

const Header: React.FC = () => {
  return (
    <div className="app-header">
      <div className="app-header__left">
        <div className="logo-badge">
          <img
            src="/NisitTrade_logo.png"
            alt="NisitTrade"
            style={{ width: 100, height: 70, borderRadius: 50 }}
          />
        </div>
        <span className="app-title">NisitTrade</span>
      </div>

      <div className="app-header__right">
        <button className="icon-btn" aria-label="Search">
          <i className="bi bi-search" />
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <i className="bi bi-bell" />
        </button>
        <button className="icon-btn" aria-label="Settings">
          <i className="bi bi-gear" />
        </button>

        <div className="avatar" aria-label="Profile">
          <i className="bi bi-person" />
        </div>
      </div>
    </div>
  );
};

export default Header;