# Docker Commands Guide for VulnShop

A beginner-friendly guide to managing your VulnShop Docker containers.

## 📋 Table of Contents

1. [Starting Containers](#starting-containers)
2. [Stopping Containers](#stopping-containers)
3. [Viewing Status](#viewing-status)
4. [Viewing Logs](#viewing-logs)
5. [Restarting Containers](#restarting-containers)
6. [Removing Containers](#removing-containers)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Starting Containers

### Start in Background (Detached Mode) - Recommended
```bash
cd "d:/PROJECTS/API Pentesting lab"
docker-compose up -d
```
- `-d` = detached mode (runs in background)
- Containers start and you get your terminal back
- **Best for normal use**

### Start in Foreground (See Live Logs)
```bash
docker-compose up
```
- Shows live logs from all containers
- Terminal stays attached
- Press `Ctrl+C` to stop

### Start with Rebuild (After Code Changes)
```bash
docker-compose up -d --build
```
- Rebuilds Docker images first
- Use this after changing backend/frontend code
- Takes longer but ensures changes are applied

### Start Specific Service
```bash
docker-compose up -d backend    # Only backend
docker-compose up -d frontend   # Only frontend
docker-compose up -d database   # Only database
```

---

## 🛑 Stopping Containers

### Stop All Containers (Preserves Data)
```bash
docker-compose stop
```
- Gracefully stops all containers
- Data in database is preserved
- Can restart with `docker-compose start`

### Stop and Remove Containers (Preserves Data)
```bash
docker-compose down
```
- Stops and removes containers
- **Database data is still preserved** in volumes
- Network is also removed
- Most common way to "turn off" VulnShop

### Stop Specific Service
```bash
docker-compose stop backend     # Stop only backend
docker-compose stop frontend    # Stop only frontend
```

### Force Stop (If Graceful Stop Fails)
```bash
docker-compose kill
```
- Immediately kills containers
- Use only if `stop` doesn't work

---

## 👀 Viewing Status

### Check if Containers are Running
```bash
docker-compose ps
```
**Output Example:**
```
NAME          IMAGE                     STATUS         PORTS
vulnshop-api  apipentestinglab-backend  Up 5 minutes   0.0.0.0:3001->3000/tcp
vulnshop-db   postgres:15-alpine        Up 5 minutes   0.0.0.0:5432->5432/tcp
vulnshop-web  apipentestinglab-frontend Up 5 minutes   0.0.0.0:80->80/tcp
```

### Check Docker Engine Status
```bash
docker ps
```
- Shows all running Docker containers on your system
- Not just VulnShop

### Check Docker Disk Usage
```bash
docker system df
```
- Shows how much disk space Docker is using

---

## 📊 Viewing Logs

### View Logs from All Containers
```bash
docker-compose logs
```

### Follow/Stream Live Logs (Like `tail -f`)
```bash
docker-compose logs -f
```
- Press `Ctrl+C` to exit
- **Doesn't stop containers**, just exits log view

### View Logs from Specific Service
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database
```

### View Last N Lines of Logs
```bash
docker-compose logs --tail=50 backend    # Last 50 lines
docker-compose logs --tail=100           # Last 100 lines from all
```

### View Logs with Timestamps
```bash
docker-compose logs -f -t
```

---

## 🔄 Restarting Containers

### Restart All Containers
```bash
docker-compose restart
```
- Quick restart without rebuilding
- Use after configuration changes

### Restart Specific Service
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart database
```

### Restart with Rebuild (After Code Changes)
```bash
docker-compose down
docker-compose up -d --build
```

---

## 🗑️ Removing Containers

### Remove Containers (Keep Data)
```bash
docker-compose down
```
- Removes containers and networks
- **Database data preserved** in volumes

### Remove Containers AND Data (Fresh Start)
```bash
docker-compose down -v
```
- ⚠️ **WARNING**: Deletes all database data!
- `-v` = removes volumes (database storage)
- Use this for complete reset

### Remove Images Too (Free Up Space)
```bash
docker-compose down --rmi all
```
- Removes containers, networks, AND images
- Next start will rebuild everything

### Complete Cleanup
```bash
docker-compose down -v --rmi all
```
- Removes everything: containers, volumes, images, networks
- Like factory reset

---

## 🔧 Troubleshooting

### Container Won't Start
```bash
# View error logs
docker-compose logs backend

# Try rebuilding
docker-compose up -d --build

# Check if port is in use
netstat -ano | findstr :3001
```

### Database Issues
```bash
# Reset database completely
docker-compose down -v
docker-compose up -d

# View database logs
docker-compose logs database
```

### Access Container Shell (Advanced)
```bash
# Access backend container
docker exec -it vulnshop-api sh

# Access database container
docker exec -it vulnshop-db psql -U vulnshop -d vulnshop

# Exit container shell
exit
```

### Check Container Resource Usage
```bash
docker stats
```
- Shows CPU, memory, network usage
- Press `Ctrl+C` to exit

---

## 🎯 Common Workflows

### Daily Usage

**Start VulnShop:**
```bash
docker-compose up -d
```

**Check it's running:**
```bash
docker-compose ps
```

**Stop when done:**
```bash
docker-compose down
```

### After Making Code Changes

```bash
docker-compose down
docker-compose up -d --build
```

### Complete Reset (Fresh Start)

```bash
docker-compose down -v
docker-compose up -d --build
```

### View API Logs While Testing

```bash
docker-compose logs -f backend
```
(Press `Ctrl+C` when done viewing)

---

## 📝 Quick Reference

| Action | Command |
|--------|---------|
| Start (background) | `docker-compose up -d` |
| Start (foreground) | `docker-compose up` |
| Stop | `docker-compose down` |
| Restart | `docker-compose restart` |
| View status | `docker-compose ps` |
| View logs | `docker-compose logs -f` |
| Rebuild & start | `docker-compose up -d --build` |
| Complete reset | `docker-compose down -v` |
| Stop foreground | `Ctrl+C` (then `docker-compose down`) |

---

## ⚡ Pro Tips

1. **Always run commands from project directory:**
   ```bash
   cd "d:/PROJECTS/API Pentesting lab"
   ```

2. **Use `-d` flag for normal use:**
   - Runs in background
   - Terminal stays free
   - Can still view logs with `docker-compose logs -f`

3. **`Ctrl+C` in foreground mode:**
   - Stops the log output
   - Containers keep running!
   - Run `docker-compose down` to actually stop

4. **Rebuild after code changes:**
   - Backend code → `docker-compose up -d --build backend`
   - Frontend code → `docker-compose up -d --build frontend`

5. **Database reset:**
   - Lost data: `docker-compose down -v`
   - Keep data: `docker-compose down` (without `-v`)

---

## 🆘 Emergency Commands

### Everything is Broken, Start Fresh
```bash
docker-compose down -v --rmi all
docker-compose up -d --build
```

### Container Won't Stop
```bash
docker-compose kill
docker-compose down -v
```

### Out of Disk Space
```bash
docker system prune -a
# WARNING: Removes all unused Docker data!
```

---

**Need Help?** Check the main [README.md](README.md) or [QUICK_START.md](QUICK_START.md)

Happy Dockering! 🐳
