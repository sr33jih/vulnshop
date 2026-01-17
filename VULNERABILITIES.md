# VulnShop Vulnerabilities Guide

This document provides detailed explanations of all vulnerabilities present in VulnShop, organized by OWASP API Security Top 10 categories.

## Table of Contents

1. [API1:2023 - Broken Object Level Authorization (BOLA/IDOR)](#1-broken-object-level-authorization)
2. [API2:2023 - Broken Authentication](#2-broken-authentication)
3. [API3:2023 - Broken Object Property Level Authorization](#3-mass-assignment)
4. [API4:2023 - Unrestricted Resource Consumption](#4-lack-of-rate-limiting)
5. [API5:2023 - Broken Function Level Authorization](#5-broken-function-level-authorization)
6. [API8:2023 - Security Misconfiguration](#6-security-misconfiguration)
7. [API9:2023 - Improper Inventory Management](#7-improper-assets-management)
8. [SQL Injection](#8-sql-injection)
9. [Excessive Data Exposure](#9-excessive-data-exposure)
10. [Price Manipulation](#10-price-manipulation)
11. [Race Condition (TOCTOU)](#11-race-condition-toctou)

---

## 1. Broken Object Level Authorization (BOLA/IDOR)

**Severity**: HIGH

### Description
The API doesn't properly validate if the authenticated user has permission to access the requested object. Any authenticated user can access other users' data by simply changing the ID in the URL.

### Vulnerable Endpoints

#### GET /api/users/:id
```javascript
// Any user can view any other user's profile
GET /api/users/2
Authorization: Bearer <any_valid_token>
```

#### GET /api/orders/:id
```javascript
// Access anyone's order details
GET /api/orders/1
Authorization: Bearer <any_valid_token>
```

#### GET /api/cart?user_id=X
```javascript
// View another user's cart
GET /api/cart?user_id=2
Authorization: Bearer <any_valid_token>
```

### Exploitation Example

1. Login as `john_doe` (user ID 2)
2. Change the URL to access admin's data (user ID 1)
3. Successfully retrieve sensitive information

### Impact
- Access to other users' personal information
- Ability to view other users' orders and payment details
- Privacy violation and data breach

### How to Fix
```javascript
// Proper authorization check
if (req.user.userId !== parseInt(userId)) {
    return res.status(403).json({ error: 'Forbidden' });
}
```

---

## 2. Broken Authentication

**Severity**: HIGH

### Vulnerabilities

#### Weak Password Requirements
No validation on password strength during registration.

```javascript
POST /api/auth/register
{
    "username": "test",
    "password": "1",  // Accepts single character passwords!
    "email": "test@test.com"
}
```

#### No Token Expiration
JWT tokens never expire, making them valid forever.

```javascript
// JWT created without expiration
const token = jwt.sign({ userId, username, role }, JWT_SECRET);
// Should be:
const token = jwt.sign({ userId, username, role }, JWT_SECRET, { expiresIn: '1h' });
```

#### Predictable Password Reset Tokens
Reset tokens are base64 encoded strings with predictable format.

```javascript
// Token format: base64(userId:timestamp)
const resetToken = Buffer.from(`${userId}:${Date.now()}`).toString('base64');
```

#### Information Disclosure
Different error messages reveal whether username exists.

```javascript
// Reveals if username exists
return res.status(401).json({ error: 'Username not found' });
// vs
return res.status(401).json({ error: 'Invalid password' });
```

### Impact
- Weak passwords make brute force attacks easier
- Stolen tokens remain valid indefinitely
- Password reset tokens can be predicted
- Username enumeration possible

---

## 3. Mass Assignment

**Severity**: HIGH

### Description
The API accepts all fields from the request body without filtering, allowing attackers to modify unauthorized fields.

### Vulnerable Endpoints

#### POST /api/auth/register
```javascript
// Attacker can set themselves as admin during registration
POST /api/auth/register
{
    "username": "hacker",
    "email": "hacker@test.com",
    "password": "test123",
    "role": "admin"  // Should not be allowed!
}
```

#### PUT /api/users/:id
```javascript
// Update your own role to admin
PUT /api/users/5
Authorization: Bearer <token>
{
    "role": "admin",  // Elevation of privilege!
    "credit_card": "9999999999999999"
}
```

### Exploitation Steps

1. Register a new account
2. Update profile with `role: "admin"`
3. Access admin endpoints

### Impact
- Privilege escalation
- Unauthorized field modification
- Bypassing business logic

### How to Fix
```javascript
// Whitelist allowed fields
const allowedFields = ['email', 'first_name', 'last_name', 'phone', 'address'];
const updateData = {};
allowedFields.forEach(field => {
    if (req.body[field]) updateData[field] = req.body[field];
});
```

---

## 4. Lack of Rate Limiting

**Severity**: MEDIUM

### Description
No rate limiting on critical endpoints allows brute force attacks and spam.

### Vulnerable Endpoints

- `POST /api/auth/login` - Brute force password guessing
- `POST /api/auth/register` - Account enumeration and spam
- `POST /api/reviews` - Review spam

### Exploitation

```bash
# Brute force login
for password in $(cat passwords.txt); do
    curl -X POST http://localhost:3001/api/auth/login \
         -d "{\"username\":\"admin\",\"password\":\"$password\"}"
done
```

### Impact
- Brute force attacks
- Denial of service
- Resource exhaustion
- Spam and abuse

---

## 5. Broken Function Level Authorization

**Severity**: HIGH

### Description
Admin endpoints have weak or missing authorization checks.

### Vulnerable Endpoints

#### GET /api/admin/users
```javascript
// Only checks query parameter, not actual permissions
GET /api/admin/users?admin=true
```

#### POST /api/admin/products
```javascript
// Uses weak header-based auth
POST /api/admin/products
X-Admin-Key: admin123  // Weak secret!
```

#### PUT /api/admin/products/:id
```javascript
// No authorization check at all!
PUT /api/admin/products/1
{
    "price": 0.01  // Change price to $0.01
}
```

#### GET /api/admin/stats
```javascript
// No authorization check
GET /api/admin/stats
Authorization: Bearer <any_token>
```

### Exploitation

Regular users can access admin functions by:
1. Adding `?admin=true` query parameter
2. Using weak `X-Admin-Key: admin123` header
3. Directly calling unprotected endpoints

### Impact
- Unauthorized access to admin functions
- Data modification
- Business logic bypass

---

## 6. Security Misconfiguration

**Severity**: MEDIUM

### Issues Found

#### Overly Permissive CORS
```javascript
cors({
    origin: '*',  // Accepts requests from ANY origin
    credentials: true
})
```

#### Debug Mode Enabled
```javascript
// Logs all request details
console.log(req.body, req.query, req.headers);
```

#### Verbose Error Messages
```javascript
res.json({
    error: err.message,
    stack: err.stack,  // Exposes full stack trace
    path: req.path
});
```

#### Exposed Configuration
```javascript
GET /health
{
    "jwtSecret": "insecure_jwt_secret_12345"  // Secret exposed!
}
```

### Impact
- Information disclosure
- Easier vulnerability exploitation
- Cross-origin attacks
- Sensitive data leakage

---

## 7. Improper Assets Management

**Severity**: LOW

### Description
Old, deprecated API versions remain accessible.

```javascript
// New endpoint
GET /api/products

// Old deprecated endpoint still works
GET /api/v1/products
```

The old endpoint may have different security controls or vulnerabilities.

---

## 8. SQL Injection

**Severity**: CRITICAL

### Description
User input is directly concatenated into SQL queries.

### Vulnerable Endpoint

#### GET /api/products?search=X

```javascript
// Vulnerable code
query += ` AND (name ILIKE '%${search}%' OR description ILIKE '%${search}%')`;
```

### Exploitation

```bash
# Extract all data
curl "http://localhost:3001/api/products?search=' OR '1'='1"

# Union-based injection
curl "http://localhost:3001/api/products?search=' UNION SELECT id,username,password,email,null,null,null FROM users--"

# Boolean-based blind injection
curl "http://localhost:3001/api/products?search=' AND 1=1--"
```

### Impact
- Full database compromise
- Data exfiltration
- Data modification
- Authentication bypass

---

## 9. Excessive Data Exposure

**Severity**: MEDIUM

### Description
APIs return more data than necessary, including sensitive fields.

### Examples

#### POST /api/auth/login
```json
{
    "token": "...",
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@vulnshop.com",
        "password": "$2b$10$...",  // Password hash exposed!
        "role": "admin",
        "credit_card": "4532123456789012",  // Credit card exposed!
        "created_at": "..."
    }
}
```

#### GET /api/users
Returns all users with all fields including password hashes and credit cards.

### Impact
- Sensitive data leakage
- Credential theft
- Privacy violation

### How to Fix
```javascript
// Return only necessary fields
const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
};
res.json({ token, user: safeUser });
```

---

## 10. Price Manipulation

**Severity**: HIGH

### Description
The API trusts critical data (like prices or totals) sent by the client instead of calculating it on the server.

### Vulnerable Endpoint

#### POST /api/orders
The server checks if `total_amount` is present in the request body and uses it if found.

```javascript
// Vulnerable code in orders.js
if (total_amount !== undefined) {
    finalTotal = total_amount; // Trusts client input!
}
```

### Impact
- Financial loss
- Users getting items for free or cheap

### How to Fix
Always calculate prices and totals on the server side based on trusted data (database prices). Never trust values from the client.

---

## 11. Race Condition (TOCTOU)

**Severity**: MEDIUM

### Description
A Time-of-Check to Time-of-Use (TOCTOU) vulnerability occurs when there is a delay between checking a condition (like stock availability) and acting on it (deducting stock).

### Vulnerable Endpoint

#### POST /api/orders
The server checks stock, waits for 2 seconds (simulated delay), and then deducts stock.

```javascript
// 1. Check stock
if (item.stock < quantity) error();

// 2. Delay (Vulnerability Window)
await new Promise(r => setTimeout(r, 2000));

// 3. Deduct stock
updateStock();
```

### Impact
- Inventory inconsistencies
- Overselling products
- Negative stock levels

### How to Fix
Use database transactions and row-level locking (`SELECT ... FOR UPDATE`) to ensure operations are atomic.

---

## Summary

| Vulnerability | Severity | Endpoints Affected |
|---------------|----------|-------------------|
| BOLA/IDOR | HIGH | users, orders, cart |
| Broken Authentication | HIGH | auth endpoints |
| Mass Assignment | HIGH | register, update user |
| No Rate Limiting | MEDIUM | auth, reviews |
| Broken Function Authorization | HIGH | all admin endpoints |
| Security Misconfiguration | MEDIUM | entire application |
| SQL Injection | CRITICAL | product search |
| Excessive Data Exposure | MEDIUM | users, auth |
| Improper Assets Management | LOW | deprecated v1 endpoints |

---

**Remember**: These vulnerabilities are intentional for learning. In production applications, ALL of these must be fixed!
