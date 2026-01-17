const express = require('express');
const router = express.Router();
const db = require('../config/db');

// List products with search
router.get('/', async (req, res) => {
    try {
        const { search, category, min_price, max_price } = req.query;

        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        // VULNERABILITY: SQL Injection in search parameter
        if (search) {
            // Directly concatenating user input - DANGEROUS!
            query += ` AND (name ILIKE '%${search}%' OR description ILIKE '%${search}%')`;
        }

        if (category) {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }

        if (min_price) {
            params.push(min_price);
            query += ` AND price >= $${params.length}`;
        }

        if (max_price) {
            params.push(max_price);
            query += ` AND price <= $${params.length}`;
        }

        const result = await db.query(query, params);

        res.json({
            count: result.rows.length,
            products: result.rows
        });
    } catch (error) {
        // VULNERABILITY: Exposing database errors
        res.status(500).json({ error: 'Failed to fetch products', details: error.message, query: error.query });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        const result = await db.query('SELECT * FROM products WHERE id = $1', [productId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ product: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product', details: error.message });
    }
});

// VULNERABILITY: Old deprecated API version (Improper Assets Management)
router.get('/v1/products', async (req, res) => {
    try {
        // Old version with different data structure and potential vulnerabilities
        const result = await db.query('SELECT id, name, price FROM products');

        res.json({
            version: 'v1 (deprecated)',
            warning: 'This endpoint is deprecated and may be removed',
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

module.exports = router;
