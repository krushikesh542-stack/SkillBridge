import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import "./App.css";

const API_URL = "http://127.0.0.1:8001/api";

function App() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");

    if (savedToken) {
      fetchCurrentUser(savedToken);
    }
  }, []);

  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [user]);

  const fetchCurrentUser = async (accessToken) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setUser(response.data);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const loginResponse = await axios.post(
        `${API_URL}/auth/login/`,
        formData
      );

      const { access, refresh } = loginResponse.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      await fetchCurrentUser(access);

      setMessage("Login successful.");
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.detail ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setUser(null);
    setSidebarOpen(false);
    setMessage("You have logged out.");
  };

  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand-mark">
            <Sparkles size={22} />
          </div>

          <h1>SkillBridge</h1>

          <p className="auth-subtitle">
            Connect with students, mentors and growing startups.
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="teststudent3@example.com"
              required
            />

            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {message && <p className="message">{message}</p>}
        </section>
      </main>
    );
  }

  const displayName =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.username;

  return (
    <div className="dashboard-shell">
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <Sparkles size={20} />
            </div>

            <div>
              <strong>SkillBridge</strong>
              <span>Student Network</span>
            </div>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button className="nav-item">
            <BriefcaseBusiness size={19} />
            Opportunities
          </button>

          <button className="nav-item">
            <UsersRound size={19} />
            Connections
          </button>

          <button className="nav-item">
            <BookOpen size={19} />
            Learning
          </button>

          <button className="nav-item">
            <UserRound size={19} />
            Profile
          </button>

          <button className="nav-item">
            <Settings size={19} />
            Settings
          </button>
        </nav>

        <div className="sidebar-profile">
          <div className="avatar">
            {user.first_name?.charAt(0).toUpperCase() ||
              user.username.charAt(0).toUpperCase()}
          </div>

          <div className="sidebar-user-details">
            <strong>{displayName}</strong>
            <span>{user.role}</span>
          </div>

          <button
            className="logout-icon"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="search-box">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search opportunities, people or skills"
            />
          </div>

          <div className="topbar-actions">
            <button className="notification-button">
              <Bell size={20} />
              <span className="notification-dot" />
            </button>

            <div className="topbar-profile">
              <div className="avatar small">
                {user.first_name?.charAt(0).toUpperCase() ||
                  user.username.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{displayName}</strong>
                <span>{user.email}</span>
              </div>

              <ChevronDown size={17} />
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-section reveal">
            <div>
              <span className="eyebrow">Your workspace</span>

              <h1>
                Welcome back,{" "}
                <span>{user.first_name || user.username}</span>
              </h1>

              <p>
                Explore opportunities, strengthen your profile and connect
                with people who can help you grow.
              </p>
            </div>

            <button className="primary-action">
              Complete profile
              <ArrowRight size={18} />
            </button>
          </section>

          <section className="stats-grid reveal">
            <article className="stat-card">
              <span>Profile completion</span>
              <strong>72%</strong>

              <div className="progress-track">
                <div className="progress-value" />
              </div>
            </article>

            <article className="stat-card">
              <span>New opportunities</span>
              <strong>12</strong>
              <p>Matched with your skills</p>
            </article>

            <article className="stat-card">
              <span>Connections</span>
              <strong>28</strong>
              <p>4 new this week</p>
            </article>

            <article className="stat-card">
              <span>Learning progress</span>
              <strong>64%</strong>
              <p>Continue your current path</p>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel opportunities-panel reveal">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Recommended for you</span>
                  <h2>Latest opportunities</h2>
                </div>

                <button className="text-button">
                  View all
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="opportunity-list">
                <div className="opportunity-item">
                  <div className="company-logo">N</div>

                  <div className="opportunity-info">
                    <h3>Frontend Developer Intern</h3>
                    <p>Nova Labs · Remote</p>

                    <div className="tag-row">
                      <span>React</span>
                      <span>JavaScript</span>
                      <span>Internship</span>
                    </div>
                  </div>

                  <button className="apply-button">View</button>
                </div>

                <div className="opportunity-item">
                  <div className="company-logo">B</div>

                  <div className="opportunity-info">
                    <h3>Junior Backend Developer</h3>
                    <p>ByteWorks · Bengaluru</p>

                    <div className="tag-row">
                      <span>Django</span>
                      <span>Python</span>
                      <span>Entry level</span>
                    </div>
                  </div>

                  <button className="apply-button">View</button>
                </div>

                <div className="opportunity-item">
                  <div className="company-logo">C</div>

                  <div className="opportunity-info">
                    <h3>Full-Stack Project Contributor</h3>
                    <p>CodeCircle · Hybrid</p>

                    <div className="tag-row">
                      <span>React</span>
                      <span>Django</span>
                      <span>Project</span>
                    </div>
                  </div>

                  <button className="apply-button">View</button>
                </div>
              </div>
            </article>

            <aside className="panel profile-panel reveal">
              <span className="eyebrow">Your profile</span>
              <h2>Stand out to recruiters</h2>

              <div className="profile-progress-circle">
                <span>72%</span>
              </div>

              <p>
                Add your project links, skills and a short professional bio.
              </p>

              <button className="secondary-action">
                Improve profile
                <ArrowRight size={17} />
              </button>
            </aside>
          </section>

          <section className="panel activity-panel reveal">
            <div className="panel-header">
              <div>
                <span className="eyebrow">Recent activity</span>
                <h2>Your progress</h2>
              </div>
            </div>

            <div className="activity-grid">
              <div className="activity-item">
                <div className="activity-icon">
                  <UserRound size={18} />
                </div>

                <div>
                  <h3>Profile information updated</h3>
                  <p>Your account information is ready.</p>
                </div>

                <span>Today</span>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h3>SkillBridge account created</h3>
                  <p>Your learning and career journey has started.</p>
                </div>

                <span>Recently</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;