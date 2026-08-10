import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { API_URL } from "../config/api";
import "./Settings.css";

function Settings({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Password change form state
  const [pwdForm, setPwdForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) throw new Error("Not logged in");
        const resp = await fetch(`${API_URL}/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) throw new Error("Failed to load account info");
        const data = await resp.json();
        setUser(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPwdForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_new_password) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      const token = localStorage.getItem("access");
      const resp = await fetch(`${API_URL}/auth/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pwdForm),
      });
      const result = await resp.json();
      if (!resp.ok) {
        const msg = result.detail || result.current_password?.[0] || "Password change failed";
        throw new Error(msg);
      }
      toast.success("Password updated successfully");
      setPwdForm({ current_password: "", new_password: "", confirm_new_password: "" });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  if (loading) {
    return <section className="settings-page"><p>Loading account…</p></section>;
  }

  if (error) {
    return <section className="settings-page"><p className="error">{error}</p></section>;
  }

  return (
    <section className="settings-page">
      <Toaster position="top-center" />
      <div className="settings-card">
        <h2>Account information</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <div className="settings-card">
        <h2>Change password</h2>
        <form onSubmit={submitPasswordChange} className="pwd-form">
          <div className="form-group">
            <label htmlFor="current_password">Current password</label>
            <input
              id="current_password"
              name="current_password"
              type="password"
              value={pwdForm.current_password}
              onChange={handlePwdChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="new_password">New password</label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              value={pwdForm.new_password}
              onChange={handlePwdChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm_new_password">Confirm new password</label>
            <input
              id="confirm_new_password"
              name="confirm_new_password"
              type="password"
              value={pwdForm.confirm_new_password}
              onChange={handlePwdChange}
              required
            />
          </div>
          <button type="submit" className="primary-button">Update password</button>
        </form>
      </div>

      <div className="settings-card danger-zone">
        <h2>Session</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </section>
  );
}

export default Settings;
