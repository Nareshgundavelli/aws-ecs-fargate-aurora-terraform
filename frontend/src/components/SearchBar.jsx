import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar({ placeholder = "Search products..." }) {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = term.trim();
    if (q) {
      navigate(`/products?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        aria-label="Search products"
      />
      <button type="submit" className="btn btn-primary search-btn">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
