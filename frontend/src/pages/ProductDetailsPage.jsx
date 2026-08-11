import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProduct, createOrder } from "../api";

function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [orderMsg, setOrderMsg] = useState("");
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchProduct(id);
        setProduct(res.data);
      } catch (err) {
        setError("Product not found.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleOrder = async (e) => {
    e.preventDefault();
    setOrderMsg("");
    setOrderError("");
    if (!customerName.trim()) {
      setOrderError("Please enter your name.");
      return;
    }
    try {
      const res = await createOrder({
        customer_name: customerName.trim(),
        items: [{ product_id: product.id, quantity, price: product.price }],
      });
      setOrderMsg(
        `Order placed successfully! Order #${res.data.order_id} — Total: $${Number(res.data.total_amount).toFixed(2)}`
      );
      setCustomerName("");
    } catch (err) {
      setOrderError("Failed to place order. Please try again.");
      console.error(err);
    }
  };

  if (loading) return <p className="loading-text">Loading product...</p>;
  if (error) return <p className="error-text">{error}</p>;

  const imgSrc = product.image_url || "https://placehold.co/600x400?text=CloudMart";

  return (
    <div className="page-container">
      <div className="product-detail">
        <div className="product-detail-image">
          <img src={imgSrc} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <Link to="/products" className="back-link">
            ← Back to Products
          </Link>
          {product.category && (
            <span className="product-detail-category">{product.category}</span>
          )}
          <h1 className="product-detail-title">{product.name}</h1>
          {product.brand && (
            <p className="product-detail-brand">Brand: {product.brand}</p>
          )}
          <p className="product-detail-price">
            ${Number(product.price).toFixed(2)}
          </p>
          <p className="product-detail-desc">{product.description}</p>
          <p className="product-detail-stock">
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Out of Stock"}
          </p>

          <form className="order-form" onSubmit={handleOrder}>
            <div className="form-row">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={product.stock || 1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                disabled={product.stock === 0}
              />
            </div>
            <div className="form-row">
              <label htmlFor="customer">Your Name</label>
              <input
                id="customer"
                type="text"
                placeholder="Enter your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={product.stock === 0}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? "Place Order" : "Out of Stock"}
            </button>
          </form>

          {orderMsg && <p className="success-text">{orderMsg}</p>}
          {orderError && <p className="error-text">{orderError}</p>}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
