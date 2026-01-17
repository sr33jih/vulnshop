# Admin Login Fix - Resolved

## ✅ The Fix is Ready

I have updated the `database/init.sql` file with the **correct, verified bcrypt hash** for `password123`.

## 🛠️ How to Apply the Fix

Since you are running in WSL, simply run the reset script I created:

```bash
# In your WSL terminal:
bash reset_lab.sh
```

This script will:
1. Stop the containers
2. Remove the old database (with the wrong password)
3. Rebuild and start fresh with the correct password
4. Wait for initialization

## 🔑 Login Credentials

After the reset, use:

- **URL:** http://localhost
- **Username:** `admin`
- **Password:** `password123`

## Verification

If you want to verify the correct hash is in the database after reset:

```bash
docker exec vulnshop-db psql -U vulnshop -d vulnshop -c "SELECT password FROM users WHERE username='admin';"
```

It should match: `$2b$10$wITlKdk/t0VtUvTVuunccOZFL9zB4w/K0n1NWoVZKaBJMqsNhRn4.`
