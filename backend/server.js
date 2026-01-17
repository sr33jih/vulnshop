require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Import database
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

// VULNERABILITY: Overly permissive CORS configuration
app.use(cors({
    origin: '*', // Accepts requests from any origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key']
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// VULNERABILITY: Debug mode enabled - exposing sensitive information
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        headers: req.headers
    });
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        // VULNERABILITY: Exposing internal configuration
        config: {
            database: process.env.DB_HOST,
            jwtSecret: process.env.JWT_SECRET // NEVER expose this!
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'VulnShop API',
        version: '1.0.0',
        description: 'Vulnerable API for Penetration Testing Education',
        warning: '⚠️  This API is intentionally vulnerable. DO NOT use in production!',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            products: '/api/products',
            cart: '/api/cart',
            orders: '/api/orders',
            reviews: '/api/reviews',
            admin: '/api/admin'
        },
        documentation: 'See VULNERABILITIES.md for details on security issues'
    });
});

// VULNERABILITY: Verbose error handling exposing stack traces
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message,
        stack: err.stack, // VULNERABILITY: Exposing stack traces
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        availableEndpoints: [
            '/api/auth',
            '/api/users',
            '/api/products',
            '/api/cart',
            '/api/orders',
            '/api/reviews',
            '/api/admin'
        ]
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║           VulnShop API Server                  ║');
    console.log('║   Vulnerable API Penetration Testing Lab       ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🚀 Server running on http://localhost:3001`);
    console.log(`📚 API Documentation: http://localhost:3001/`);
    console.log('');
    console.log('⚠️  WARNING: This API is intentionally vulnerable!');
    console.log('   DO NOT expose to the internet or use in production.');
    console.log('');
    console.log('Default credentials:');
    console.log('  Username: admin');
    console.log('  Password: password123');
    console.log('');
});

module.exports = app;
