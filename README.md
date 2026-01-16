# 🛡️ GuardyScan - Plataforma SaaS de Ciberseguridad Empresarial

**GuardyScan** es una plataforma completa de ciberseguridad que ofrece análisis de seguridad, gestión de incidentes y cumplimiento de estándares internacionales (ISO 27001, GDPR) con modelo de suscripción.

## 🚀 Características Principales

### 🔍 Motor de Escaneo Avanzado
- **Análisis SSL/TLS**: Validación de certificados, fechas de expiración y configuración
- **Headers de Seguridad**: Detección de headers faltantes (HSTS, CSP, X-Frame-Options, etc.)
- **Detección de Vulnerabilidades**: Identificación de fallos de seguridad comunes
- **Análisis DNS**: Registros A, MX, TXT y configuración de dominio
- **Detección de Tecnologías**: Frameworks, servidores y librerías utilizadas
- **Puntuación de Seguridad**: Score de 0-100 basado en múltiples factores

### 📊 Dashboard Completo
- Visualización de métricas de seguridad
- Historial completo de escaneos
- Gráficos y estadísticas en tiempo real
- Panel de incidentes activos
- Seguimiento de cumplimiento normativo

### 🎫 Gestión de Incidentes
- Registro y clasificación de incidentes de seguridad
- Niveles de severidad: LOW, MEDIUM, HIGH, CRITICAL
- Estados de seguimiento: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- Categorización por tipo de amenaza
- Notas y documentación de resolución

### ✅ Cumplimiento Normativo
- **ISO 27001**: Checklist completo de controles
- **GDPR**: Verificación de requisitos de privacidad
- **Ley Marco**: Adaptación a normativas locales
- Evidencias y documentación
- Puntuación de cumplimiento

### 💳 Sistema de Suscripción (Stripe)
**Plan FREE**: 3 escaneos/mes, análisis básico
**Plan BASIC** ($29/mes): 50 escaneos, gestión de incidentes
**Plan PROFESSIONAL** ($99/mes): 200 escaneos, ISO 27001, API access
**Plan ENTERPRISE** ($299/mes): Escaneos ilimitados, multi-usuario, soporte 24/7

**Compra Única**: Reporte PDF profesional por $9.99

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui** (Componentes UI)
- **Recharts** (Gráficos)

### Backend
- **Next.js API Routes**
- **NextAuth.js** (Autenticación)
- **Prisma ORM** (Base de datos)
- **PostgreSQL**

### Pagos & PDFs
- **Stripe** (Suscripciones y pagos únicos)
- **jsPDF** (Generación de reportes)

### Escaneo de Seguridad
- **Axios** (HTTP requests)
- **Node.js https** (Análisis SSL)
- **DNS lookup** (Análisis DNS)

## 📁 Estructura del Proyecto

```
GuardyScan/
├── prisma/
│   └── schema.prisma          # Modelos de base de datos
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── scans/         # API de escaneos
│   │   │   ├── stripe/        # Webhooks y checkout
│   │   │   └── pdf/           # Generación de PDFs
│   │   ├── auth/              # Páginas de login/register
│   │   ├── dashboard/         # Dashboard protegido
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── dashboard/         # Componentes del dashboard
│   │   └── ui/                # Componentes reutilizables
│   ├── lib/
│   │   ├── auth.ts            # Configuración NextAuth
│   │   ├── prisma.ts          # Cliente Prisma
│   │   ├── stripe.ts          # Configuración Stripe
│   │   ├── scanner.ts         # Motor de escaneo
│   │   ├── pdf-generator.ts   # Generador de PDFs
│   │   └── utils.ts
│   ├── hooks/
│   └── types/
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Instalación y Configuración

### 1. Clonar e Instalar Dependencias

```bash
cd GuardyScan
npm install
```

### 2. Configurar Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

**Variables requeridas:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/guardyscan"

# NextAuth
NEXTAUTH_SECRET="genera-con: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (crear en dashboard de Stripe)
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_PROFESSIONAL="price_..."
STRIPE_PRICE_ENTERPRISE="price_..."
STRIPE_PRICE_PDF_REPORT="price_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Configurar Base de Datos

**Opción A: PostgreSQL Local**
```bash
# macOS (con Homebrew)
brew install postgresql
brew services start postgresql
createdb guardyscan
```

**Opción B: PostgreSQL con Docker**
```bash
docker run --name guardyscan-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=guardyscan \
  -p 5432:5432 \
  -d postgres:15
