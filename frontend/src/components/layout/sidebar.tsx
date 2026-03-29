import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard, MdLibraryBooks, MdCategory, MdPeople, MdLogout } from "react-icons/md";

export default function AdminSidebar() {
  const location = useLocation(); // <-- dynamic
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const menuItems = [
    { path: "/", label: "Dashboard", icon: MdDashboard },
    { path: "/admin-shop", label: "Admin Shop", icon: MdLibraryBooks },
    { path: "/users-product", label: "User Product", icon: MdCategory },
    { path: "/users", label: "Users", icon: MdPeople },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.innerWidth < 640) setIsCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/");
    window.location.reload();
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-lg shadow-lg sm:hidden"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      <div
        className={`bg-gradient-to-b from-[#2C3E50] to-slate-800 text-white transition-all duration-300 h-full shadow-2xl border-r border-slate-700 
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobile ? `fixed top-0 left-0 z-40 h-screen ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} transform transition-transform duration-300` : ''}
          sm:relative sm:translate-x-0
        `}
        style={{ minHeight: '100vh' }}
      >
        <div className="p-4 h-full flex flex-col">
          {/* header + collapse button */}
          <div className="flex items-center justify-between mb-10 mt-2">
            {!isCollapsed && (
              <div className="flex items-center space-x-3"> {/* increase gap */}
                {/* Logo */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img
                    src="NisitTrade_Logo.png" // adjust path if needed
                    alt="Nisit Trade Logo"
                    className="w-[100px] h-[70px] rounded-[50px] object-cover" // fits nicely inside container
                  />
                </div>
                <h2 className="text-xl font-bold bg-white bg-clip-text text-transparent">
                  Nisit Trade
                </h2>
              </div>
            )}
            {/* Hide collapse button on mobile, use mobile menu button instead */}
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-300 hover:text-white hover:bg-slate-700/70 p-2 rounded-lg transition-all duration-200"
              >
                <svg
                  className={`w-5 h-5 transform transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
          {/* menu */}
          <nav className="space-y-2 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 min-h-0">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-gradient-to-r from-blue-800/20 to-[#2C3E50] border-l-4 border-grey-600 shadow-md"
                    : "hover:bg-slate-700/40"
                    }`}
                >
                  <IconComponent className="text-lg" />
                  {!isCollapsed && (
                    <span className={`font-medium ${isActive ? "text-blue-200" : "text-gray-300 group-hover:text-white"}`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          {/* Logout Button */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group hover:bg-red-600/20 w-full text-left"
            >
              <MdLogout className="text-lg text-red-400" />
              {!isCollapsed && (
                <span className="font-medium text-red-400 group-hover:text-red-300">
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

