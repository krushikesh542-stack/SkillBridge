import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import DashboardLayout from "./components/layout/DashboardLayout";
import SeoMeta from "./components/SeoMeta";
import { API_URL } from "./config/api";
import Connections from "./pages/Connections";
import CreateOpportunity from "./pages/CreateOpportunity";
import Dashboard from "./pages/Dashboard";
import EditOpportunity from "./pages/EditOpportunity";
import Learning from "./pages/Learning";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import MyApplications from "./pages/MyApplications";
import MyOpportunities from "./pages/MyOpportunities";
import Opportunities from "./pages/Opportunities";
import OpportunityDetails from "./pages/OpportunityDetails";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import ViewApplicants from "./pages/ViewApplicants";

function getAccessToken() {
  return localStorage.getItem("access") || localStorage.getItem("accessToken") || localStorage.getItem("access_token");
}

function ProtectedRoute({ user, loading, children }) {
  if (loading) return <div className="app-loading">Loading SkillBridge...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ user, allowedRoles, children }) {
  return allowedRoles.includes(user?.role) ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      const accessToken = getAccessToken();
      if (!accessToken) { setLoadingUser(false); return; }
      try {
        const response = await fetch(`${API_URL}/auth/me/`, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (!response.ok) throw new Error("Your login session has expired.");
        setUser(await response.json());
      } catch {
        ["access", "accessToken", "access_token", "refresh", "refreshToken", "refresh_token"].forEach((key) => localStorage.removeItem(key));
        setUser(null);
      } finally { setLoadingUser(false); }
    }
    loadCurrentUser();
  }, []);

  const handleLogout = () => {
    ["access", "accessToken", "access_token", "refresh", "refreshToken", "refresh_token"].forEach((key) => localStorage.removeItem(key));
    setUser(null);
  };

  return <><SeoMeta /><Routes>
    <Route path="/" element={loadingUser ? <div className="app-loading">Loading SkillBridge...</div> : user ? <Navigate to="/dashboard" replace /> : <Landing />} />
    <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={setUser} />} />
    <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
    <Route element={<ProtectedRoute user={user} loading={loadingUser}><DashboardLayout user={user} onLogout={handleLogout} /></ProtectedRoute>}>
      <Route path="dashboard" element={<Dashboard user={user} />} />
      <Route path="opportunities" element={<Opportunities />} />
      <Route path="opportunities/:id/applicants" element={<RoleRoute user={user} allowedRoles={["startup"]}><ViewApplicants /></RoleRoute>} />
      <Route path="opportunities/create" element={<RoleRoute user={user} allowedRoles={["startup"]}><CreateOpportunity /></RoleRoute>} />
      <Route path="opportunities/my" element={<RoleRoute user={user} allowedRoles={["startup"]}><MyOpportunities /></RoleRoute>} />
      <Route path="opportunities/:id/edit" element={<RoleRoute user={user} allowedRoles={["startup"]}><EditOpportunity /></RoleRoute>} />
      <Route path="applications" element={<RoleRoute user={user} allowedRoles={["student"]}><MyApplications /></RoleRoute>} />
      <Route path="opportunities/:id" element={<OpportunityDetails user={user} />} />
      <Route path="connections" element={<Connections />} />
      <Route path="learning" element={<Learning />} />
      <Route path="profile" element={<Profile user={user} />} />
      <Route path="settings" element={<Settings onLogout={handleLogout} />} />
    </Route>
    <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
  </Routes></>;
}

export default App;
