// CloudMart - Orders routes

const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// POST /api/orders - create a new order
router.post('/', async (req, res) => {
  const { customer_name, customer_email, items } = req.body;

  if (!customer_name || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ error: 'customer_name and items are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let total = 0;
    for (const item of items) {
      const [productRows] = await connection.query(
        'SELECT price, stock FROM products WHERE id = ? AND status = "active"',
        [item.product_id]
      );
      if (productRows.length === 0) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      const product = productRows[0];
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }
      total += parseFloat(product.price) * item.quantity;
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_name, customer_email, total_amount) VALUES (?, ?, ?)',
      [customer_name, customer_email || '', total]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    await connection.commit();
    res.status(201).json({ order_id: orderId, total_amount: total });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    connection.release();
  }
});

module.exports = router;
