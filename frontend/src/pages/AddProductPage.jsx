import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct, uploadImage } from "../api";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  stock: "",
  status: "active",
};

function AddProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // 1. Upload image to S3 (if provided), get the URL back.
      let imageUrl = "";
      if (image) {
        const uploadRes = await uploadImage(image);
        imageUrl = uploadRes.data.url;
      }

      // 2. Create the product in Aurora MySQL with the S3 image URL.
      const productData = {
        ...form,
        price: parseFloat(form.price) || 0,
        stock: parseInt(form.stock, 10) || 0,
        image_url: imageUrl,
      };
      await createProduct(productData);

      setSuccess("Product added successfully!");
      setForm(emptyForm);
      setImage(null);
      setImagePreview("");

      // Navigate to products page so the list refreshes automatically.
      setTimeout(() => navigate("/products"), 1200);
    } catch (err) {
      setError("Failed to add product. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Add Product</h1>
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Wireless Headphones"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            placeholder="Product details..."
          />
        </div>

        <div className="form-row-grid">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              type="text"
              value={form.category}
              onChange={handleChange}
              placeholder="Electronics"
            />
          </div>
          <div className="form-group">
            <label htmlFor="brand">Brand</label>
            <input
              id="brand"
              name="brand"
              type="text"
              value={form.brand}
              onChange={handleChange}
              placeholder="Brand"
            />
          </div>
        </div>

        <div className="form-row-grid">
          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="99.99"
            />
          </div>
          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="10"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Product Image</label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="image-preview" />
          )}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProductPage;
