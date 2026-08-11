import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import {
  fetchProducts,
  searchProducts,
  fetchCategories,
} from "../api";

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        let res;
        if (query) {
          res = await searchProducts(query);
        } else if (category) {
          res = await fetchProducts(category);
        } else {
          res = await fetchProducts();
        }
        setProducts(res.data);

        const catRes = await fetchCategories();
        setCategories(catRes.data);
      } catch (err) {
        setError("Failed to load products.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query, category]);

  const handleCategory = (cat) => {
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <SearchBar placeholder="Search..." />
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${!category ? "active" : ""}`}
          onClick={() => handleCategory("")}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-btn ${category === cat.name ? "active" : ""}`}
            onClick={() => handleCategory(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {query && (
        <p className="result-info">
          Showing results for "<strong>{query}</strong>"
        </p>
      )}

      {loading ? (
        <p className="loading-text">Loading products...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : products.length === 0 ? (
        <p className="empty-text">No products found.</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
