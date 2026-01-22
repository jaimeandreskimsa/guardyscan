# 🚀 DESPLEGAR GUARDYSCAN.COM AHORA

## Tus Secrets Generados (Guárdalos bien):

```bash
NEXTAUTH_SECRET=gQ5cfZ2+7hRvF4mt3HH2ayzYO+43pK2dlRmhEzyxExg=
CRON_SECRET=io15lfaeRsiS3ElABwSVUJn8+VOJAMVwcma7hzJncaU=
SIEM_INGEST_API_KEY=G/0s7xeGmCYVMrNi8L93amkwiLSNV9mrsymyalx1ZRw=
```

---

## 📝 PASO 1: Configurar Base de Datos en Neon

1. Ve a https://console.neon.tech
2. Crea un nuevo proyecto llamado "guardyscan"
3. Copia la connection string (debería verse así):
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Guárdala** - la necesitarás en el Paso 3

---

## 📝 PASO 2: Preparar Stripe (si ya tienes cuenta)

### Si tu cuenta está en modo Test:
1. Ve a https://dashboard.stripe.com
2. Cambia a modo **Live** (toggle arriba a la derecha)
3. Ve a **Developers** → **API Keys**
4. Copia:
   - **Secret key** (sk_live_...)
   - **Publishable key** (pk_live_...)

### Crear productos:
1. Ve a **Products** → **Add Product**
2. Crea estos productos (en modo Live):

   **Producto 1: Plan Básico**
   - Nombre: Plan Básico
   - Precio: $29/mes (o tu moneda)
   - Recurring: Monthly
   - Copia el **Price ID** (price_...)

   **Producto 2: Plan Profesional**
   - Nombre: Plan Profesional  
   - Precio: $99/mes
   - Recurring: Monthly
   - Copia el **Price ID** (price_...)

   **Producto 3: Plan Empresa**
   - Nombre: Plan Empresa
   - Precio: $299/mes
   - Recurring: Monthly
   - Copia el **Price ID** (price_...)

   **Producto 4: Reporte PDF**
   - Nombre: Reporte PDF
   - Precio: $10
   - One-time payment
   - Copia el **Price ID** (price_...)

### Si NO tienes cuenta de Stripe o está en Test:
- Por ahora usa las keys de test (sk_test_...)
- Podrás actualizar a Live después sin problemas

---

## 📝 PASO 3: Subir Código a GitHub (si no lo has hecho)

```bash
# 1. Guardar cambios
git add .
git commit -m "Ready for production deployment"

# 2. Subir a GitHub
git push origin main
```

**Si no tienes el repositorio conectado a GitHub:**
1. Ve a https://github.com/new
2. Crea un repositorio llamado "guardyscan"
3. Ejecuta:
```bash
git remote set-url origin https://github.com/TU_USUARIO/guardyscan.git
git push -u origin main
```

---

## 📝 PASO 4: Desplegar en Vercel

### A. Importar proyecto:
1. Ve a https://vercel.com/dashboard
2. Click en **"Add New..."** → **"Project"**
3. Selecciona tu repositorio **guardyscan** de GitHub
4. **NO HAGAS CLICK EN DEPLOY TODAVÍA**

### B. Configurar Variables de Entorno:

En la sección **Environment Variables**, agrega TODAS estas:

```bash
# === DATABASE ===
DATABASE_URL
Valor: [Tu connection string de Neon del Paso 1]

# === NEXTAUTH ===
NEXTAUTH_SECRET
Valor: gQ5cfZ2+7hRvF4mt3HH2ayzYO+43pK2dlRmhEzyxExg=

NEXTAUTH_URL
Valor: https://guardyscan.com

# === STRIPE ===
STRIPE_SECRET_KEY
Valor: [Tu Secret Key de Stripe - sk_live_... o sk_test_...]

STRIPE_PUBLISHABLE_KEY  
Valor: [Tu Publishable Key - pk_live_... o pk_test_...]

STRIPE_PRICE_BASIC
Valor: [Price ID del Plan Básico - price_...]

STRIPE_PRICE_PROFESSIONAL
Valor: [Price ID del Plan Profesional - price_...]

STRIPE_PRICE_ENTERPRISE
Valor: [Price ID del Plan Empresa - price_...]

STRIPE_PRICE_PDF_REPORT
Valor: [Price ID del Reporte PDF - price_...]

# === APP ===
NEXT_PUBLIC_APP_URL
Valor: https://guardyscan.com

# === CRON ===
CRON_SECRET
Valor: io15lfaeRsiS3ElABwSVUJn8+VOJAMVwcma7hzJncaU=

# === SIEM ===
SIEM_INGEST_API_KEY
Valor: G/0s7xeGmCYVMrNi8L93amkwiLSNV9mrsymyalx1ZRw=

# === EMAIL (OPCIONAL POR AHORA) ===
EMAIL_FROM
Valor: noreply@guardyscan.com

ALERT_EMAIL_RECIPIENTS
Valor: admin@guardyscan.com
```

