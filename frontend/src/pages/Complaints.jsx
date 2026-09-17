import { useEffect, useState } from "react";
import api from "../api";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ subject: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  function loadComplaints() {
    api.get("/api/governance/complaints").then((res) => setComplaints(res.data)).finally(() => setLoading(false));
  }

  useEffect(loadComplaints, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/api/governance/complaints", form);
      setForm({ subject: "", description: "" });
      setSuccess("Complaint filed successfully. You can track its status below.");
      loadComplaints();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not file complaint.");
    }
  }

  return (
    <div className="container">
      <h2 className="section-title">📝 File & Track Complaints</h2>

      <div className="card" style={{ marginBottom: 28, maxWidth: 560 }}>
        <h3>File a New Complaint</h3>
        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Subject</label>
            <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button className="btn btn-primary">Submit Complaint</button>
        </form>
      </div>

      <h3>Your Complaints</h3>
      {loading && <p>Loading...</p>}
      {!loading && complaints.length === 0 && <div className="empty-state">You haven't filed any complaints yet.</div>}
      {complaints.map((c) => (
        <div className="list-item" key={c.id}>
          <div className="row-top">
            <h4 style={{ margin: 0 }}>{c.subject}</h4>
            <span className={`status status-${c.status}`}>{c.status.replace("_", " ")}</span>
          </div>
          <p>{c.description}</p>
          {c.admin_remarks && <p className="muted"><strong>Official remarks:</strong> {c.admin_remarks}</p>}
          <p className="muted">Filed on {new Date(c.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
