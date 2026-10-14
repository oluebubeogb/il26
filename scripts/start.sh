#!/bin/sh
set -e

echo "=== Ibeku League 2026 — Starting ==="

echo "Waiting for database..."
i=0
until npx prisma db execute --stdin <<SQL
SELECT 1
SQL
do
  i=$((i+1))
  if [ "$i" -gt 30 ]; then
    echo "Database not ready after 60s — exiting"
    exit 1
  fi
  echo "Database not ready, waiting... ($i)"
  sleep 2
done

echo "Running migrations..."
npx prisma migrate deploy

echo "Running seed (idempotent)..."
npx tsx prisma/seed.ts || echo "Seed finished (or already applied)"

echo "Bootstrapping primary admin..."
npx tsx scripts/bootstrap-admin.ts || echo "Admin bootstrap finished"

echo "Starting Next.js server..."
exec node server.js
