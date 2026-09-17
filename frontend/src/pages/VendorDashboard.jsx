import { useEffect, useState } from "react";
import api from "../api";

const EMPTY_FORM = { name: "", description: "", price: "", stock: "", category: "General", image_url: "" };

export default function VendorDashboard() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function loadProducts() {
    api.get("/api/shop/products/mine").then((res) => setProducts(res.data));
  }
  function loadOrders() {
    api.get("/api/shop/vendor/orders").then((res) => setOrders(res.data));
  }

  useEffect(() => {
    Promise.all([
      api.get("/api/shop/products/mine").then((res) => setProducts(res.data)),
      api.get("/api/shop/vendor/orders").then((res) => setOrders(res.data)),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) {
        await api.put(`/api/shop/products/${editingId}`, payload);
      } else {
        await api.post("/api/shop/products", payload);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not save product.");
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description || "", price: p.price, stock: p.stock, category: p.category, image_url: p.image_url || "" });
    setTab("add");
  }

  async function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/api/shop/products/${id}`);
    loadProducts();
  }

  async function handleOrderStatus(orderId, status) {
    await api.patch(`/api/shop/orders/${orderId}`, { status });
    loadOrders();
  }

  if (loading) return <div className="container">Loading vendor dashboard...</div>;

  return (
    <div className="container">
      <h2 className="section-title">🏪 Vendor Dashboard</h2>

      <div className="tabs">
        <button className={`tab ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}>My Products ({products.length})</button>
        <button className={`tab ${tab === "add" ? "active" : ""}`} onClick={() => { setTab("add"); setEditingId(null); setForm(EMPTY_FORM); }}>
          {editingId ? "Edit Product" : "Add Product"}
        </button>
        <button className={`tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>Orders ({orders.length})</button>
      </div>

      {tab === "products" && (
        <div className="grid grid-3">
          {products.map((p) => (
            <div className="card" key={p.id}>
              <h4>{p.name}</h4>
              <p className="price">৳ {p.price.toFixed(2)}</p>
              <p className="muted">{p.stock} in stock · {p.category}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
          {products.length === 0 && <div className="empty-state">You haven't listed any products yet.</div>}
        </div>
      )}

      {tab === "add" && (
        <div className="card" style={{ maxWidth: 480 }}>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Price (৳)</label>
              <input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Image URL (optional)</label>
              <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <button className="btn btn-accent">{editingId ? "Update Product" : "Add Product"}</button>
          </form>
        </div>
      )}

      {tab === "orders" && (
        <div>
          {orders.length === 0 && <div className="empty-state">No orders yet for your products.</div>}
          {orders.map((o) => (
            <div className="list-item" key={o.id}>
              <div className="row-top">
                <strong>Order #{o.id} — {o.citizen.name}</strong>
                <span className={`status status-${o.status}`}>{o.status}</span>
              </div>
              <ul>
                {o.items.map((it) => <li key={it.id}>{it.product.name} × {it.quantity}</li>)}
              </ul>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {["pending", "paid", "shipped", "delivered"].map((s) => (
                  <button key={s} className="btn btn-outline btn-sm" onClick={() => handleOrderStatus(o.id, s)} disabled={o.status === s}>
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
