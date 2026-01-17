#!/bin/bash
echo "🛑 Stopping containers and removing old database volume..."
docker-compose down -v

echo "🚀 Rebuilding and starting fresh..."
docker-compose up -d --build

echo "⏳ Waiting for database to initialize (10 seconds)..."
sleep 10

echo "✅ Done! You can now login with:"
echo "   Username: admin"
echo "   Password: password123"
