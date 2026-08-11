// CloudMart - Products routes
// Full CRUD for products backed by Aurora MySQL.

const express = require('express');
const { query } = require('../db');

const router = express.Router();

const PRODUCT_COLUMNS =
  'id, name, description, category, brand, price, stock, image_url, status, created_at, updated_at';

// GET /api/products - list all products (optional category filter)
router.get('/', async (req, res) => {
  const { category } = req.query;
  try {
    let sql = `SELECT ${PRODUCT_COLUMNS} FROM products`;
    const params = [];
    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    sql += ' ORDER BY created_at DESC';
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/search?q= - search products by query (queries MySQL)
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.status(400).json({ error: 'Search query (q) is required' });
  }

  const term = `%${q.trim()}%`;
  try {
    const rows = await query(
      `SELECT ${PRODUCT_COLUMNS} FROM products
       WHERE name LIKE ? OR description LIKE ? OR category LIKE ? OR brand LIKE ?
       ORDER BY created_at DESC`,
      [term, term, term, term]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// GET /api/products/featured - featured products (recent active products)
router.get('/featured', async (req, res) => {
  try {
    const rows = await query(
      `SELECT ${PRODUCT_COLUMNS} FROM products
       WHERE status = 'active' ORDER BY created_at DESC LIMIT 6`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// GET /api/products/latest - latest products
router.get('/latest', async (req, res) => {
  try {
    const rows = await query(
      `SELECT ${PRODUCT_COLUMNS} FROM products
       WHERE status = 'active' ORDER BY created_at DESC LIMIT 8`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching latest products:', err);
    res.status(500).json({ error: 'Failed to fetch latest products' });
  }
});

// GET /api/products/:id - get a single product
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await query(
      `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - create a new product
router.post('/', async (req, res) => {
  const {
    name,
    description,
    category,
    brand,
    price,
    stock,
    image_url,
    status,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const productStatus = status || 'active';

  try {
    const result = await query(
      `INSERT INTO products (name, description, category, brand, price, stock, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        description || '',
        category || '',
        brand || '',
        parseFloat(price) || 0,
        parseInt(stock, 10) || 0,
        image_url || '',
        productStatus,
      ]
    );
    const created = await query(
      `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json(created[0]);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - update an existing product
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    category,
    brand,
    price,
    stock,
    image_url,
    status,
  } = req.body;

  try {
    const existing = await query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = existing[0];
    await query(
      `UPDATE products SET
         name = ?, description = ?, category = ?, brand = ?,
         price = ?, stock = ?, image_url = ?, status = ?
       WHERE id = ?`,
      [
        name !== undefined ? name : product.name,
        description !== undefined ? description : product.description,
        category !== undefined ? category : product.category,
        brand !== undefined ? brand : product.brand,
        price !== undefined ? parseFloat(price) : product.price,
        stock !== undefined ? parseInt(stock, 10) : product.stock,
        image_url !== undefined ? image_url : product.image_url,
        status !== undefined ? status : product.status,
        id,
      ]
    );

    const updated = await query(
      `SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`,
      [id]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - delete a product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', id });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
