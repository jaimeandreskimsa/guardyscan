# GuardyScan - Soporte Multiidioma

## Idiomas Disponibles

- 🇺🇸 **Inglés** (English) - Idioma por defecto
- 🇪🇸 **Español** (Spanish)

## Estructura de URLs

La aplicación ahora usa rutas con prefijo de idioma:

```
/ → Redirige a /en
/en → Página de inicio en inglés
/es → Página de inicio en español
/en/auth/login → Login en inglés
/es/auth/login → Login en español
/en/dashboard → Dashboard en inglés
/es/dashboard → Dashboard en español
```

## Componentes Traducidos

### Páginas Principales
- ✅ Página de inicio (Landing page)
- ✅ Login
- ✅ Registro
- ✅ Dashboard
- ✅ Navegación del dashboard

### Selector de Idioma
El componente `<LanguageSwitcher />` está disponible en todas las páginas:
- Aparece en la esquina superior derecha
- Permite cambiar entre inglés y español
- Mantiene la ruta actual al cambiar de idioma

## Archivos de Traducción

Las traducciones están en formato JSON en `/messages/`:

```
/messages/
  ├── en.json  (Inglés)
  └── es.json  (Español)
```

### Estructura de Traducciones

```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    ...
  },
  "nav": {
    "dashboard": "Dashboard",
    "scans": "Scans",
    ...
  },
  "auth": {
    "login": { ... },
    "register": { ... }
  },
  "dashboard": { ... },
  "scans": { ... },
  "incidents": { ... },
  ...
}
```

## Cómo Usar Traducciones

### En Componentes del Servidor (Server Components)

```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page({ params: { locale } }) {
  const t = await getTranslations('dashboard');
  
  return <h1>{t('welcome')}</h1>;
}
```

### En Componentes del Cliente (Client Components)

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('dashboard');
  
  return <h1>{t('welcome')}</h1>;
}
```

### Traducciones con Arrays

```tsx
const features = t.raw('pricing.plans.BASIC.features') as string[];

features.map(feature => <li>{feature}</li>)
```

## Agregar Nuevas Traducciones

1. **Actualiza ambos archivos** `/messages/en.json` y `/messages/es.json`
2. **Mantén la misma estructura** en ambos archivos
3. **Usa claves descriptivas** en snake_case o camelCase

Ejemplo:

```json
// en.json
{
  "settings": {
    "title": "Settings",
    "autoScan": "Auto-Scan Configuration"
  }
}

// es.json
{
  "settings": {
    "title": "Configuración",
    "autoScan": "Configuración de Auto-Escaneo"
  }
}
```

## Agregar un Nuevo Idioma

1. Crear archivo de mensajes en `/messages/{locale}.json`
2. Actualizar `/src/i18n.ts`:

```ts
export const locales = ['en', 'es', 'fr'] as const; // Agregar 'fr'
```

3. Actualizar el `LanguageSwitcher` con el nuevo idioma:

```tsx
<DropdownMenuItem onClick={() => switchLocale('fr')}>
  🇫🇷 Français
</DropdownMenuItem>
```

## Configuración

### next.config.js
```js
const withNextIntl = require('next-intl/plugin')();
module.exports = withNextIntl(nextConfig);
```

### middleware.ts
```ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});
```

## Pruebas

Para probar el sistema multiidioma:

1. **Inicia el servidor**: `npm run dev`
2. **Visita** http://localhost:3000 (redirige a /en)
3. **Cambia al español**: Click en el selector de idioma → Español
4. **Verifica** que la URL cambia a /es y el contenido se traduce
5. **Navega** por las páginas y verifica que mantienen el idioma

## Características

- ✅ Detección automática de idioma preferido del navegador
- ✅ URLs limpias con prefijo de idioma
- ✅ Cambio de idioma sin perder la ruta actual
- ✅ Traducciones tipadas con TypeScript
- ✅ SSR y SSG compatibles
- ✅ Componente de selector de idioma reutilizable

## Páginas Pendientes de Traducción

Las siguientes páginas aún necesitan ser migradas a la estructura `[locale]`:

- [ ] /dashboard/scans (página de escaneos)
- [ ] /dashboard/incidents (página de incidentes)
- [ ] /dashboard/compliance (página de cumplimiento)
- [ ] /dashboard/settings (página de configuración)
- [ ] /pricing (página de planes)

Para migrar una página:
1. Mover de `/src/app/ruta/page.tsx` a `/src/app/[locale]/ruta/page.tsx`
2. Agregar traducciones a `/messages/en.json` y `/messages/es.json`
3. Usar `useTranslations()` o `getTranslations()` en el componente
4. Actualizar todos los `<Link>` para incluir `/${locale}/`

## Soporte

Para más información sobre next-intl: https://next-intl-docs.vercel.app/