**IMPORTANTE:** Para cada variable, marca los checkboxes:
- ✅ Production
- ✅ Preview  
- ✅ Development

### C. Click en **"Deploy"**

Vercel comenzará a construir tu app. Tomará 2-5 minutos.

---

## 📝 PASO 5: Aplicar Schema a la Base de Datos

Mientras Vercel despliega, ejecuta esto en tu terminal:

```bash
# Usar la DATABASE_URL de Neon que copiaste en el Paso 1
DATABASE_URL="postgresql://..." npx prisma db push
```

Esto creará todas las tablas necesarias en tu base de datos.

---

## 📝 PASO 6: Configurar Dominio en Vercel

1. En Vercel Dashboard, ve a tu proyecto **guardyscan**
2. Ve a **Settings** → **Domains**
3. Click en **"Add"**
4. Escribe: `guardyscan.com`
5. Click **"Add"**
6. Vercel te mostrará los registros DNS que necesitas

### Configurar DNS en tu Registrador:

Ve a donde compraste guardyscan.com (GoDaddy, Namecheap, etc.) y agrega:

```
Tipo: A
Nombre: @
Valor: 76.76.21.21
TTL: Automático o 3600

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
TTL: Automático o 3600
```

**Espera 5-60 minutos** para que se propague el DNS.

---

## 📝 PASO 7: Configurar Webhook de Stripe

1. Ve a Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Configurar:
   - **Endpoint URL:** `https://guardyscan.com/api/stripe/webhook`
   - **Events to send:**
     - ✅ checkout.session.completed
     - ✅ customer.subscription.created
     - ✅ customer.subscription.updated
     - ✅ customer.subscription.deleted
     - ✅ invoice.payment_succeeded
     - ✅ invoice.payment_failed
4. Click **"Add endpoint"**
5. Click en el webhook creado
6. Copia el **Signing secret** (whsec_...)
7. Ve a Vercel → Settings → Environment Variables
8. Agrega:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
9. Redeploy el proyecto en Vercel

---

## ✅ PASO 8: Verificar que todo funciona

### Test 1: Sitio cargando
```bash
curl https://guardyscan.com
# O abre en el navegador
```

### Test 2: Crear cuenta
1. Ve a https://guardyscan.com/auth/register
2. Crea una cuenta de prueba
3. Inicia sesión

### Test 3: Test de pago (con tarjeta de prueba)
1. Ve a Dashboard → Billing
2. Selecciona un plan
3. Usa tarjeta de prueba:
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos
4. Completa el pago
5. Verifica que te redirija al dashboard

### Test 4: Scanner
1. Ve a Dashboard → Scanner
2. Ejecuta un escaneo de prueba
3. Verifica resultados

---

## 🎉 ¡LISTO!

Tu aplicación está en producción en:
- 🌐 **Sitio:** https://guardyscan.com
- 📊 **Dashboard:** https://guardyscan.com/dashboard
- 🔐 **Login:** https://guardyscan.com/auth/login

---

## 📊 SIGUIENTE: Monitoreo (OPCIONAL)

### Configurar Uptime Monitoring (Gratis):
1. Ve a https://uptimerobot.com
2. Crea cuenta
3. Agregar monitor:
   - Type: HTTPS
   - URL: https://guardyscan.com
   - Interval: 5 minutes
4. Agregar tu email para alertas

---

## 🆘 Si algo falla:

### Ver logs en Vercel:
1. Ve a tu proyecto en Vercel
2. Click en **Deployments**
3. Click en el deployment más reciente
4. Click en **"View Function Logs"**

### Errores comunes:

**"Error: Prisma Client not found"**
- Solución: Vercel → Deployments → Redeploy

**"Database connection failed"**
- Verifica que DATABASE_URL esté correcta
- Verifica que tenga `?sslmode=require` al final

**"Stripe webhook failed"**
- Verifica STRIPE_WEBHOOK_SECRET
- Verifica que la URL sea exacta: `/api/stripe/webhook`

**Dominio no carga**
- Espera propagación DNS (hasta 48h, usualmente 5-60min)
- Verifica registros DNS: https://dnschecker.org

---

## 📞 Checklist Final:

- [ ] Base de datos Neon creada y connection string copiada
- [ ] Stripe configurado (al menos en modo test)
- [ ] Código subido a GitHub
- [ ] Variables de entorno configuradas en Vercel
- [ ] Proyecto desplegado en Vercel
- [ ] Schema aplicado a BD con `prisma db push`
- [ ] Dominio configurado en Vercel
- [ ] DNS actualizado en registrador
- [ ] Webhook de Stripe configurado
- [ ] Tests básicos completados

---

**¿Dudas?** Revisa los logs en Vercel Dashboard o consulta DEPLOYMENT_GUIDE.md para más detalles.

**¡Buena suerte con tu lanzamiento! 🚀**
