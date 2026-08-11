// CloudMart - Categories routes

const express = require('express');
const { query } = require('../db');

const router = express.Router();

// GET /api/categories - list all categories
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, name, description, created_at FROM categories ORDER BY name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - create a new category
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const result = await query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name.trim(), description || '']
    );
    const inserted = await query('SELECT * FROM categories WHERE id = ?', [
      result.insertId,
    ]);
    res.status(201).json(inserted[0]);
  } catch (err) {
    // Duplicate entry (unique name)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

module.exports = router;
