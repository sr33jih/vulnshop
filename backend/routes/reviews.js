const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// VULNERABILITY: No rate limiting on review creation

// Create review
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { product_id, rating, comment, user_id } = req.body;

        // VULNERABILITY: BOLA - Accepting user_id from request body
        const reviewUserId = user_id || req.user.userId;

        // VULNERABILITY: No validation if user purchased the product
        // VULNERABILITY: No check for duplicate reviews
        const result = await db.query(
            'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [product_id, reviewUserId, rating, comment]
        );

        res.status(201).json({
            message: 'Review created successfully',
            review: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create review', details: error.message });
    }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;

        const result = await db.query(
            `SELECT r.*, u.username FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
            [productId]
        );

        res.json({
            count: result.rows.length,
            reviews: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
    }
});

// Update review
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { rating, comment } = req.body;

        // VULNERABILITY: BOLA - No check if review belongs to authenticated user
        const result = await db.query(
            'UPDATE reviews SET rating = COALESCE($1, rating), comment = COALESCE($2, comment) WHERE id = $3 RETURNING *',
            [rating, comment, reviewId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({
            message: 'Review updated successfully',
            review: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update review', details: error.message });
    }
});

// Delete review
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const reviewId = req.params.id;

        // VULNERABILITY: BOLA - Any user can delete any review
        const result = await db.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [reviewId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete review', details: error.message });
    }
});

module.exports = router;
