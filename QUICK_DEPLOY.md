# 🚀 DESPLIEGUE RÁPIDO - GuardyScan.com

## 🎯 Inicio Rápido (5 pasos)

### 1️⃣ Preparar Base de Datos (5 min)

**Opción recomendada: Neon (Gratis)**

```bash
# 1. Ir a https://neon.tech
# 2. Crear cuenta (GitHub/Google)
# 3. Crear nuevo proyecto "guardyscan"
# 4. Copiar connection string
# 5. Guardar para el paso 3
```

### 2️⃣ Preparar Stripe (10 min)

```bash
# 1. Ir a https://dashboard.stripe.com
# 2. Activar modo Live (completar verificación de negocio)
# 3. Ir a Developers > API Keys
# 4. Copiar:
#    - Secret key (sk_live_...)
#    - Publishable key (pk_live_...)
# 5. Crear productos:
#    - Plan Básico ($29/mes)
#    - Plan Profesional ($99/mes)
#    - Plan Empresa ($299/mes)
#    - Reporte PDF ($10/reporte)
# 6. Copiar Price IDs de cada producto
```

### 3️⃣ Desplegar en Vercel (10 min)

```bash
# A. Crear repositorio en GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/guardyscan.git
git push -u origin main

# B. Ir a https://vercel.com
# C. Click "New Project"
# D. Importar repositorio de GitHub
# E. Configurar variables de entorno (ver lista abajo)
# F. Click "Deploy"
```

**Variables de entorno para Vercel:**

```bash
# Base de datos
DATABASE_URL=postgresql://usuario:password@host/guardyscan?sslmode=require

# NextAuth (generar con: openssl rand -base64 32)
NEXTAUTH_SECRET=tu_secret_aqui
NEXTAUTH_URL=https://guardyscan.com

# Stripe (del paso 2)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_ENTERPRISE=price_...
STRIPE_PRICE_PDF_REPORT=price_...

# App
NEXT_PUBLIC_APP_URL=https://guardyscan.com

# Cron (generar con: openssl rand -base64 32)
CRON_SECRET=tu_secret_aqui

# SIEM (generar con: openssl rand -base64 32)
SIEM_INGEST_API_KEY=tu_secret_aqui

# Email (opcional inicialmente)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@guardyscan.com
ALERT_EMAIL_RECIPIENTS=admin@guardyscan.com
```

### 4️⃣ Configurar Dominio (5 min)

**En tu registrador de dominios:**

```
Tipo: A
Nombre: @
Valor: 76.76.21.21

Tipo: CNAME  
Nombre: www
Valor: cname.vercel-dns.com
```

**En Vercel:**
- Settings > Domains
- Agregar: guardyscan.com
- Agregar: www.guardyscan.com
- Esperar propagación DNS (5-60 min)

### 5️⃣ Configurar Webhooks de Stripe (5 min)

```bash
# 1. Ir a Stripe Dashboard > Developers > Webhooks
# 2. Click "Add endpoint"
# 3. URL: https://guardyscan.com/api/stripe/webhook
# 4. Eventos a escuchar:
#    - checkout.session.completed
#    - customer.subscription.created
#    - customer.subscription.updated
#    - customer.subscription.deleted
#    - invoice.payment_succeeded
#    - invoice.payment_failed
# 5. Copiar "Signing secret" (whsec_...)
# 6. Agregarlo a Vercel:
#    STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## ✅ Verificación Post-Despliegue

### Tests rápidos:

```bash
# 1. Sitio cargando
curl https://guardyscan.com

# 2. Registro de usuario
# - Ir a https://guardyscan.com/auth/register
# - Crear cuenta de prueba
# - Verificar login

# 3. Test de suscripción
# - Ir a Dashboard > Billing
# - Usar tarjeta de prueba de Stripe: 4242 4242 4242 4242
# - Verificar que funciona el checkout

# 4. Test de scanner
# - Ir a Dashboard > Scanner
# - Ejecutar escaneo de prueba
# - Verificar resultados
```

---

## 🔧 Comandos Útiles

### Generar secrets:

```bash
# Para NEXTAUTH_SECRET, CRON_SECRET, etc.
openssl rand -base64 32
```

### Aplicar schema a BD:

```bash
# Desde terminal local
DATABASE_URL="tu_url_de_produccion" npx prisma db push

# Verificar
DATABASE_URL="tu_url_de_produccion" npx prisma studio
```

### Ver logs en Vercel:

```bash
# Instalar CLI de Vercel
npm i -g vercel

# Login
vercel login

# Ver logs
vercel logs guardyscan --follow
```

---

## 🆘 Solución de Problemas Comunes

### Error: "DATABASE_URL not found"
- Verificar que la variable esté en Vercel
- Redeployar: Vercel > Deployments > Redeploy

### Error: "Prisma Client not generated"
- Verificar que `postinstall: prisma generate` esté en package.json
- Forzar redeploy

### Dominio no carga
- Esperar propagación DNS (hasta 48h, usualmente 5-60min)
- Verificar registros DNS con: `dig guardyscan.com`
- Verificar en: https://dnschecker.org

### Stripe webhooks no funcionan
- Verificar URL exacta: `https://guardyscan.com/api/stripe/webhook`
- Verificar que STRIPE_WEBHOOK_SECRET esté configurado
- Ver logs de webhooks en Stripe Dashboard

### Emails no se envían
- Verificar RESEND_API_KEY
- Verificar dominio en Resend
- Agregar registros DNS de Resend

---

## 📊 Monitoreo Básico

### Configurar UptimeRobot (gratis):

```bash
# 1. Ir a https://uptimerobot.com
# 2. Crear cuenta
# 3. Agregar monitor:
#    - Type: HTTPS
#    - URL: https://guardyscan.com
#    - Interval: 5 minutes
# 4. Agregar email de alerta
```

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en:
- **Sitio principal:** https://guardyscan.com
- **Dashboard:** https://guardyscan.com/dashboard
- **Login:** https://guardyscan.com/auth/login

**Tiempo total estimado:** 30-45 minutos

**Siguiente paso:** Configurar email marketing, analytics, etc.

---

## 📞 ¿Necesitas ayuda?

Si algo no funciona:
1. Revisar logs en Vercel Dashboard
2. Verificar variables de entorno
3. Consultar DEPLOYMENT_GUIDE.md para más detalles
