#!/bin/sh
set -e

echo "=== Ibeku League 2026 — Starting ==="

echo "Waiting for database..."
i=0
# Use node + prisma to check connectivity without needing full execute stdin quirks
until node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$queryRaw\`SELECT 1\`.then(() => p.\$disconnect()).then(() => process.exit(0)).catch(() => process.exit(1));
" 2>/dev/null; do
  i=$((i+1))
  if [ "$i" -gt 30 ]; then
    echo "Database not ready after 60s — exiting"
    exit 1
  fi
  echo "Database not ready, waiting... ($i)"
  sleep 2
done

echo "Running migrations..."
npx prisma migrate deploy --schema=prisma/schema.prisma

echo "Running seed (idempotent)..."
npx tsx prisma/seed.ts || echo "Seed finished (or already applied)"

echo "Bootstrapping primary admin..."
npx tsx scripts/bootstrap-admin.ts || echo "Admin bootstrap finished"

echo "Starting Next.js server..."
exec node server.js
