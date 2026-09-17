import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">🏛️ CivicMart</Link>
      <div className="links">
        <Link to="/notices">Notices</Link>

        {user && user.role === "citizen" && (
          <>
            <Link to="/products">Marketplace</Link>
            <Link to="/complaints">Complaints</Link>
            <Link to="/certificates">Certificates</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/cart">Cart{count > 0 && <span className="badge">{count}</span>}</Link>
          </>
        )}

        {user && user.role === "vendor" && (
          <Link to="/vendor">Vendor Dashboard</Link>
        )}

        {user && user.role === "admin" && (
          <Link to="/admin">Admin Dashboard</Link>
        )}

        {user ? (
          <>
            <span className="role-pill">{user.name} · {user.role}</span>
            <button className="linklike" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
