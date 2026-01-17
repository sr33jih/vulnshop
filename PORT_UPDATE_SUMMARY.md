# Port Configuration Update - Summary

## Changes Made

All references to port `3000` have been updated to port `3001` throughout the project to avoid conflict with your existing Docker container.

### Files Updated

✅ **Configuration Files**
- `docker-compose.yml` - Backend port mapping: `3001:3000`
- `frontend/js/app.js` - API_URL: `http://localhost:3001/api`

✅ **Documentation Files**
- `README.md` - All URLs and curl examples
- `TESTING_GUIDE.md` - Postman setup and examples
- `QUICK_START.md` - Quick reference commands
- `VULNERABILITIES.md` - Exploitation examples

✅ **API Testing**
- `postman_collection.json` - base_url variable: `http://localhost:3001`

## Updated URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:3001 |
| API Documentation | http://localhost:3001/ |

## Next Steps

1. **Start Docker Desktop** (if not already running)

2. **Launch VulnShop:**
   ```bash
   cd "d:/PROJECTS/API Pentesting lab"
   docker-compose up -d
   ```

3. **Verify Services:**
   ```bash
   docker-compose ps
   ```

4. **Test Access:**
   - Frontend: http://localhost
   - API Health: http://localhost:3001/health

5. **Login with default credentials:**
   - Username: `admin`
   - Password: `password123`

## Testing Tools Configuration

### Postman
- Import `postman_collection.json` (already configured with port 3001)
- Or manually set environment variable: `base_url = http://localhost:3001`

### Burp Suite
- No changes needed - it intercepts at the browser level
- All intercepted requests will use the correct port automatically

### curl Examples
All curl examples in documentation now use port 3001:
```bash
curl http://localhost:3001/api/users/1 -H "Authorization: Bearer TOKEN"
```

## Port Conflict Resolution

Your system is now configured as:
- **Port 80** → Frontend (VulnShop)
- **Port 3000** → Your existing Docker container
- **Port 3001** → VulnShop Backend API ✨ NEW
- **Port 5432** → VulnShop PostgreSQL Database

Both containers can run simultaneously without conflicts!

---

**Ready to start!** 🚀

Run: `docker-compose up -d`
