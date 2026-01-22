#!/bin/bash
# Script temporal para aplicar schema a Neon
# BORRAR DESPUÉS DE USAR

# Pega aquí tu DATABASE_URL completa de Neon (con la contraseña real)
# La puedes copiar de:
# 1. Neon Console -> Connection Details
# 2. O de Vercel -> Settings -> Environment Variables -> DATABASE_URL

DATABASE_URL="postgresql://neondb_owner:TU_PASSWORD_AQUI@ep-tiny-dew-a9aegju0ti-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

echo "Aplicando schema a la base de datos..."
npx prisma db push

echo ""
echo "✅ Schema aplicado correctamente!"
echo ""
echo "🗑️  IMPORTANTE: Borra este archivo después de usarlo (contiene tu password)"
