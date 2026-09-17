import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to CivicMart</h1>
        <p>
          One platform, two purposes: access essential government (e-governance)
          services and shop from local vendors (e-commerce) — all in a single
          account.
        </p>
        <div className="cta">
          <Link to="/products" className="btn btn-accent">Browse Marketplace</Link>
          <Link to="/notices" className="btn btn-outline" style={{ background: "white" }}>
            View Notices
          </Link>
          {!user && <Link to="/register" className="btn btn-primary">Create an Account</Link>}
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <h3>📢 Notices</h3>
          <p className="muted">Stay updated with official announcements and deadlines from your local authority.</p>
          <Link to="/notices">View notices →</Link>
        </div>
        <div className="card">
          <h3>📝 Complaints</h3>
          <p className="muted">File a grievance and track its status until it is resolved by an official.</p>
          <Link to="/complaints">File a complaint →</Link>
        </div>
        <div className="card">
          <h3>📄 Certificates</h3>
          <p className="muted">Apply for birth, trade license, and other official certificates online.</p>
          <Link to="/certificates">Apply now →</Link>
        </div>
        <div className="card">
          <h3>🛍️ Marketplace</h3>
          <p className="muted">Buy products directly from verified local vendors in your community.</p>
          <Link to="/products">Start shopping →</Link>
        </div>
        <div className="card">
          <h3>🏪 Become a Vendor</h3>
          <p className="muted">Register as a vendor to list and sell your own products on CivicMart.</p>
          <Link to="/register">Register as vendor →</Link>
        </div>
        <div className="card">
          <h3>🔐 Secure Accounts</h3>
          <p className="muted">Role-based access for Citizens, Vendors, and Admins, secured with JWT authentication.</p>
        </div>
      </div>
    </div>
  );
}
