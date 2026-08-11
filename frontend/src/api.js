// CloudMart - API client
// Centralized Axios instance for all backend calls.

import axios from "axios";

// In production nginx proxies /api to the backend, so a relative base works.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Products ----
export const fetchProducts = (category) =>
  api.get("/products", { params: category ? { category } : {} });

export const fetchFeaturedProducts = () => api.get("/products/featured");
export const fetchLatestProducts = () => api.get("/products/latest");
export const fetchProduct = (id) => api.get(`/products/${id}`);
export const searchProducts = (q) => api.get("/products/search", { params: { q } });
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ---- Categories ----
export const fetchCategories = () => api.get("/categories");
export const createCategory = (data) => api.post("/categories", data);

// ---- Orders ----
export const createOrder = (data) => api.post("/orders", data);

// ---- Health ----
export const fetchHealth = () => api.get("/health");

// ---- Upload (multipart) ----
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return axios.post(`${BASE_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;
