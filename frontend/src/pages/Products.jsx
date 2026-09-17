import { useEffect, useState } from "react";
import api from "../api";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [toast, setToast] = useState("");

  function load() {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    api.get("/api/shop/products", { params }).then((res) => setProducts(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, [category]);

  function handleAdd(product) {
    addToCart(product);
    setToast(`${product.name} added to cart`);
    setTimeout(() => setToast(""), 2000);
  }

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="container">
      <h2 className="section-title">🛍️ Marketplace</h2>
      {toast && <div className="success-box">{toast}</div>}

      <div className="card" style={{ marginBottom: 22, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <label>Search products</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="e.g. honey, saree..." />
        </div>
        <div className="form-group" style={{ minWidth: 180, marginBottom: 0 }}>
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={load}>Search</button>
      </div>

      {loading && <p>Loading products...</p>}
      {!loading && products.length === 0 && <div className="empty-state">No products found.</div>}

      <div className="grid grid-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAddToCart={handleAdd} />
        ))}
      </div>
    </div>
  );
}
