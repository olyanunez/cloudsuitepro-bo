# Cómo Acceder a la Información de Suscripción

## 🎯 ¿Dónde veo el TrialBanner?

El **TrialBanner** ahora se muestra automáticamente en **TODAS las páginas del dashboard** cuando tu suscripción está en período de prueba.

### Ubicación:
- Se muestra justo debajo del Navbar (barra de navegación superior)
- Aparece en la parte superior de cada página del dashboard
- **Solo es visible cuando estás en período TRIAL**

### Comportamiento:
- **Si quedan más de 3 días**: Banner azul con mensaje informativo
- **Si quedan 3 días o menos**: Banner rojo con mensaje urgente
- **Si no estás en trial**: No se muestra (no ocupa espacio)

### Acciones del banner:
- Click en el botón del banner → Te lleva directamente a `/settings/subscription`

---

## 📊 ¿Cómo accedo al Plan Actual?

Hay **3 formas** de acceder a la página de tu plan/suscripción:

### Opción 1: Desde el menú de Configuración (Recomendado)
1. Abre el menú lateral (icono de hamburguesa ☰)
2. Click en **"Configuración"**
3. Click en la pestaña **"Suscripción"** (ícono de tarjeta de crédito 💳)

### Opción 2: Navegación directa
Simplemente ve a la URL:
```
/settings/subscription
```

### Opción 3: Desde el TrialBanner
Si estás en período de prueba:
1. El banner aparece automáticamente en la parte superior
2. Click en el botón **"Ver Detalles"** o **"Activar Ahora"**

---

## 📋 ¿Qué puedo ver en la página de Suscripción?

En `/settings/subscription` encontrarás:

### 1. Estado de la Suscripción
- **Plan actual** (nombre y precio)
- **Estado**: TRIAL, ACTIVE, PAST_DUE, SUSPENDED, etc.
- Badge de color según el estado
- Alerta especial si estás en período de prueba

### 2. Uso de Recursos
Barras de progreso con información de:
- **Usuarios**: Cuántos has creado vs. límite de tu plan
- **Productos**: Inventario usado vs. límite
- **Sucursales**: Sucursales activas vs. límite
- **Almacenes**: Almacenes creados vs. límite

Cada barra muestra:
- Cantidad actual / Máximo permitido
- Porcentaje de uso
- Color: 🟢 Verde (< 75%), 🟡 Amarillo (75-90%), 🔴 Rojo (> 90%)

### 3. Características del Plan
Lista de funcionalidades incluidas en tu plan actual:
- ✅ Funcionalidades activas (verde)
- ❌ Funcionalidades no disponibles (gris)

Ejemplos:
- Punto de Venta (POS)
- Múltiples Sucursales
- Seguimiento de Lotes
- Reportes Avanzados
- Acceso a API
- etc.

### 4. Acciones Disponibles
- **Cambiar Plan**: Botón para actualizar o cambiar tu plan
- **Cancelar Suscripción**: Botón para cancelar (si aplica)

---

## 🎨 Estructura de Navegación

```
Dashboard (cualquier página)
│
├── TrialBanner (si aplica)
│   └── Click → /settings/subscription
│
└── Menú lateral (☰)
    └── Configuración
        └── Tabs:
            ├── Empresa
            ├── Mi Perfil
            ├── Negocio
            ├── Sistema
            └── Suscripción 💳 → /settings/subscription
```

---

## 🔍 Archivos Importantes

### Componentes ya integrados:
- **TrialBanner**: `/src/components/subscription/TrialBanner.tsx`
  - Integrado en: `/src/components/layout/DashboardLayout.tsx:48`

- **Página de Suscripción**: `/src/app/(dashboard)/settings/subscription/page.tsx`
  - Accesible desde: `/settings/subscription`

- **Tab de Suscripción**: `/src/app/(dashboard)/settings/page.tsx:44-49`
  - Visible en la página de Configuración

### Hooks disponibles para usar:
```typescript
import {
  useSubscription,
  useFeatureAccess,
  useResourceUsage,
  useCanAddResource
} from '@/lib/hooks';
```

Ver documentación completa en: [SUBSCRIPTION_HOOKS_GUIDE.md](./SUBSCRIPTION_HOOKS_GUIDE.md)

---

## ✅ Checklist de Verificación

Para probar que todo funciona:

1. [ ] Inicia sesión en el dashboard
2. [ ] Verifica que el **TrialBanner** aparece en la parte superior (si estás en TRIAL)
3. [ ] Abre el menú lateral (☰)
4. [ ] Navega a **Configuración**
5. [ ] Click en la pestaña **"Suscripción"**
6. [ ] Deberías ver:
   - [ ] Tu plan actual
   - [ ] Estado de la suscripción
   - [ ] Uso de recursos (usuarios, productos, sucursales, almacenes)
   - [ ] Lista de características
   - [ ] Botones de acción

---

## 🚀 Próximos Pasos

Si necesitas personalizar o añadir más funcionalidad:

1. **Personalizar el diseño**: Edita los componentes en `/src/components/subscription/`
2. **Agregar más validaciones**: Usa los hooks en tus páginas/componentes
3. **Configurar alertas**: Usa `<ResourceLimitAlert>` en formularios de creación
4. **Proteger funcionalidades**: Usa `<FeatureGate>` para restringir acceso

Consulta la [Guía de Hooks](./SUBSCRIPTION_HOOKS_GUIDE.md) para ejemplos de uso.