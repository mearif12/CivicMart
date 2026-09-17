import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card form-card">
        <h2>Login to CivicMart</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 16 }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        {/* <div className="muted" style={{ marginTop: 20, fontSize: "0.8rem" }}>
          <strong>Demo accounts</strong> (after running <code>python seed.py</code>):<br />
          Admin: admin@civicmart.gov / admin123<br />
          Vendor: vendor@civicmart.gov / vendor123<br />
          Citizen: citizen@civicmart.gov / citizen123
        </div> */}
      </div>
    </div>
  );
}
