import { ChevronDown, Menu, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Navbar({ user, onMenuOpen, onLogout }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      const encoded = encodeURIComponent(searchTerm.trim());
      navigate(`/opportunities?search=${encoded}`);
    }
  };

  const toggleProfile = () => setProfileOpen((prev) => !prev);

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

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
        type="button"
        className="mobile-menu-button"
        onClick={onMenuOpen}
        aria-label="Open menu"
      >
        <Menu size={21} />
      </button>

        <div className="search-box">
        <Search size={18} />
        <input
          type="search"
          placeholder="Search opportunities..."
          aria-label="Search SkillBridge"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKey}
        />
      </div>
      </div>

      <div className="topbar-actions">
        <div className="topbar-profile" ref={dropdownRef}>
          <button
            type="button"
            className="profile-toggle"
            aria-haspopup="true"
            aria-expanded={profileOpen}
            onClick={toggleProfile}
            style={{ display: "flex", alignItems: "center", background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <div className="avatar small" aria-hidden="true">
              {firstLetter}
            </div>
            <div className="topbar-profile-text" style={{ marginLeft: "0.5rem" }}>
              <strong>{displayName}</strong>
              <span>{user?.email}</span>
            </div>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          {profileOpen && (
            <ul className="profile-dropdown" style={{ position: "absolute", right: 0, top: "100%", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", listStyle: "none", margin: 0, padding: "0.5rem 0", borderRadius: "4px", minWidth: "150px", zIndex: 1000 }}>
              <li>
                <Link to="/profile" onClick={() => setProfileOpen(false)} style={{ display: "block", padding: "0.5rem 1rem", textDecoration: "none", color: "inherit" }}>Profile</Link>
              </li>
              <li>
                <Link to="/settings" onClick={() => setProfileOpen(false)} style={{ display: "block", padding: "0.5rem 1rem", textDecoration: "none", color: "inherit" }}>Settings</Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); if (onLogout) onLogout(); }}
                  style={{ width: "100%", padding: "0.5rem 1rem", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
