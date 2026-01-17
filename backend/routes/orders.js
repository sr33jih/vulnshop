const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Create order
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { shipping_address, user_id, total_amount } = req.body;

        // VULNERABILITY: BOLA - Can create order for any user
        const targetUserId = user_id || req.user.userId;

        // Get cart items
        const cartItems = await db.query(
            `SELECT c.*, p.price, p.stock FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
            [targetUserId]
        );

        if (cartItems.rows.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // VULNERABILITY: Race Condition (TOCTOU) check
        // Check stock levels first
        for (const item of cartItems.rows) {
            if (item.stock < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for product ID ${item.product_id}` });
            }
        }

        // VULNERABILITY: Artificial delay to widen the race condition window
        // This allows multiple requests to pass the stock check before stock is deducted
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Calculate total
        let finalTotal = cartItems.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // VULNERABILITY: Price Manipulation
        // If client sends a total_amount, we trust it without validation!
        if (total_amount !== undefined) {
            console.log(`[VULNERABILITY] Overriding calculated total ${finalTotal} with client provided total ${total_amount}`);
            finalTotal = total_amount;
        }

        // Create order
        const orderResult = await db.query(
            'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [targetUserId, finalTotal, shipping_address, 'pending']
        );

        const orderId = orderResult.rows[0].id;

        // Create order items and deduct stock
        for (const item of cartItems.rows) {
            await db.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, item.product_id, item.quantity, item.price]
            );

            // Deduct stock (unsafe update without WHERE stock >= quantity check)
            await db.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        // Clear cart
        await db.query('DELETE FROM cart_items WHERE user_id = $1', [targetUserId]);

        res.status(201).json({
            message: 'Order created successfully',
            order: orderResult.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
});

// Get order by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const orderId = req.params.id;

        // VULNERABILITY: BOLA/IDOR - No authorization check
        // Any authenticated user can view any order
        const orderResult = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const itemsResult = await db.query(
            `SELECT oi.*, p.name, p.image_url FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
            [orderId]
        );

        res.json({
            order: orderResult.rows[0],
            items: itemsResult.rows
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order', details: error.message });
    }
});

// List user's orders
router.get('/', authenticateToken, async (req, res) => {
    try {
        // VULNERABILITY: Accepting user_id from query parameter
        const userId = req.query.user_id || req.user.userId;

        // VULNERABILITY: BOLA - Can list any user's orders
        const result = await db.query(
            'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.json({
            count: result.rows.length,
            orders: result.rows
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
    }
});

// Update order status
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        // VULNERABILITY: BOLA - Any user can update any order status
        // VULNERABILITY: No validation on status values
        const result = await db.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, orderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            message: 'Order updated successfully',
            order: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order', details: error.message });
    }
});

// Cancel order
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const orderId = req.params.id;

        // VULNERABILITY: BOLA - Any user can cancel any order
        const result = await db.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel order', details: error.message });
    }
});

module.exports = router;
