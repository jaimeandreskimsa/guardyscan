# ⏰ Configuración de Escaneos Automáticos Mensuales

## 🎯 Funcionalidad

Los usuarios con planes de pago pueden configurar una URL para que sea escaneada automáticamente cada día 1 de mes. 

## 🔧 Configuración

### 1. Base de Datos

Los nuevos campos ya están en el schema de Prisma:

```bash
# Sincronizar cambios con la base de datos
npx prisma db push
```

### 2. Variables de Entorno

Agrega a tu `.env`:

```env
CRON_SECRET="genera-una-clave-secreta-aqui"
```

Genera una clave segura:
```bash
openssl rand -hex 32
```

### 3. Configurar Cron Job

#### Opción A: Vercel (Recomendado)

El archivo `vercel.json` ya está configurado. Vercel ejecutará automáticamente:
- **Endpoint**: `/api/cron/monthly-scans`
- **Frecuencia**: Día 1 de cada mes a las 00:00 UTC
- **Cron expression**: `0 0 1 * *`

**Configuración en Vercel:**
1. Despliega tu proyecto a Vercel
2. Ve a Project Settings → Environment Variables
3. Agrega `CRON_SECRET` con el mismo valor que en `.env`
4. Los cron jobs se activarán automáticamente

#### Opción B: Desarrollo Local (Manual)

Para probar en desarrollo, ejecuta manualmente:

```bash
curl -X GET http://localhost:3000/api/cron/monthly-scans \
  -H "Authorization: Bearer tu-cron-secret"
```

#### Opción C: Otros Servicios

**Railway/Render:**
Usa un servicio externo como [cron-job.org](https://cron-job.org):
1. Crea cuenta en cron-job.org
2. Configura:
   - URL: `https://tudominio.com/api/cron/monthly-scans`
   - Schedule: `0 0 1 * *` (día 1 de cada mes)
   - Header: `Authorization: Bearer tu-cron-secret`

**GitHub Actions:**
Crea `.github/workflows/monthly-scan.yml`:
```yaml
name: Monthly Auto Scans
on:
  schedule:
    - cron: '0 0 1 * *'  # Día 1 de cada mes
jobs:
  trigger-scans:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger monthly scans
        run: |
          curl -X GET https://tudominio.com/api/cron/monthly-scans \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

## 📱 Uso desde el Dashboard

### Para el Usuario:

1. **Ir a Configuración**: Dashboard → Configuración
2. **Activar escaneo automático**: Solo disponible para planes de pago
3. **Configurar URL**: Ingresar la URL que se escaneará mensualmente
4. **Guardar**: La configuración se guarda automáticamente

### Requisitos:

- ✅ Plan de pago (BASIC, PROFESSIONAL o ENTERPRISE)
- ✅ URL válida (https://ejemplo.com)
- ✅ Créditos de escaneo disponibles

## 🔄 Flujo de Ejecución

1. **Día 1 de cada mes a las 00:00 UTC**:
   - Vercel Cron ejecuta `/api/cron/monthly-scans`
   
2. **El endpoint verifica**:
   - Autenticación con `CRON_SECRET`
   - Busca suscripciones con `autoScanEnabled: true`
   - Valida que sean planes de pago activos
   
3. **Para cada usuario**:
   - Verifica límite de escaneos
   - Crea un nuevo Scan en estado PENDING
   - Ejecuta `performSecurityScan()` asíncronamente
   - Incrementa `scansUsed`
   - Actualiza `lastAutoScan`
   
4. **Resultados**:
   - Los escaneos aparecen en el dashboard del usuario
   - Se envían notificaciones (próxima feature)
   - Se generan reportes automáticos

## 🧪 Pruebas

### Probar configuración de usuario:

```bash
# 1. Activar auto-scan
curl -X POST http://localhost:3000/api/auto-scan/config \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=tu-session-token" \
  -d '{
    "autoScanEnabled": true,
    "autoScanUrl": "https://example.com"
  }'

# 2. Verificar configuración
curl -X GET http://localhost:3000/api/auto-scan/config \
  -H "Cookie: next-auth.session-token=tu-session-token"
```

### Probar ejecución de cron:

```bash
# Ejecutar manualmente los escaneos mensuales
curl -X GET http://localhost:3000/api/cron/monthly-scans \
  -H "Authorization: Bearer tu-cron-secret"
```

## 📊 Monitoreo

Revisa los logs en Vercel Dashboard para ver:
- Ejecuciones del cron job
- Usuarios procesados
- Escaneos creados
- Errores

## ⚠️ Consideraciones

### Límites de escaneo:
- Los escaneos automáticos consumen créditos del plan
- Si un usuario alcanza su límite, el escaneo se omite
- El campo `scansUsed` se reinicia mensualmente (implementar)

### Seguridad:
- El endpoint está protegido con `CRON_SECRET`
- Solo usuarios con planes de pago pueden activar auto-scan
- La URL es validada antes de guardarse

### Escalabilidad:
- Para muchos usuarios, considera:
  - Procesar en batches
  - Usar una cola (Redis Queue, BullMQ)
  - Distribuir ejecuciones durante el día

## 🔮 Mejoras Futuras

- [ ] Notificaciones por email cuando se complete el escaneo
- [ ] Alertas si el score de seguridad baja
- [ ] Opción de elegir día del mes (1-28)
- [ ] Escaneos semanales/diarios
- [ ] Comparación automática con escaneo anterior
- [ ] Reportes PDF automáticos
- [ ] Webhook cuando se completa el escaneo
- [ ] Reset automático de `scansUsed` cada mes

## 🆘 Troubleshooting

**El cron no se ejecuta:**
- Verifica que `vercel.json` esté en el root
- Revisa que el proyecto esté desplegado en Vercel
- Vercel Cron solo funciona en producción, no en preview

**Error 401 en cron endpoint:**
- Verifica que `CRON_SECRET` esté en las variables de entorno
- El header debe ser: `Authorization: Bearer tu-secret`

**Escaneos no se crean:**
- Verifica que el usuario tenga plan de pago
- Confirma que `autoScanEnabled: true`
- Revisa que no haya alcanzado el límite de escaneos
- Verifica la URL sea válida

---

¡Los escaneos automáticos están listos! 🚀
