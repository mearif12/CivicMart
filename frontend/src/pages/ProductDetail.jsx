import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/shop/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>
      <div className="card" style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px" }}>
          <div className="product-img" style={{ aspectRatio: "1/1" }}>
            {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span>No Image</span>}
          </div>
        </div>
        <div style={{ flex: "2 1 400px" }}>
          <span className="category-tag">{product.category}</span>
          <h1 style={{ margin: "8px 0" }}>{product.name}</h1>
          <p className="price" style={{ fontSize: "1.6rem" }}>৳ {product.price.toFixed(2)}</p>
          <p>{product.description || "No description provided."}</p>
          <p className="muted">Sold by <strong>{product.vendor.name}</strong></p>
          <p className="muted">{product.stock} unit(s) in stock</p>

          {product.stock > 0 ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 20 }}>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                style={{ width: 80 }}
              />
              <button className="btn btn-accent" onClick={() => addToCart(product, quantity)}>Add to Cart</button>
            </div>
          ) : (
            <p className="error-box" style={{ display: "inline-block", marginTop: 20 }}>Out of stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
