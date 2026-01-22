# 🚀 Guía de Despliegue a Producción - GuardyScan.com

## Fecha: Enero 2026
## Dominio: guardyscan.com

---

## 📋 CHECKLIST PRE-DESPLIEGUE

### ✅ 1. Base de Datos en Producción

**Opción A: PostgreSQL en Neon (RECOMENDADO - GRATIS)**
- [ ] Crear cuenta en [neon.tech](https://neon.tech)
- [ ] Crear nueva base de datos
- [ ] Copiar `DATABASE_URL`
- [ ] Configurar variable de entorno en producción

**Opción B: PostgreSQL en Supabase (GRATIS)**
- [ ] Crear cuenta en [supabase.com](https://supabase.com)
- [ ] Crear proyecto
- [ ] Copiar connection string
- [ ] Configurar variable de entorno

**Opción C: PostgreSQL Propio**
- [ ] Tener servidor PostgreSQL accesible públicamente
- [ ] Configurar credenciales
- [ ] Asegurar conexión SSL

### ✅ 2. Variables de Entorno de Producción

Crear archivo `.env.production.local` (NO subir a Git):

```bash
# === DATABASE ===
DATABASE_URL="postgresql://usuario:password@host:5432/guardyscan?schema=public&sslmode=require"

# === NEXTAUTH ===
NEXTAUTH_SECRET="GENERAR_CON: openssl rand -base64 32"
NEXTAUTH_URL="https://guardyscan.com"

# === STRIPE (Producción) ===
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (Producción)
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_PROFESSIONAL="price_..."
STRIPE_PRICE_ENTERPRISE="price_..."
STRIPE_PRICE_PDF_REPORT="price_..."

# === EMAIL ===
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@guardyscan.com"
ALERT_EMAIL_RECIPIENTS="admin@guardyscan.com,security@guardyscan.com"

# === NOTIFICACIONES ===
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# === APP ===
NEXT_PUBLIC_APP_URL="https://guardyscan.com"

# === CRON ===
CRON_SECRET="GENERAR_CON: openssl rand -base64 32"

# === SIEM ===
SIEM_INGEST_API_KEY="GENERAR_CON: openssl rand -base64 32"
```

### ✅ 3. Configuración de Stripe para Producción

- [ ] Activar cuenta de Stripe (verificación de negocio)
- [ ] Crear productos en modo Live:
  - Plan Básico
  - Plan Profesional
  - Plan Empresa
  - Reporte PDF
- [ ] Configurar webhook en Stripe:
  - URL: `https://guardyscan.com/api/stripe/webhook`
  - Eventos: `checkout.session.completed`, `customer.subscription.*`
- [ ] Copiar secret de webhook
- [ ] Copiar API keys de producción

### ✅ 4. Configuración del Dominio

**Si usas Vercel:**
- [ ] Agregar dominio en Vercel Dashboard
- [ ] Configurar DNS en tu registrador:
  ```
  Tipo: A
  Nombre: @
  Valor: 76.76.21.21
  
  Tipo: CNAME
  Nombre: www
  Valor: cname.vercel-dns.com
  ```
- [ ] Esperar propagación DNS (5-60 min)
- [ ] Vercel configurará SSL automáticamente

**Si usas otro hosting:**
- [ ] Apuntar DNS a la IP del servidor
- [ ] Configurar certificado SSL (Let's Encrypt)

---

## 🌐 OPCIÓN 1: DESPLIEGUE EN VERCEL (RECOMENDADO)

### Ventajas
- ✅ Optimizado para Next.js
- ✅ SSL automático
- ✅ CDN global
- ✅ Despliegue automático desde Git
- ✅ Cron jobs incluidos
- ✅ Plan gratuito generoso

### Pasos

**1. Preparar repositorio Git**
```bash
# Si no tienes Git inicializado
git init
git add .
git commit -m "Initial commit - GuardyScan v1.0"

# Crear repositorio en GitHub
# Luego:
git remote add origin https://github.com/TU_USUARIO/guardyscan.git
git branch -M main
git push -u origin main
```

**2. Conectar con Vercel**
- Ir a [vercel.com](https://vercel.com)
- Hacer clic en "Import Project"
- Conectar con GitHub
- Seleccionar repositorio guardyscan
- Configurar:
  - Framework: Next.js (detectado automáticamente)
  - Build Command: `npm run build`
  - Output Directory: `.next` (automático)
  - Install Command: `npm install`

**3. Configurar Variables de Entorno**
En Vercel Dashboard → Settings → Environment Variables:
- Agregar TODAS las variables del checklist anterior
- Marcar cada una para: Production, Preview, Development

**4. Configurar Base de Datos**
```bash
# Desde tu terminal local
# Conectar a la base de datos de producción
DATABASE_URL="tu_url_de_produccion" npx prisma db push

# Verificar
DATABASE_URL="tu_url_de_produccion" npx prisma studio
```

**5. Agregar Dominio Personalizado**
- En Vercel Dashboard → Settings → Domains
- Agregar `guardyscan.com`
- Agregar `www.guardyscan.com`
- Seguir instrucciones de DNS

**6. Configurar Webhooks de Stripe**
- Ir a Stripe Dashboard → Developers → Webhooks
- Agregar endpoint: `https://guardyscan.com/api/stripe/webhook`
- Seleccionar eventos necesarios
- Copiar signing secret a variables de entorno

**7. Desplegar**
```bash
# Vercel desplegará automáticamente desde Git
# O manualmente:
npx vercel --prod
```

---

## 🖥️ OPCIÓN 2: DESPLIEGUE EN VPS/SERVIDOR PROPIO

### Requisitos
- Ubuntu 22.04 LTS o similar
- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2

### Pasos

**1. Preparar servidor**
```bash
# Conectar por SSH
ssh root@tu-servidor.com

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Instalar PostgreSQL (si no tienes BD externa)
sudo apt install -y postgresql postgresql-contrib
```

**2. Clonar proyecto**
```bash
cd /var/www
sudo git clone https://github.com/TU_USUARIO/guardyscan.git
cd guardyscan
sudo chown -R $USER:$USER /var/www/guardyscan
```

**3. Configurar variables de entorno**
```bash
nano .env.production.local
# Pegar todas las variables del checklist
```

**4. Instalar dependencias y construir**
```bash
npm install
npm run db:generate
DATABASE_URL="tu_url" npx prisma db push
npm run build
```

**5. Configurar PM2**
```bash
# Crear archivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'guardyscan',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Iniciar con PM2
mkdir logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**6. Configurar Nginx**
```bash
sudo nano /etc/nginx/sites-available/guardyscan.com
```

```nginx
server {
    listen 80;
    server_name guardyscan.com www.guardyscan.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/guardyscan.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**7. Configurar SSL con Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d guardyscan.com -d www.guardyscan.com
```

**8. Configurar Cron Jobs**
```bash
crontab -e
```

```cron
# Escaneos mensuales (día 1 de cada mes a medianoche)
0 0 1 * * curl -H "Authorization: Bearer TU_CRON_SECRET" https://guardyscan.com/api/cron/monthly-scans
```

---

## 🔒 SEGURIDAD POST-DESPLIEGUE

### Checklist de Seguridad

- [ ] **Firewall configurado**
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```

- [ ] **Fail2ban instalado**
  ```bash
  sudo apt install -y fail2ban
  sudo systemctl enable fail2ban
  ```

- [ ] **Backups automáticos de BD**
  - Configurar en Neon/Supabase (automático)
  - O script propio:
  ```bash
  # /root/backup-db.sh
  #!/bin/bash
  pg_dump $DATABASE_URL > /backups/guardyscan-$(date +%Y%m%d).sql
  find /backups -mtime +7 -delete
  ```
  
  ```bash
  # Cron diario
  0 2 * * * /root/backup-db.sh
  ```

- [ ] **Monitoring configurado**
  - Uptime: [UptimeRobot](https://uptimerobot.com) (gratis)
  - Errores: Vercel Analytics o Sentry
  - Performance: Vercel Analytics

- [ ] **Rate Limiting**
  - Ya incluido en el código (middleware)

- [ ] **Headers de seguridad**
  - Ya configurados en next.config.js

---

## 📧 CONFIGURACIÓN DE EMAIL

### Opción 1: Resend (RECOMENDADO)
```bash
# 1. Crear cuenta en resend.com
# 2. Verificar dominio guardyscan.com
# 3. Agregar registros DNS:
#    Tipo: TXT
#    Nombre: resend._domainkey
#    Valor: (proporcionado por Resend)

# 4. Copiar API key
RESEND_API_KEY="re_..."
```

### Opción 2: SendGrid
```bash
# Alternativa si Resend no funciona
SENDGRID_API_KEY="SG..."
```

---

## 🧪 TESTING PRE-PRODUCCIÓN

### Tests finales antes de lanzar:

```bash
# 1. Build local
npm run build
npm start

# 2. Verificar URLs
curl http://localhost:3000
curl http://localhost:3000/api/health

# 3. Test de autenticación
# - Registrar usuario
# - Iniciar sesión
# - Verificar dashboard

# 4. Test de Stripe
# - Suscribirse a plan
# - Verificar webhook
# - Cancelar suscripción

# 5. Test de scanner
# - Ejecutar escaneo
# - Generar reporte PDF
# - Verificar resultados

# 6. Test de SIEM
# - Verificar alertas
# - Test de webhooks (Slack/Discord)
```

---

## 📊 MONITOREO POST-LANZAMIENTO

### Métricas a vigilar (primeras 24-48 horas):

- [ ] Uptime (debe ser 99.9%+)
- [ ] Tiempo de respuesta (< 2s)
- [ ] Errores 500 (debe ser 0)
- [ ] Uso de CPU (< 70%)
- [ ] Uso de RAM (< 80%)
- [ ] Queries de BD lentas
- [ ] Webhooks de Stripe funcionando
- [ ] Emails llegando correctamente
- [ ] Cron jobs ejecutándose

### Herramientas de Monitoreo:

1. **UptimeRobot** (gratis)
   - Monitoreo cada 5 min
   - Alertas por email/SMS

2. **Vercel Analytics** (incluido)
   - Performance
   - Real User Monitoring

3. **Prisma Studio**
   - Verificar datos en BD

---

## 🚨 PLAN DE ROLLBACK

Si algo sale mal:

### En Vercel:
```bash
# 1. Ir a Deployments
# 2. Buscar último deployment estable
# 3. Clic en "..." → "Promote to Production"
```

### En VPS:
```bash
# 1. Hacer rollback con PM2
pm2 stop guardyscan

# 2. Checkout a commit anterior
git checkout COMMIT_HASH_ANTERIOR
npm install
npm run build

# 3. Reiniciar
pm2 restart guardyscan
```

---

## 📞 SOPORTE POST-DESPLIEGUE

### Logs importantes:

**Vercel:**
- Dashboard → Logs
- Dashboard → Analytics

**VPS:**
```bash
# Logs de aplicación
pm2 logs guardyscan

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs del sistema
sudo journalctl -u nginx -f
```

### Comandos útiles:

```bash
# Ver estado
pm2 status

# Reiniciar app
pm2 restart guardyscan

# Monitorear en tiempo real
pm2 monit

# Ver logs
pm2 logs guardyscan --lines 100
```

---

## ✅ CHECKLIST FINAL DE LANZAMIENTO

- [ ] Base de datos en producción funcionando
- [ ] Todas las variables de entorno configuradas
- [ ] Stripe en modo Live configurado
- [ ] Dominio apuntando correctamente
- [ ] SSL/HTTPS funcionando
- [ ] Emails de notificación funcionando
- [ ] Webhooks de Stripe funcionando
- [ ] Cron jobs configurados
- [ ] Backups automáticos activos
- [ ] Monitoring activo
- [ ] Tests de funcionalidad completos
- [ ] Plan de rollback preparado

---

## 🎉 POST-LANZAMIENTO

### Comunicación:
- [ ] Actualizar redes sociales
- [ ] Notificar a beta testers
- [ ] Publicar en Product Hunt (opcional)

### SEO:
- [ ] Verificar sitio en Google Search Console
- [ ] Enviar sitemap
- [ ] Configurar Google Analytics

### Marketing:
- [ ] Activar pixel de Facebook/Google Ads
- [ ] Configurar enlaces de afiliados
- [ ] Preparar campañas de lanzamiento

---

## 📝 NOTAS IMPORTANTES

1. **NUNCA** commitear archivos `.env*` al repositorio
2. Mantener `.gitignore` actualizado
3. Rotar secrets regularmente (cada 90 días)
4. Monitorear costos de servicios
5. Mantener documentación actualizada
6. Hacer backups antes de cambios mayores

---

**¿Preguntas? ¿Problemas?**
Revisa los logs primero. La mayoría de problemas están ahí.

**Éxito en tu lanzamiento! 🚀**
