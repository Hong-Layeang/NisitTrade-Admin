import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { apiRequest } from "../../lib/api.ts";
import AdminSidebar from "./sidebar.tsx";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const validateAdminSession = async () => {
      const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
      const role = localStorage.getItem("role");

      if (!token || role !== "admin") {
        if (isMounted) {
          navigate("/login", { replace: true });
        }
        return;
      }

      try {
        const currentUser = await apiRequest<{ role?: string }>("/api/auth/me");
        if (!isMounted) return;

        if (currentUser?.role !== "admin") {
          localStorage.removeItem("token");
          localStorage.removeItem("admin_token");
          localStorage.removeItem("role");
          localStorage.removeItem("email");
          navigate("/login", { replace: true });
          return;
        }

        setIsCheckingAuth(false);
      } catch {
        if (!isMounted) return;
        navigate("/login", { replace: true });
      }
    };

    validateAdminSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (isCheckingAuth) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6">
          <Outlet /> {/* renders Dashboard, ManageCourse, etc. */}
        </div>
      </main>
    </div>
  );
}
