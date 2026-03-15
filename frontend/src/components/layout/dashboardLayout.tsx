import { Outlet } from "react-router-dom";
import AdminSidebar from "./sidebar.tsx";

export default function AdminLayout() {
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
