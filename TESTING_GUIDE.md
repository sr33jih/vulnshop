# Testing Guide for VulnShop

This guide will help you test VulnShop vulnerabilities using **Burp Suite** and **Postman**.

## Table of Contents

1. [Setting Up Burp Suite](#setting-up-burp-suite)
2. [Setting Up Postman](#setting-up-postman)
3. [Testing Scenarios](#testing-scenarios)
4. [Common Attack Patterns](#common-attack-patterns)

---

## Setting Up Burp Suite

### Installation

1. Download Burp Suite Community Edition from [portswigger.net](https://portswigger.net/burp/communitydownload)
2. Install and launch Burp Suite
3. Start a Temporary Project (or New Project in Pro version)

### Browser Configuration

#### Firefox (Recommended)

1. Open Firefox Settings
2. Search for "Proxy"
3. Click "Settings" under Network Settings
4. Select "Manual proxy configuration"
5. HTTP Proxy: `127.0.0.1`, Port: `8080`
6. Check "Also use this proxy for HTTPS"
7. Click OK

#### Chrome

1. Install FoxyProxy extension
2. Add new proxy:
   - Title: Burp Suite
   - Proxy Type: HTTP
   - IP: 127.0.0.1
   - Port: 8080
3. Enable the proxy

### Install Burp's CA Certificate

1. With proxy enabled, visit: http://burpsuite
2. Click "CA Certificate" to download
3. In Firefox: Settings → Privacy & Security → Certificates → View Certificates → Import
4. Select the downloaded certificate
5. Check "Trust this CA to identify websites"

### Configure Burp Suite

1. Go to **Proxy** → **Intercept**
2. Turn intercept OFF initially
3. Browse to http://localhost
4. Go to **HTTP history** tab
5. You should see all requests

---

## Setting Up Postman

### Installation

1. Download from [postman.com/downloads](https://www.postman.com/downloads/)
2. Install and create a free account
3. Launch Postman

### Import VulnShop Collection

1. Click **Import** button
2. Select **file** tab
3. Choose `postman_collection.json` from the project
4. Collection will appear in the sidebar

### Set Up Environment Variables

1. Click **Environments** in the sidebar
2. Create new environment: "VulnShop Local"
3. Add variables:
   - `base_url`: `http://localhost:3001`
   - `token`: (leave empty, will be set automatically)
   - `user_id`: (leave empty, will be set automatically)
4. Save and select the environment

---

## Testing Scenarios

### Scenario 1: BOLA/IDOR - Access Other Users' Data

#### Using Burp Suite

1. Login as `john_doe` (password: `password123`)
2. With proxy intercept ON, click on Profile
3. In Burp, you'll see: `GET /api/users/2`
4. Right-click → Send to Repeater
5. Change the ID: `GET /api/users/1`
6. Click Send - you can see admin's profile!

#### Using Postman

1. Login using "Auth → Login" request with `john_doe`
2. Copy the token from response
3. Use "Users → Get User by ID" request
4. Change `user_id` in URL from `2` to `1`
5. Send - you'll get admin's data!

**Expected Result**: Access to another user's sensitive data including email, phone, address, even credit card!

---

### Scenario 2: SQL Injection in Product Search

#### Using Burp Suite

1. Go to the shop page
2. In search box, type any product
3. Intercept the request: `GET /api/products?search=shirt`
4. Send to Repeater
5. Change search parameter to: `search=' OR '1'='1`
6. Send - all products returned, SQL injection confirmed!

Try more advanced payloads:
```sql
' UNION SELECT null,username,password,email,null,null,null FROM users--
```

#### Using Postman

1. Use "Products → Search Products" request
2. Change the `search` parameter to: `' OR '1'='1`
3. Send request
4. All products are returned

**Expected Result**: SQL injection vulnerability confirmed.

---

### Scenario 3: Mass Assignment - Privilege Escalation

#### Using Burp Suite

1. Register a new account normally
2. Intercept the registration request
3. Add `"role": "admin"` to the JSON body:
```json
{
    "username": "hacker",
    "email": "hacker@test.com",
    "password": "test123",
    "role": "admin"
}
```
4. Forward the request
5. Login with the new account
6. You now have admin privileges!

#### Using Postman

1. Use "Auth → Update User Profile" request
2. Add these fields to the body:
```json
{
    "role": "admin",
    "email": "newemail@test.com"
}
```
3. Send request
4. Your role is now admin!

**Expected Result**: Privilege escalation successful.

---

### Scenario 4: Broken Function Level Authorization

#### Using Burp Suite

1. Login as regular user (`john_doe`)
2. Navigate to admin page (even though you're not admin)
3. Intercept request to: `GET /api/admin/users`
4. Note it has query parameter: `?admin=true`
5. Request goes through!
6. Try: `GET /api/admin/stats`
7. No authorization check - you get system statistics!

#### Using Postman

1. Login as regular user
2. Use "Admin → Get All Users" request
3. Notice the URL has `?admin=true`
4. Send - you get all users' data!

Try updating a product price:
1. Use "Admin → Update Product"
2. Set price to `0.01`
3. No authorization check!

**Expected Result**: Regular users can access admin functions.

---

### Scenario 5: Accessing Other Users' Carts

#### Using Burp Suite

1. Login as `john_doe`
2. Add items to cart
3. View cart - intercept request
4. Notice: `GET /api/cart?user_id=2`
5. Send to Repeater
6. Change to: `GET /api/cart?user_id=1`
7. You can see admin's cart!

Even worse - add items to someone else's cart:
```json
POST /api/cart/items
{
    "product_id": 5,
    "quantity": 99,
    "user_id": 1
}
```

**Expected Result**: Access and modify other users' carts.

---

### Scenario 6: No Rate Limiting - Brute Force

#### Using Burp Suite

1. Intercept a login request
2. Send to Intruder
3. Select password field
4. Add a payload list of common passwords
5. Start attack
6. No rate limiting - all requests go through!

#### Using Postman

Create a simple script to test:
```javascript
for (let i = 0; i < 100; i++) {
    pm.sendRequest({
        url: 'http://localhost:3001/api/auth/login',
        method: 'POST',
        header: 'Content-Type: application/json',
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                username: 'admin',
                password: 'password' + i
            })
        }
    });
}
```

**Expected Result**: No rate limiting, brute force possible.

---

### Scenario 7: Viewing Other Users' Orders

#### Using Burp Suite

1. Login and place an order
2. View order details
3. Intercept: `GET /api/orders/1`
4. Change order ID to `2`, `3`, etc.
5. Access all other users' orders!

Try listing others' orders:
```
GET /api/orders?user_id=1
```

**Expected Result**: Access to all orders.

---

### Scenario 8: Price Manipulation

#### Using Burp Suite

1. Add items to your cart
2. Click Checkout
3. Intercept the request: `POST /api/orders`
4. Add a `total_amount` field to the JSON body:
```json
{
    "shipping_address": "123 Test St",
    "total_amount": 1.00
}
```
5. Forward the request
6. Check the response - you just paid $1.00 for the entire order!

#### Using Postman

1. Add items to cart
2. Use "Orders → Create Order" request
3. Add `"total_amount": 0.01` to the body
4. Send request - Order created with $0.01 total!

**Expected Result**: The server accepts the client-provided total instead of calculating it.

---

### Scenario 9: Race Condition (TOCTOU)

#### Using Burp Suite

1. Find a product with low stock (e.g., set stock to 1 in database)
2. Add it to cart
3. Send `POST /api/orders` request to **Intruder** or **Turbo Intruder**
4. Configure to send 5-10 requests simultaneously (Null Payloads)
5. Start attack
6. You will see multiple successful orders (201 Created) even though stock was 1!

**Why it works**: We added a 2-second delay between checking stock and deducting it.

**Expected Result**: Buying more items than available in stock.

---

## Common Attack Patterns

### 1. Parameter Tampering

Change IDs in URLs:
- User IDs: `/api/users/1` → `/api/users/2`
- Order IDs: `/api/orders/1` → `/api/orders/2`
- Cart item IDs: `/api/cart/items/1` → `/api/cart/items/2`

### 2. Adding Unexpected Parameters

Add fields not in the form:
```json
{
    "email": "test@test.com",
    "role": "admin",
    "is_premium": true
}
```

### 3. SQL Injection Payloads

```
' OR '1'='1
' OR '1'='1'--
' UNION SELECT null,null,null--
'; DROP TABLE users--
```

### 4. Header Manipulation

Try different values for:
- `Authorization: Bearer <token>`
- `X-Admin-Key: admin123`
- `Content-Type: application/json`

### 5. JWT Manipulation

1. Copy your JWT token
2. Go to [jwt.io](https://jwt.io)
3. Decode the token
4. Change the `role` to `admin`
5. Use the modified token (won't work if signature is validated)

---

## Tips for Beginners

1. **Always read the response** - Error messages often leak information
2. **Check HTTP status codes** - 403 means forbidden, 401 means unauthorized
3. **Use Repeater in Burp** - Easy to modify and resend requests
4. **Take notes** - Document what works and what doesn't
5. **Read the code** - This is open source, you can see the vulnerabilities!

---

## Learning Exercises

### Exercise 1: Full Account Takeover
1. Find a way to reset another user's password
2. Hint: Look at the password reset mechanism

### Exercise 2: Data Exfiltration
1. Extract all usernames and emails from the database
2. Hint: SQL injection + UNION queries

### Exercise 3: Privilege Escalation Chain
1. Register as regular user
2. Escalate to admin
3. Access admin panel
4. Modify product prices

### Exercise 4: Order Manipulation
1. Create an order with $0 total
2. Hint: Modify cart items or prices

---

## Next Steps

1. Try all scenarios in this guide
2. Read `VULNERABILITIES.md` for detailed explanations
3. Learn how to fix each vulnerability
4. Practice on other vulnerable apps like DVWA, WebGoat
5. Study OWASP Top 10 and API Security Project

---

**Happy Testing! 🔍**

Remember: Only test on systems you have permission to test!
