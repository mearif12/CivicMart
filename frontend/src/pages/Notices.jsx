import { useEffect, useState } from "react";
import api from "../api";

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/governance/notices").then((res) => setNotices(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h2 className="section-title">📢 Official Notices</h2>
      {loading && <p>Loading notices...</p>}
      {!loading && notices.length === 0 && <div className="empty-state">No notices published yet.</div>}
      {notices.map((n) => (
        <div className="list-item" key={n.id}>
          <div className="row-top">
            <h3 style={{ margin: 0 }}>{n.title}</h3>
            <span className="category-tag">{n.category}</span>
          </div>
          <p>{n.content}</p>
          <p className="muted">{new Date(n.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
