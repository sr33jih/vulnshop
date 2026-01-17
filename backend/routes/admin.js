const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// VULNERABILITY: Broken Function Level Authorization
// These endpoints should require admin role, but the checks are weak or missing

// List all users (admin only... or is it?)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        // VULNERABILITY: Commented out authorization check
        // if (!isAdmin(req.user)) {
        //   return res.status(403).json({ error: 'Admin access required' });
        // }

        // Just checking if admin parameter is passed
        if (req.query.admin !== 'true') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');

        res.json({
            count: result.rows.length,
            users: result.rows // VULNERABILITY: Excessive data exposure
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// List all orders (admin only)
router.get('/orders', authenticateToken, async (req, res) => {
    try {
        // VULNERABILITY: Only checking JWT role without server-side validation
        // Role can be modified in JWT payload
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const result = await db.query(
            `SELECT o.*, u.username, u.email FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
        );

        res.json({
            count: result.rows.length,
            orders: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
    }
});

// Add product (admin only)
router.post('/products', authenticateToken, async (req, res) => {
    try {
        // VULNERABILITY: Weak authorization - checking header instead of JWT
        const adminKey = req.headers['x-admin-key'];

        if (adminKey !== 'admin123') { // Weak secret key
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { name, description, price, category, image_url, stock } = req.body;

        const result = await db.query(
            'INSERT INTO products (name, description, price, category, image_url, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, category, image_url, stock]
        );

        res.status(201).json({
            message: 'Product added successfully',
            product: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add product', details: error.message });
    }
});

// Update product (admin only)
router.put('/products/:id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.id;

        // VULNERABILITY: No authorization check at all!
        const { name, description, price, category, image_url, stock } = req.body;

        const result = await db.query(
            'UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), category = COALESCE($4, category), image_url = COALESCE($5, image_url), stock = COALESCE($6, stock) WHERE id = $7 RETURNING *',
            [name, description, price, category, image_url, stock, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
            message: 'Product updated successfully',
            product: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product', details: error.message });
    }
});

// Delete product (admin only)
router.delete('/products/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const productId = req.params.id;

        const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [productId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product', details: error.message });
    }
});

// Get system stats (admin only)
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        // VULNERABILITY: No authorization check

        const userCount = await db.query('SELECT COUNT(*) FROM users');
        const productCount = await db.query('SELECT COUNT(*) FROM products');
        const orderCount = await db.query('SELECT COUNT(*) FROM orders');
        const revenue = await db.query('SELECT SUM(total_amount) FROM orders WHERE status = $1', ['completed']);

        res.json({
            users: parseInt(userCount.rows[0].count),
            products: parseInt(productCount.rows[0].count),
            orders: parseInt(orderCount.rows[0].count),
            revenue: parseFloat(revenue.rows[0].sum || 0)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
    }
});

module.exports = router;
