import {
  BookOpen,
  BriefcaseBusiness,
  CirclePlus,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import BrandLogo from "../brand/BrandLogo";

function Sidebar({ user, sidebarOpen, setSidebarOpen, onLogout }) {
  const displayName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username ||
    user?.email ||
    "User";

  const firstLetter =
    user?.first_name?.charAt(0).toUpperCase() ||
    user?.username?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  const isStartup = user?.role === "startup";

  const studentNavItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Opportunities",
      path: "/opportunities",
      icon: BriefcaseBusiness,
    },
    {
      label: "My Applications",
      path: "/applications",
      icon: BriefcaseBusiness,
    },
    {
      label: "Connections",
      path: "/connections",
      icon: UsersRound,
    },
    {
      label: "Learning",
      path: "/learning",
      icon: BookOpen,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: UserRound,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  const startupNavItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Opportunities",
      path: "/opportunities",
      icon: BriefcaseBusiness,
    },
    {
      label: "Create Opportunity",
      path: "/opportunities/create",
      icon: CirclePlus,
    },
    {
      label: "My Opportunities",
      path: "/opportunities/my",
      icon: BriefcaseBusiness,
    },
    {
      label: "Connections",
      path: "/connections",
      icon: UsersRound,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: UserRound,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  const mentorNavItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Connections", path: "/connections", icon: UsersRound },
    { label: "Learning", path: "/learning", icon: BookOpen },
    { label: "Profile", path: "/profile", icon: UserRound },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  const navItems = isStartup ? startupNavItems : user?.role === "mentor" ? mentorNavItems : studentNavItems;

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-mark">
              <BrandLogo variant="icon" tone="light" label="SkillBridge" />
            </div>

            <div className="sidebar-brand-text">
              <strong>SkillBridge</strong>
              <span>
                {isStartup ? "Recruiter Workspace" : user?.role === "mentor" ? "Mentor Workspace" : "Student Workspace"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-section-label">
          Workspace
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <div className="nav-icon-wrap">
                  <Icon size={18} />
                </div>

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-profile">
          <div className="avatar">
            {firstLetter}
          </div>

          <div className="sidebar-user-details">
            <strong>{displayName}</strong>

            <span>
              {isStartup ? "Startup / Recruiter" : user?.role === "mentor" ? "Mentor" : "Student"}
            </span>
          </div>

          <button
            type="button"
            className="logout-icon"
            onClick={onLogout}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
