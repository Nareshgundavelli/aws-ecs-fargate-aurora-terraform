import React from "react";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const {
    id,
    name,
    description,
    category,
    brand,
    price,
    stock,
    image_url,
  } = product;

  const imgSrc = image_url || "https://placehold.co/400x300?text=CloudMart";

  return (
    <Link to={`/products/${id}`} className="product-card">
      <div className="product-card-image">
        <img src={imgSrc} alt={name} loading="lazy" />
        {stock > 0 ? (
          <span className="product-badge">In Stock</span>
        ) : (
          <span className="product-badge out">Out of Stock</span>
        )}
      </div>
      <div className="product-card-body">
        <h3 className="product-card-title">{name}</h3>
        {brand && <span className="product-card-brand">{brand}</span>}
        {category && <span className="product-card-category">{category}</span>}
        <p className="product-card-description">
          {description ? description.slice(0, 80) : ""}
          {description && description.length > 80 ? "..." : ""}
        </p>
        <div className="product-card-footer">
          <span className="product-card-price">${Number(price).toFixed(2)}</span>
          <span className="product-card-stock">
            {stock > 0 ? `${stock} left` : "Sold out"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
