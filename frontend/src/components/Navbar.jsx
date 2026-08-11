import React from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">CM</span>
          <span className="brand-name">CloudMart</span>
        </Link>
        <nav className="navbar-links">
          <NavLink to="/" className="nav-link" end>
            Home
          </NavLink>
          <NavLink to="/products" className="nav-link">
            Products
          </NavLink>
          <NavLink to="/add-product" className="nav-link">
            Add Product
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
