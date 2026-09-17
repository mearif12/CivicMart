import { Link } from "react-router-dom";

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="card product-card">
      <div className="product-img">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <span>No Image</span>
        )}
      </div>
      <span className="category-tag">{product.category}</span>
      <h3 style={{ margin: "0 0 6px" }}>
        <Link to={`/products/${product.id}`}>{product.name}</Link>
      </h3>
      <p className="muted" style={{ flexGrow: 1 }}>
        {product.description?.slice(0, 80) || "No description provided."}
      </p>
      <p className="price">৳ {product.price.toFixed(2)}</p>
      <p className="muted">Sold by {product.vendor.name} · {product.stock} in stock</p>
      {onAddToCart && (
        <button
          className="btn btn-accent btn-sm"
          disabled={product.stock === 0}
          onClick={() => onAddToCart(product)}
        >
          {product.stock === 0 ? "Out of stock" : "Add to Cart"}
        </button>
      )}
    </div>
  );
}
