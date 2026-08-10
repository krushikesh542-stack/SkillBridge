import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Sparkles, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_opportunities: 0, total_applications: 0, accepted: 0, pending: 0, reviewing: 0, rejected: 0 });
  const [completion, setCompletion] = useState(0);
  const displayName = user?.first_name || user?.username || "Member";

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("access");
      try {
        const response = await fetch(`${API_URL}/opportunities/dashboard/stats/`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) setStats(await response.json());
        if (user?.role === "student") {
          const profileResponse = await fetch(`${API_URL}/profiles/me/`, { headers: { Authorization: `Bearer ${token}` } });
          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            const fields = ["bio", "skills", "github_url", "linkedin_url", "resume"];
            const filled = fields.filter((field) => field === "skills" ? profile.skills?.length : profile[field]).length;
            setCompletion(Math.round((filled / fields.length) * 100));
          }
        }
      } catch {
        // Keep the dashboard usable with its empty-state values if the API is unavailable.
      }
    }
    loadDashboard();
  }, [user?.role]);

  const startupCards = [
    ["Total opportunities", stats.total_opportunities, "Opportunities you created"],
    ["Total applications", stats.total_applications, "Applications received"],
    ["Accepted", stats.accepted, "Successful applicants"],
    ["Pending", stats.pending, "Waiting for review"],
    ["Reviewing", stats.reviewing, "Currently being reviewed"],
    ["Rejected", stats.rejected, "Applications rejected"],
  ];

  return <>
    <section className="welcome-section reveal show"><div className="welcome-copy"><span className="eyebrow">{user?.role === "startup" ? "Recruiter Workspace" : user?.role === "mentor" ? "Mentor Workspace" : "Your Workspace"}</span><h1>Welcome back, <span>{displayName}</span></h1><p>{user?.role === "startup" ? "Manage opportunities, review applicants, and track hiring progress from one place." : user?.role === "mentor" ? "Connect with the SkillBridge community and explore curated learning resources." : "Explore opportunities, strengthen your profile, and track your applications."}</p><div className="welcome-actions"><button type="button" className="primary-action" onClick={() => navigate(user?.role === "startup" ? "/opportunities/create" : user?.role === "mentor" ? "/connections" : "/profile")}>{user?.role === "startup" ? "Create Opportunity" : user?.role === "mentor" ? "View Connections" : "Complete Profile"}<ArrowRight size={18} /></button><button type="button" className="secondary-action" onClick={() => navigate(user?.role === "mentor" ? "/learning" : "/opportunities")}>{user?.role === "mentor" ? "Explore Learning" : "Browse Opportunities"}</button></div></div><div className="welcome-visual"><div className="welcome-orb welcome-orb-one" /><div className="welcome-orb welcome-orb-two" /><div className="welcome-badge-card"><Sparkles size={20} /><span>{user?.role === "startup" ? "Build your talent pipeline" : user?.role === "mentor" ? "Share experience and keep growing" : "Build your career momentum"}</span></div></div></section>

    {user?.role === "student" && <section className="stats-grid reveal show"><article className="stat-card"><span>Profile completion</span><strong>{completion}%</strong><p>Keep your professional profile current</p><div className="profile-completion-bar"><div className="filled" style={{ width: `${completion}%` }} /></div></article><article className="stat-card"><span>My Applications</span><strong>{stats.total_applications}</strong><p>Applications submitted</p></article><article className="stat-card"><span>In progress</span><strong>{stats.pending + stats.reviewing}</strong><p>Pending or under review</p></article></section>}
    {user?.role === "startup" && <section className="stats-grid reveal show">{startupCards.map(([label, value, description]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value}</strong><p>{description}</p></article>)}</section>}
    {user?.role === "mentor" && <section className="stats-grid reveal show"><article className="stat-card"><UsersRound size={22} /><span>Professional network</span><strong>Connect</strong><p>Discover students, mentors, and startup teams.</p></article><article className="stat-card"><BriefcaseBusiness size={22} /><span>Learning library</span><strong>Explore</strong><p>Save and complete curated resources.</p></article></section>}
  </>;
}

export default Dashboard;