```

**Opción C: Neon, Supabase o Railway** (Servicios en la nube)

### 4. Inicializar Prisma

```bash
# Generar cliente Prisma
npx prisma generate

# Crear tablas en la base de datos
npx prisma db push

# (Opcional) Abrir Prisma Studio
npx prisma studio
```

### 5. Configurar Stripe

1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. Obtén tus API keys (test mode)
3. Crea 4 productos con precios:
   - **Basic Plan**: $29/mes (recurring)
   - **Professional Plan**: $99/mes (recurring)
   - **Enterprise Plan**: $299/mes (recurring)
   - **PDF Report**: $9.99 (one-time)
4. Copia los Price IDs a tu `.env`
5. Configura el webhook:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copia el webhook secret a `STRIPE_WEBHOOK_SECRET`

### 6. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📋 Uso de la Plataforma

### Registro de Usuario
1. Ve a `/auth/register`
2. Crea una cuenta (automáticamente recibes plan FREE)
3. Accede al dashboard

### Crear un Escaneo
1. Dashboard → "Nuevo Escaneo"
2. Ingresa URL (ej: `https://example.com`)
3. Selecciona tipo de escaneo (BASIC, FULL, COMPLIANCE)
4. El escaneo se procesa automáticamente
5. Visualiza resultados y puntuación

### Comprar Reporte PDF
1. Ve a un escaneo completado
2. Click en "Comprar PDF ($9.99)"
3. Completa pago con Stripe
4. Descarga el PDF profesional

### Actualizar Plan
1. Dashboard → Facturación
2. Selecciona plan (BASIC, PROFESSIONAL, ENTERPRISE)
3. Completa checkout de Stripe
4. Tu plan se actualiza automáticamente vía webhook

### Gestión de Incidentes
1. Dashboard → Incidentes → "Nuevo Incidente"
2. Completa: título, descripción, severidad, categoría
3. Actualiza estado según progreso
4. Documenta resolución

### Cumplimiento ISO 27001
1. Dashboard → Cumplimiento
2. Revisa controles ISO 27001
3. Marca controles implementados
4. Agrega evidencias
5. Monitorea porcentaje de cumplimiento

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run db:push      # Sincronizar schema con DB
npm run db:studio    # Abrir Prisma Studio
```

## 🌐 Despliegue a Producción

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno en Vercel Dashboard
# Conectar base de datos (Neon, Supabase, Railway)
# Configurar webhook de Stripe en producción
```

### Variables de Entorno en Producción
- Actualiza `NEXTAUTH_URL` con tu dominio
- Actualiza `NEXT_PUBLIC_APP_URL` con tu dominio
- Usa las API keys de Stripe en modo LIVE (no test)
- Configura webhook de Stripe con tu URL de producción

## 🔒 Seguridad

- Autenticación segura con bcrypt (10 rounds)
- Sesiones JWT con NextAuth.js
- Variables de entorno para secretos
- Validación de esquemas con Zod
- Rate limiting (recomendado agregar)
- HTTPS obligatorio en producción

## 📊 Base de Datos

### Modelos Principales

- **User**: Usuarios de la plataforma
- **Subscription**: Planes y límites de escaneo
- **Scan**: Escaneos de seguridad realizados
- **Incident**: Incidentes de seguridad registrados
- **PdfPurchase**: Compras de reportes PDF
- **ComplianceControl**: Controles de cumplimiento ISO 27001

## 🎨 Personalización

### Colores
Edita `tailwind.config.ts` para cambiar el tema

### Planes de Precios
Modifica `src/lib/stripe.ts` para ajustar precios y límites

### Motor de Escaneo
Extiende `src/lib/scanner.ts` para agregar más checks de seguridad

## 📝 Próximas Funcionalidades

- [ ] Escaneo programado (cron jobs)
- [ ] Notificaciones por email
- [ ] API pública para integraciones
- [ ] Multi-tenancy (equipos)
- [ ] Exportación a CSV/Excel
- [ ] Integración con SIEM
- [ ] Análisis de código fuente
- [ ] Escaneo de puertos avanzado
- [ ] Detección de malware
- [ ] Comparación histórica de escaneos

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

## 💬 Soporte

- Email: support@guardyscan.com
- Documentación: [docs.guardyscan.com](https://docs.guardyscan.com)
- Discord: [discord.gg/guardyscan](https://discord.gg/guardyscan)

---

**Hecho con ❤️ para proteger empresas**

🛡️ **GuardyScan** - Tu plataforma de ciberseguridad todo-en-uno
