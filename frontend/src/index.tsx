import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import "./styles/tailwind.css";

// Keep only Bootstrap components (modals, grid, etc.)
import "bootstrap/dist/css/bootstrap.min.css";
// use bootstrap icons
import "bootstrap-icons/font/bootstrap-icons.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>   
      <div className="bg-body min-h-screen overflow-x-hidden">
        <App />
      </div>
    </BrowserRouter>
  </React.StrictMode>
);