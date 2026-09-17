import { useEffect, useState } from "react";
import api from "../api";

export default function AdminDashboard() {
  const [tab, setTab] = useState("notices");
  const [notices, setNotices] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "", category: "General" });
  const [loading, setLoading] = useState(true);

  function loadAll() {
    return Promise.all([
      api.get("/api/governance/notices").then((res) => setNotices(res.data)),
      api.get("/api/governance/complaints").then((res) => setComplaints(res.data)),
      api.get("/api/governance/certificates").then((res) => setCertificates(res.data)),
    ]);
  }

  useEffect(() => { loadAll().finally(() => setLoading(false)); }, []);

  async function handlePostNotice(e) {
    e.preventDefault();
    await api.post("/api/governance/notices", noticeForm);
    setNoticeForm({ title: "", content: "", category: "General" });
    loadAll();
  }

  async function handleDeleteNotice(id) {
    if (!confirm("Delete this notice?")) return;
    await api.delete(`/api/governance/notices/${id}`);
    loadAll();
  }

  async function handleComplaintStatus(id, status) {
    const admin_remarks = prompt("Add a remark for the citizen (optional):") || "";
    await api.patch(`/api/governance/complaints/${id}`, { status, admin_remarks });
    loadAll();
  }

  async function handleCertStatus(id, status) {
    const admin_remarks = prompt("Add a remark for the citizen (optional):") || "";
    await api.patch(`/api/governance/certificates/${id}`, { status, admin_remarks });
    loadAll();
  }

  if (loading) return <div className="container">Loading admin dashboard...</div>;

  return (
    <div className="container">
      <h2 className="section-title">🛡️ Admin Dashboard</h2>

      <div className="tabs">
        <button className={`tab ${tab === "notices" ? "active" : ""}`} onClick={() => setTab("notices")}>Notices ({notices.length})</button>
        <button className={`tab ${tab === "complaints" ? "active" : ""}`} onClick={() => setTab("complaints")}>Complaints ({complaints.length})</button>
        <button className={`tab ${tab === "certificates" ? "active" : ""}`} onClick={() => setTab("certificates")}>Certificates ({certificates.length})</button>
      </div>

      {tab === "notices" && (
        <>
          <div className="card" style={{ maxWidth: 500, marginBottom: 24 }}>
            <h3>Post a New Notice</h3>
            <form onSubmit={handlePostNotice}>
              <div className="form-group">
                <label>Title</label>
                <input required value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea required value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input value={noticeForm.category} onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })} />
              </div>
              <button className="btn btn-primary">Publish Notice</button>
            </form>
          </div>
          {notices.map((n) => (
            <div className="list-item" key={n.id}>
              <div className="row-top">
                <strong>{n.title}</strong>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteNotice(n.id)}>Delete</button>
              </div>
              <p>{n.content}</p>
            </div>
          ))}
        </>
      )}

      {tab === "complaints" && (
        <>
          {complaints.length === 0 && <div className="empty-state">No complaints filed yet.</div>}
          {complaints.map((c) => (
            <div className="list-item" key={c.id}>
              <div className="row-top">
                <strong>{c.subject} — {c.citizen.name}</strong>
                <span className={`status status-${c.status}`}>{c.status.replace("_", " ")}</span>
              </div>
              <p>{c.description}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => handleComplaintStatus(c.id, "in_progress")}>In Progress</button>
                <button className="btn btn-outline btn-sm" onClick={() => handleComplaintStatus(c.id, "resolved")}>Resolve</button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "certificates" && (
        <>
          {certificates.length === 0 && <div className="empty-state">No certificate applications yet.</div>}
          {certificates.map((c) => (
            <div className="list-item" key={c.id}>
              <div className="row-top">
                <strong>{c.cert_type} — {c.citizen.name}</strong>
                <span className={`status status-${c.status}`}>{c.status}</span>
              </div>
              <p>{c.details}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn btn-accent btn-sm" onClick={() => handleCertStatus(c.id, "approved")}>Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleCertStatus(c.id, "rejected")}>Reject</button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
