import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "../components/brand/BrandLogo";
import { API_URL } from "../config/api";
import "./Login.css";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: location.state?.email || "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = ({ target: { name, value } }) => setFormData((data) => ({ ...data, [name]: value }));
  const handleSubmit = async (event) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch(`${API_URL}/auth/login/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const loginData = await response.json();
      if (!response.ok) throw new Error(loginData.detail || loginData.message || "Invalid email or password.");
      localStorage.setItem("access", loginData.access); localStorage.setItem("refresh", loginData.refresh);
      const userResponse = await fetch(`${API_URL}/auth/me/`, { headers: { Authorization: `Bearer ${loginData.access}` } });
      const userData = await userResponse.json();
      if (!userResponse.ok) throw new Error(userData.detail || "Could not load your account.");
      onLogin(userData); navigate("/dashboard");
    } catch (requestError) {
      localStorage.removeItem("access"); localStorage.removeItem("refresh"); setError(requestError.message);
    } finally { setLoading(false); }
  };

  return <div className="auth-page"><div className="auth-card">
    <BrandLogo variant="full" className="auth-brand" />
    <p className="auth-subtitle">Connect with opportunities, mentors, and startups.</p>
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
      {error && <p className="message">{error}</p>}<button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
    </form>
    {location.state?.registrationSuccess && <p className="auth-success" role="status">Account created successfully. You can now sign in.</p>}
    <p className="auth-switch">Don&apos;t have an account? <Link to="/register">Create account</Link></p>
  </div></div>;
}
