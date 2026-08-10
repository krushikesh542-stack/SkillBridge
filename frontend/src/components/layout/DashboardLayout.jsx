import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    setSidebarOpen(false);

    if (onLogout) {
      onLogout();
    }

    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-shell">
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <main className="dashboard-main">
        <Navbar
          user={user}
          onMenuOpen={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;