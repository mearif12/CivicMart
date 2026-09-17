import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleCheckout() {
    setError("");
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        shipping_address: address,
      };
      await api.post("/api/shop/orders", payload);
      clearCart();
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.detail || "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <h2 className="section-title">🛒 Your Cart</h2>
        <div className="empty-state">Your cart is empty. <a href="/products">Browse the marketplace</a>.</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="section-title">🛒 Your Cart</h2>
      {error && <div className="error-box">{error}</div>}

      {items.map((i) => (
        <div className="list-item" key={i.product.id}>
          <div className="row-top">
            <div>
              <strong>{i.product.name}</strong>
              <p className="muted">৳ {i.product.price.toFixed(2)} each</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="number"
                min={1}
                max={i.product.stock}
                value={i.quantity}
                onChange={(e) => updateQuantity(i.product.id, Number(e.target.value))}
                style={{ width: 70 }}
              />
              <strong>৳ {(i.product.price * i.quantity).toFixed(2)}</strong>
              <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(i.product.id)}>Remove</button>
            </div>
          </div>
        </div>
      ))}

      <div className="card" style={{ maxWidth: 420, marginTop: 20 }}>
        <div className="form-group">
          <label>Shipping Address</label>
          <textarea required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your delivery address" />
        </div>
        <h3>Total: ৳ {total.toFixed(2)}</h3>
        <button className="btn btn-accent" style={{ width: "100%" }} disabled={loading || !address} onClick={handleCheckout}>
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
