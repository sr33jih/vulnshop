const jwt = require('jsonwebtoken');

// VULNERABILITY: Weak JWT validation
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    // VULNERABILITY: No expiration check, weak secret
    jwt.verify(token, process.env.JWT_SECRET || 'insecure_jwt_secret_12345', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// VULNERABILITY: No role-based authorization check
const isAdmin = (req, res, next) => {
    // VULNERABILITY: Trusting client-provided role in JWT without server-side validation
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Admin access required' });
    }
};

module.exports = { authenticateToken, isAdmin };
