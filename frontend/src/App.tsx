import React from "react";
import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./components/layout/dashboardLayout.tsx";

// Pages
import Dashboard from "./pages/dashboard.tsx";
import Users from "./pages/user.tsx";
import AdminShop from "./pages/adminshop.tsx";
import UsersProduct from "./pages/usersProduct.tsx";

function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/admin-shop" element={<AdminShop />} />
        <Route path="/users-product" element={<UsersProduct />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;