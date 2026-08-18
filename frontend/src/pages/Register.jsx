import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../components/brand/BrandLogo";
import { API_URL } from "../config/api";
import "./Login.css";
import "./Register.css";

const initialForm = { first_name: "", last_name: "", username: "", email: "", role: "student", password: "", confirm_password: "" };

function collectErrors(data) {
  if (!data || typeof data !== "object") return ["Registration failed. Please try again."];
  return Object.entries(data).flatMap(([field, messages]) => {
    const label = field === "non_field_errors" ? "" : `${field.replaceAll("_", " ")}: `;
    return (Array.isArray(messages) ? messages : [messages]).map((message) => `${label}${message}`);
  });
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleChange = ({ target: { name, value } }) => setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors([]);
    if (formData.password !== formData.confirm_password) { setErrors(["Passwords do not match."]); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setErrors(collectErrors(data)); return; }
      navigate("/login", { replace: true, state: { registrationSuccess: true, email: formData.email } });
    } catch {
      setErrors(["Could not reach SkillBridge. Please try again."]);
    } finally { setLoading(false); }
  };

  return <div className="auth-page register-page"><div className="auth-card register-card">
    <BrandLogo variant="full" className="auth-brand" />
    <p className="auth-subtitle">Create your account and start building meaningful connections.</p>
    <form onSubmit={handleSubmit}>
      <div className="register-grid">
        <div><label htmlFor="first_name">First name</label><input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} autoComplete="given-name" required /></div>
        <div><label htmlFor="last_name">Last name</label><input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} autoComplete="family-name" required /></div>
      </div>
      <label htmlFor="username">Username</label><input id="username" name="username" value={formData.username} onChange={handleChange} autoComplete="username" required />
      <label htmlFor="register-email">Email address</label><input id="register-email" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" required />
      <label htmlFor="role">Role</label><select id="role" name="role" value={formData.role} onChange={handleChange} required>
        <option value="student">Student</option><option value="mentor">Mentor</option><option value="startup">Recruiter / Startup</option>
      </select>
      <div className="register-grid">
        <div><label htmlFor="register-password">Password</label><input id="register-password" name="password" type="password" value={formData.password} onChange={handleChange} autoComplete="new-password" required /></div>
        <div><label htmlFor="confirm_password">Confirm password</label><input id="confirm_password" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} autoComplete="new-password" required /></div>
      </div>
      {errors.length > 0 && <div className="register-errors" role="alert">{errors.map((error, index) => <p key={`${index}-${error}`}>{error}</p>)}</div>}
      <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
    </form>
    <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </div></div>;
}
