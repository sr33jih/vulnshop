const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
    try {
        // VULNERABILITY: Getting userId from query parameter instead of authenticated user
        const userId = req.query.user_id || req.user.userId;

        // VULNERABILITY: BOLA - Any user can view any cart by changing user_id parameter
        const result = await db.query(
            `SELECT c.id, c.quantity, p.name, p.price, p.image_url, c.product_id
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
            [userId]
        );

        const total = result.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({
            user_id: userId,
            items: result.rows,
            total: total.toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart', details: error.message });
    }
});

// Add item to cart
router.post('/items', authenticateToken, async (req, res) => {
    try {
        const { product_id, quantity, user_id } = req.body;

        // VULNERABILITY: BOLA - Accepting user_id from request body
        const targetUserId = user_id || req.user.userId;

        // Check if item already in cart
        const existing = await db.query(
            'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
            [targetUserId, product_id]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update quantity
            result = await db.query(
                'UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
                [quantity || 1, targetUserId, product_id]
            );
        } else {
            // Insert new item
            result = await db.query(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
                [targetUserId, product_id, quantity || 1]
            );
        }

        res.status(201).json({
            message: 'Item added to cart',
            item: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add item to cart', details: error.message });
    }
});

// Update cart item quantity
router.put('/items/:id', authenticateToken, async (req, res) => {
    try {
        const itemId = req.params.id;
        const { quantity } = req.body;

        // VULNERABILITY: BOLA - No check if cart item belongs to authenticated user
        const result = await db.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
            [quantity, itemId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        res.json({
            message: 'Cart item updated',
            item: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update cart item', details: error.message });
    }
});

// Remove item from cart
router.delete('/items/:id', authenticateToken, async (req, res) => {
    try {
        const itemId = req.params.id;

        // VULNERABILITY: BOLA - Any user can delete any cart item
        const result = await db.query('DELETE FROM cart_items WHERE id = $1 RETURNING *', [itemId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove item', details: error.message });
    }
});

// Clear cart
router.delete('/', authenticateToken, async (req, res) => {
    try {
        // VULNERABILITY: Accepting user_id from query
        const userId = req.query.user_id || req.user.userId;

        await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cart', details: error.message });
    }
});

module.exports = router;
