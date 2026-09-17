import { useEffect, useState } from "react";
import api from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/shop/orders").then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h2 className="section-title">📦 My Orders</h2>
      {loading && <p>Loading...</p>}
      {!loading && orders.length === 0 && <div className="empty-state">You haven't placed any orders yet.</div>}
      {orders.map((o) => (
        <div className="list-item" key={o.id}>
          <div className="row-top">
            <strong>Order #{o.id}</strong>
            <span className={`status status-${o.status}`}>{o.status}</span>
          </div>
          <p className="muted">Placed on {new Date(o.created_at).toLocaleString()}</p>
          <p className="muted">Shipping to: {o.shipping_address || "N/A"}</p>
          <ul>
            {o.items.map((it) => (
              <li key={it.id}>
                {it.product.name} × {it.quantity} — ৳ {(it.price_at_purchase * it.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <h4>Total: ৳ {o.total_amount.toFixed(2)}</h4>
        </div>
      ))}
    </div>
  );
}
