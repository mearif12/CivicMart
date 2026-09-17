import { useEffect, useState } from "react";
import api from "../api";

const CERT_TYPES = ["Birth Certificate", "Trade License", "Citizenship Certificate", "Income Certificate", "Character Certificate"];

export default function Certificates() {
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({ cert_type: CERT_TYPES[0], details: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    api.get("/api/governance/certificates").then((res) => setApplications(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/api/governance/certificates", form);
      setForm({ cert_type: CERT_TYPES[0], details: "" });
      setSuccess("Application submitted. You can track its status below.");
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not submit application.");
    }
  }

  return (
    <div className="container">
      <h2 className="section-title">📄 Certificate Applications</h2>

      <div className="card" style={{ marginBottom: 28, maxWidth: 560 }}>
        <h3>Apply for a Certificate</h3>
        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Certificate Type</label>
            <select value={form.cert_type} onChange={(e) => setForm({ ...form, cert_type: e.target.value })}>
              {CERT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Details / Purpose</label>
            <textarea
              required
              placeholder="Briefly explain your request and any relevant details (full name, NID, purpose, etc.)"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
            />
          </div>
          <button className="btn btn-primary">Submit Application</button>
        </form>
      </div>

      <h3>Your Applications</h3>
      {loading && <p>Loading...</p>}
      {!loading && applications.length === 0 && <div className="empty-state">You haven't applied for any certificates yet.</div>}
      {applications.map((a) => (
        <div className="list-item" key={a.id}>
          <div className="row-top">
            <h4 style={{ margin: 0 }}>{a.cert_type}</h4>
            <span className={`status status-${a.status}`}>{a.status}</span>
          </div>
          <p>{a.details}</p>
          {a.admin_remarks && <p className="muted"><strong>Official remarks:</strong> {a.admin_remarks}</p>}
          <p className="muted">Applied on {new Date(a.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
