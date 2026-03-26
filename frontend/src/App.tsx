import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./components/layout/dashboardLayout.tsx";
import { getAdminToken } from "./lib/api.ts";

// Pages
import Dashboard from "./pages/dashboard.tsx";
import Users from "./pages/user.tsx";
import AdminShop from "./pages/adminshop.tsx";
import UsersProduct from "./pages/usersProduct.tsx";
import LoginPage from "./pages/loginpage.tsx";

const ProtectedApp: React.FC = () => {
  if (!getAdminToken()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/admin-shop" element={<AdminShop />} />
        <Route path="/users-product" element={<UsersProduct />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={getAdminToken() ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="*" element={<ProtectedApp />} />
    </Routes>
  );
}

export default App;