import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import {
  fetchFeaturedProducts,
  fetchLatestProducts,
  fetchCategories,
} from "../api";

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, latestRes, catRes] = await Promise.all([
          fetchFeaturedProducts(),
          fetchLatestProducts(),
          fetchCategories(),
        ]);
        setFeatured(featRes.data);
        setLatest(latestRes.data);
        setCategories(catRes.data);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to CloudMart</h1>
          <p className="hero-subtitle">
            Shop smarter, faster, and more securely in the cloud.
          </p>
          <div className="hero-search">
            <SearchBar />
          </div>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
            <Link to="/add-product" className="btn btn-secondary">
              Add a Product
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="categories-section">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <span className="category-icon">🛍️</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="features" id="featured">
        <h2 className="section-title">Featured Products</h2>
        {loading ? (
          <p className="loading-text">Loading products...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
          <div className="products-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Products */}
      <section className="features" id="latest">
        <h2 className="section-title">Latest Products</h2>
        {loading ? (
          <p className="loading-text">Loading products...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
          <div className="products-grid">
            {latest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default HomePage;
