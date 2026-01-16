# GuardyScan - Configuración Rápida

## Inicio Rápido (5 minutos)

### 1. Base de Datos (Elige una opción)

**Opción más rápida: Neon (PostgreSQL en la nube - GRATIS)**
```bash
# 1. Ve a https://neon.tech
# 2. Crea cuenta gratis
# 3. Crea un proyecto
# 4. Copia la connection string
# 5. Pégala en .env como DATABASE_URL
```

**Alternativa: Docker Local**
```bash
docker run --name guardyscan-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=guardyscan -p 5432:5432 -d postgres:15
```

### 2. Configurar Stripe (Modo Test)

```bash
# 1. Ve a https://dashboard.stripe.com/register
# 2. Activa "modo test" (toggle arriba a la derecha)
# 3. Ve a "Developers" → "API keys"
# 4. Copia Secret key y Publishable key a .env

# 5. Crear productos (Dashboard → Products → Add product):
#    - Basic Plan: $29/mes recurring
#    - Professional Plan: $99/mes recurring  
#    - Enterprise Plan: $299/mes recurring
#    - PDF Report: $9.99 one-time

# 6. Copia los Price IDs a .env
```

### 3. Variables de Entorno

```bash
cp .env.example .env
# Edita .env con tus valores reales
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Instalar y Ejecutar

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 5. Probar Stripe Webhooks (Terminal 2)

```bash
# Instala Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copia el webhook secret que aparece a STRIPE_WEBHOOK_SECRET en .env
```

## 🎯 Primeros Pasos

1. **Registrar usuario**: http://localhost:3000/auth/register
2. **Crear escaneo**: Dashboard → Nuevo Escaneo
3. **Probar pago**: Dashboard → Facturación → Actualizar plan

## 💳 Tarjetas de Prueba Stripe

```
Éxito: 4242 4242 4242 4242
Fallo:  4000 0000 0000 0002
CVV: cualquier 3 dígitos
Fecha: cualquier fecha futura
```

## 🐛 Problemas Comunes

**Error de conexión DB:**
```bash
# Verifica que PostgreSQL esté corriendo
# Verifica DATABASE_URL en .env
npx prisma db push --force-reset
```

**Error de Stripe:**
```bash
# Verifica que las API keys sean de modo TEST
# Verifica que los Price IDs existan en Stripe
```

**Error de autenticación:**
```bash
# Regenera NEXTAUTH_SECRET
openssl rand -base64 32
```

## 📱 Estructura de Páginas

- `/` - Landing page
- `/auth/login` - Login
- `/auth/register` - Registro
- `/dashboard` - Dashboard principal
- `/dashboard/scans` - Lista de escaneos
- `/dashboard/incidents` - Gestión de incidentes
- `/dashboard/compliance` - ISO 27001
- `/dashboard/billing` - Facturación

¡Listo para proteger empresas! 🛡️
