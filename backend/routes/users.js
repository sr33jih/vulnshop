const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;

        // VULNERABILITY: BOLA/IDOR - No authorization check
        // Any authenticated user can view any other user's profile
        const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // VULNERABILITY: Excessive data exposure - returning all fields including password hash and credit card
        res.json({ user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
});

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;

        // VULNERABILITY: BOLA/IDOR - No check if req.user.userId === userId
        // Any authenticated user can update any other user's profile

        // VULNERABILITY: Mass assignment - accepting all fields
        const { username, email, first_name, last_name, phone, address, role, credit_card } = req.body;

        // VULNERABILITY: Allowing role modification
        const result = await db.query(
            'UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), first_name = COALESCE($3, first_name), last_name = COALESCE($4, last_name), phone = COALESCE($5, phone), address = COALESCE($6, address), role = COALESCE($7, role), credit_card = COALESCE($8, credit_card) WHERE id = $9 RETURNING *',
            [username, email, first_name, last_name, phone, address, role, credit_card, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user: result.rows[0] // VULNERABILITY: Excessive data exposure
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
});

// List all users
router.get('/', authenticateToken, async (req, res) => {
    try {
        // VULNERABILITY: No pagination, returns all users
        // VULNERABILITY: Excessive data exposure - returning sensitive fields
        const result = await db.query('SELECT * FROM users');

        res.json({
            count: result.rows.length,
            users: result.rows // Includes password hashes, credit cards, etc.
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.id;

        // VULNERABILITY: BOLA/IDOR - Any user can delete any account
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING username', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully', username: result.rows[0].username });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
});

module.exports = router;
