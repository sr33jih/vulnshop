# VulnShop - Vulnerable E-Commerce API Penetration Testing Lab

![Warning](https://img.shields.io/badge/⚠️-INTENTIONALLY_VULNERABLE-red?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Required-blue?style=for-the-badge&logo=docker)
![Education](https://img.shields.io/badge/Purpose-Educational-green?style=for-the-badge)

**VulnShop** is a deliberately vulnerable clothing e-commerce API designed to teach the **OWASP API Security Top 10** vulnerabilities in a hands-on, realistic environment. Perfect for beginners learning API penetration testing with tools like Burp Suite and Postman!

## ⚠️ Security Warning

**THIS APPLICATION IS INTENTIONALLY VULNERABLE!**

- **NEVER** deploy this to production
- **NEVER** expose it to the internet
- Use **ONLY** in isolated lab environments
- For **educational purposes ONLY**

## 🎯 What You'll Learn

This lab covers the complete OWASP API Security Top 10:

1. **API1:2023 Broken Object Level Authorization (BOLA/IDOR)** - Access other users' carts, orders, and profiles
2. **API2:2023 Broken Authentication** - Weak JWT implementation, predictable tokens
3. **API3:2023 Broken Object Property Level Authorization** - Mass assignment vulnerabilities
4. **API4:2023 Unrestricted Resource Consumption** - No rate limiting on authentication and reviews
5. **API5:2023 Broken Function Level Authorization** - Regular users accessing admin functions
6. **API6:2023 Unrestricted Access to Sensitive Business Flows** - Unrestricted order creation
7. **API7:2023 Server Side Request Forgery (SSRF)** - (Implemented in search functionality)
8. **API8:2023 Security Misconfiguration** - Debug mode enabled, verbose errors, weak CORS
9. **API9:2023 Improper Inventory Management** - Old deprecated API versions exposed
10. **API10:2023 Unsafe Consumption of APIs** - (Present in integrations)

Additional vulnerabilities:
- **SQL Injection** in product search
- **Excessive Data Exposure** in user and order endpoints
- **Information Disclosure** through error messages

## 📋 Prerequisites

Before you begin, ensure you have:

- **Docker Desktop** installed ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** version 1.27.0 or higher
- At least **2GB of free RAM**
- **Burp Suite** (Community or Pro) - Optional ([Download](https://portswigger.net/burp/communitydownload))
- **Postman** - Optional ([Download](https://www.postman.com/downloads/))

### Check Docker Compose Version

```bash
docker-compose --version
```

## 🚀 Quick Start

### 1. Clone or Navigate to the Repository

```bash
cd "d:/PROJECTS/API Pentesting lab"
```

### 2. Start the Application

```bash
docker-compose up --build
```

This will:
- Build the backend API (Node.js/Express)
- Build the frontend (HTML/CSS/JS served by Nginx)
- Start PostgreSQL database
- Initialize the database with sample data

### 3. Access the Application

- **Frontend**: http://localhost
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/

### 4. Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | admin |
| john_doe | password123 | user |
| jane_smith | password123 | user |

### 5. Stop the Application

```bash
docker-compose down
```

To remove all data and volumes:

```bash
docker-compose down -v
```

## 📁 Project Structure

```
API Pentesting lab/
├── backend/                 # Express.js API
│   ├── config/
│   │   └── db.js           # Database connection
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── routes/
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── users.js        # User management
│   │   ├── products.js     # Product catalog
│   │   ├── cart.js         # Shopping cart
│   │   ├── orders.js       # Order management
│   │   ├── reviews.js      # Product reviews
│   │   └── admin.js        # Admin functions
│   ├── server.js           # Main application
│   ├── package.json
│   └── Dockerfile
├── frontend/               # Static website
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js         # Main application logic
│   │   ├── profile.js     # Profile page
│   │   └── admin.js       # Admin dashboard
│   ├── index.html
│   ├── profile.html
│   ├── admin.html
│   ├── nginx.conf
│   └── Dockerfile
├── database/
│   └── init.sql           # Database schema and seed data
├── docker-compose.yml
├── VULNERABILITIES.md     # Detailed vulnerability documentation
├── TESTING_GUIDE.md       # Testing with Burp Suite and Postman
├── postman_collection.json
└── README.md
```

## 🔧 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users (`/api/users`)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users` - List all users
- `DELETE /api/users/:id` - Delete user

### Products (`/api/products`)
- `GET /api/products` - List products (supports search and filters)
- `GET /api/products/:id` - Get product details
- `GET /api/v1/products` - Old deprecated endpoint

### Cart (`/api/cart`)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

### Orders (`/api/orders`)
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders` - List user's orders
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Cancel order

### Reviews (`/api/reviews`)
- `POST /api/reviews` - Create review
- `GET /api/reviews/product/:productId` - Get product reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Admin (`/api/admin`)
- `GET /api/admin/users` - List all users
- `GET /api/admin/orders` - List all orders
- `POST /api/admin/products` - Add product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/stats` - Get statistics

## 🧪 Testing the Vulnerabilities

### Example 1: BOLA/IDOR on User Profiles

```bash
# Login as john_doe
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}'

# Save the token, then access another user's profile
curl http://localhost:3001/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Example 2: SQL Injection in Product Search

```bash
# Try SQL injection in search parameter
curl "http://localhost:3001/api/products?search=' OR '1'='1"
```

### Example 3: Mass Assignment on Registration

```bash
# Register with admin role
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"hacker","email":"hacker@test.com","password":"test123","role":"admin"}'
```

## 📚 Learning Resources

1. **VULNERABILITIES.md** - Detailed explanation of each vulnerability with examples
2. **TESTING_GUIDE.md** - Step-by-step guides for Burp Suite and Postman
3. **postman_collection.json** - Pre-configured Postman requests

## 🛠️ Troubleshooting

### Database Connection Issues

```bash
# Check if all containers are running
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs database
```

### Port Already in Use

If ports 80, 3001, or 5432 are already in use, modify `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change external port
  backend:
    ports:
      - "3002:3000"  # Change external port
```

### Reset Everything

```bash
docker-compose down -v
docker-compose up --build
```

## 🎓 Learning Path for Beginners

1. **Start with the Frontend**
   - Register an account
   - Browse products and add to cart
   - Place an order
   - Explore the admin dashboard (as admin user)

2. **Use Browser DevTools**
   - Open DevTools (F12)
   - Watch the Network tab
   - See API requests and responses

3. **Test with Postman**
   - Import the Postman collection
   - Run requests manually
   - Modify parameters to test vulnerabilities

4. **Use Burp Suite**
   - Configure browser proxy
   - Intercept and modify requests
   - Test for vulnerabilities
   - See TESTING_GUIDE.md for details

5. **Learn from Examples**
   - Read VULNERABILITIES.md
   - Try each vulnerability
   - Understand the impact
   - Learn how to fix them

## 🤝 Contributing

This is an educational project. Feel free to:
- Add more vulnerabilities
- Improve documentation
- Create additional testing scenarios
- Submit pull requests

## 📄 License

MIT License - This project is for educational purposes only.

## 🙏 Acknowledgments

- Inspired by [OWASP crAPI](https://github.com/OWASP/crAPI)
- Built for learning OWASP API Security Top 10
- Created for cybersecurity education

---

**Happy Hacking! 🔐**

Remember: Use your skills responsibly and only on systems you have permission to test.
