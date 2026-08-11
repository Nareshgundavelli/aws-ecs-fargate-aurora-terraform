import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import AddProductPage from "./pages/AddProductPage";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/add-product" element={<AddProductPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p className="footer-brand">
            <span className="footer-icon">CM</span> CloudMart
          </p>
          <p className="footer-text">
            Copyright {new Date().getFullYear()} CloudMart. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
