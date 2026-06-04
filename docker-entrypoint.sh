#!/bin/sh
set -e

echo "🔄 Sincronizando base de datos..."
npx prisma db push --schema=./backend/prisma/schema.prisma --accept-data-loss

echo "✅ Base de datos lista"
echo "🚀 Iniciando servidor Equilibria..."

exec node dist/server.cjs
