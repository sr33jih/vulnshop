const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// VULNERABILITY: No rate limiting on authentication endpoints

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        // VULNERABILITY: Mass assignment - accepting all fields from request body
        const { username, email, password, role, credit_card, ...otherFields } = req.body;

        // VULNERABILITY: Weak password requirements (no validation)
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // VULNERABILITY: Mass assignment allows setting role to 'admin'
        const userRole = role || 'user'; // Should always be 'user' for new registrations!

        const result = await db.query(
            'INSERT INTO users (username, email, password, role, credit_card, first_name, last_name, phone, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, username, email, role',
            [username, email, hashedPassword, userRole, credit_card, otherFields.first_name, otherFields.last_name, otherFields.phone, otherFields.address]
        );

        // VULNERABILITY: Returning sensitive user information
        res.status(201).json({
            message: 'User registered successfully',
            user: result.rows[0]
        });
    } catch (error) {
        // VULNERABILITY: Exposing database errors to client
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Username or email already exists', details: error.message });
        }
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            // VULNERABILITY: Information disclosure - different error messages
            return res.status(401).json({ error: 'Username not found' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            // VULNERABILITY: Information disclosure
            return res.status(401).json({ error: 'Invalid password' });
        }

        // VULNERABILITY: Including role in JWT payload without server-side verification
        // VULNERABILITY: No token expiration
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'insecure_jwt_secret_12345'
        );

        // VULNERABILITY: Excessive data exposure - returning all user data including password hash
        res.json({
            message: 'Login successful',
            token,
            user: user // Includes password hash, credit card, etc.
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const result = await db.query('SELECT id, username FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            // VULNERABILITY: Information disclosure
            return res.status(404).json({ error: 'Email not found' });
        }

        // VULNERABILITY: Predictable reset token
        const resetToken = Buffer.from(`${result.rows[0].id}:${Date.now()}`).toString('base64');

        // In a real app, this would be sent via email
        res.json({
            message: 'Password reset token generated',
            resetToken, // VULNERABILITY: Exposing reset token in response
            hint: 'In production, this would be sent via email'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        // VULNERABILITY: Weak token validation
        const decoded = Buffer.from(resetToken, 'base64').toString('utf-8');
        const [userId, timestamp] = decoded.split(':');

        // VULNERABILITY: No token expiration check
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ error: 'Password reset failed', details: error.message });
    }
});

module.exports = router;
