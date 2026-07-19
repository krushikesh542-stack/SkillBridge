import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const loginResponse = await axios.post(
        "http://127.0.0.1:8001/api/auth/login/",
        formData
      );

      const accessToken = loginResponse.data.access;
      const refreshToken = loginResponse.data.refresh;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const userResponse = await axios.get(
        "http://127.0.0.1:8001/api/auth/me/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setUser(userResponse.data);
      setMessage("Login successful.");
    } catch (error) {
      console.error(error);

      setUser(null);
      setMessage(
        error.response?.data?.detail ||
          "Login failed. Please check your email and password."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setMessage("You have logged out.");
  };

  return (
    <main className="page">
      <section className="login-card">
        <h1>SkillBridge</h1>
        <p className="subtitle">
          Connect with students, startups, and mentors.
        </p>

        {!user ? (
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
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

            <button type="submit">Login</button>
          </form>
        ) : (
          <div className="user-card">
            <h2>Welcome, {user.first_name || user.username}</h2>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>

            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}

        {message && <p className="message">{message}</p>}
      </section>
    </main>
  );
}

export default App;