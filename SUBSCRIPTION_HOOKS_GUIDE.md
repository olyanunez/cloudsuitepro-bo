# Guía de Uso: Hooks y Componentes de Suscripción

Este documento explica cómo usar los hooks y componentes de suscripción en la aplicación.

## 📚 Hooks Disponibles

### 1. `useSubscription()`

Obtiene la suscripción actual del tenant con información útil.

```tsx
import { useSubscription } from '@/lib/hooks';

function MyComponent() {
  const {
    subscription,        // Objeto Subscription completo
    loading,            // Estado de carga
    error,              // Mensaje de error si ocurre
    refetch,            // Función para recargar la suscripción
    isInTrial,          // true si está en período de prueba
    isActive,           // true si está activa o en trial
    trialDaysRemaining  // Días restantes de trial (null si no aplica)
  } = useSubscription();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Plan: {subscription?.plan.name}</h1>
      {isInTrial && <p>Te quedan {trialDaysRemaining} días de prueba</p>}
    </div>
  );
}
```

### 2. `useFeatureAccess(feature)`

Verifica si el tenant tiene acceso a una funcionalidad específica.

```tsx
import { useFeatureAccess } from '@/lib/hooks';

function AdvancedReportsButton() {
  const { hasAccess, loading } = useFeatureAccess('hasAdvancedReports');

  if (loading) return <button disabled>Cargando...</button>;

  if (!hasAccess) {
    return <button disabled>Reportes Avanzados (No disponible en tu plan)</button>;
  }

  return <button onClick={handleClick}>Ver Reportes Avanzados</button>;
}
```

### 3. `useMultipleFeatureAccess(features)`

Verifica múltiples funcionalidades a la vez.

```tsx
import { useMultipleFeatureAccess } from '@/lib/hooks';

function SettingsPage() {
  const features = useMultipleFeatureAccess([
    'hasMultiBranch',
    'hasMultiWarehouse',
    'hasAPIAccess'
  ]);

  return (
    <div>
      {features.hasMultiBranch?.hasAccess && <BranchSettings />}
      {features.hasMultiWarehouse?.hasAccess && <WarehouseSettings />}
      {features.hasAPIAccess?.hasAccess && <APISettings />}
    </div>
  );
}
```

### 4. `useResourceUsage()`

Obtiene estadísticas de uso de recursos (usuarios, productos, sucursales, almacenes).

```tsx
import { useResourceUsage } from '@/lib/hooks';

function ResourceDashboard() {
  const {
    usageStats,  // Estadísticas completas
    loading,
    error,
    refetch,
    users,       // Objeto ResourceLimit para usuarios
    products,    // Objeto ResourceLimit para productos
    branches,    // Objeto ResourceLimit para sucursales
    warehouses   // Objeto ResourceLimit para almacenes
  } = useResourceUsage();

  return (
    <div>
      <h2>Uso de Recursos</h2>
      <p>Usuarios: {users.current} / {users.max || '∞'}</p>
      <p>Productos: {products.current} / {products.max || '∞'}</p>

      {users.isNearLimit && <p>⚠️ Cerca del límite de usuarios</p>}
      {users.isAtLimit && <p>🚫 Límite de usuarios alcanzado</p>}

      {users.remaining !== null && (
        <p>Puedes agregar {users.remaining} usuarios más</p>
      )}
    </div>
  );
}
```

**Propiedades de ResourceLimit:**
```typescript
interface ResourceLimit {
  current: number;        // Cantidad actual
  max: number | null;     // Límite máximo (null = ilimitado)
  percentage: number;     // Porcentaje de uso (0-100)
  isNearLimit: boolean;   // true si está entre 75% y 100%
  isAtLimit: boolean;     // true si current >= max
  remaining: number | null; // Espacios restantes (null si ilimitado)
}
```

### 5. `useCanAddResource(resourceType)`

Verifica si hay espacio disponible para agregar un recurso.

```tsx
import { useCanAddResource } from '@/lib/hooks';

function AddUserButton() {
  const canAddUser = useCanAddResource('users');

  if (!canAddUser) {
    return (
      <button disabled>
        No puedes agregar más usuarios (límite alcanzado)
      </button>
    );
  }

  return <button onClick={handleAddUser}>Agregar Usuario</button>;
}
```

## 🎨 Componentes Disponibles

### 1. `<FeatureGate>`

Controla el acceso a funcionalidades basado en el plan.

```tsx
import { FeatureGate } from '@/components/subscription';

function MyPage() {
  return (
    <div>
      {/* Solo muestra el contenido si tiene la funcionalidad */}
      <FeatureGate feature="hasMultiBranch">
        <MultiBranchSettings />
      </FeatureGate>

      {/* Con mensaje personalizado si no tiene acceso */}
      <FeatureGate
        feature="hasAPIAccess"
        fallback={<p>API Access no disponible en tu plan</p>}
      >
        <APIDocumentation />
      </FeatureGate>

      {/* Sin mensaje de upgrade */}
      <FeatureGate
        feature="hasBatchTracking"
        showUpgradeMessage={false}
      >
        <BatchTrackingModule />
      </FeatureGate>
    </div>
  );
}
```

**Props:**
- `feature`: Código de la funcionalidad requerida
- `children`: Contenido a mostrar si tiene acceso
- `fallback?`: Contenido alternativo si no tiene acceso
- `showUpgradeMessage?`: Si debe mostrar mensaje de upgrade (default: true)

### 2. `<ResourceLimitAlert>`

Muestra alertas cuando un recurso está cerca o ha alcanzado su límite.

```tsx
import { ResourceLimitAlert } from '@/components/subscription';

function UsersPage() {
  return (
    <div>
      {/* Alerta si usuarios >= 75% del límite */}
      <ResourceLimitAlert resourceType="users" />

      {/* Alerta personalizada con threshold del 90% */}
      <ResourceLimitAlert resourceType="products" threshold={90} />

      <UsersList />
    </div>
  );
}
```

**Props:**
- `resourceType`: 'users' | 'products' | 'branches' | 'warehouses'
- `threshold?`: Porcentaje para mostrar alerta (default: 75)

### 3. `<TrialBanner>`

Banner que muestra información del período de prueba.

```tsx
import { TrialBanner } from '@/components/subscription';

function DashboardLayout({ children }) {
  return (
    <div>
      {/* Muestra banner solo si está en TRIAL */}
      <TrialBanner />

      <main>{children}</main>
    </div>
  );
}
```

Se muestra automáticamente:
- En **azul** si quedan más de 3 días
- En **rojo** si quedan 3 días o menos (urgente)
- No se muestra si no está en trial

## 📋 Ejemplos Completos

### Ejemplo 1: Página protegida por funcionalidad

```tsx
import { FeatureGate } from '@/components/subscription';
import { useFeatureAccess } from '@/lib/hooks';

function BatchTrackingPage() {
  const { hasAccess, loading } = useFeatureAccess('hasBatchTracking');

  // Redireccionar si no tiene acceso
  useEffect(() => {
    if (!loading && !hasAccess) {
      router.push('/settings/subscription');
    }
  }, [hasAccess, loading]);

  if (loading) return <Loading />;

  return (
    <FeatureGate feature="hasBatchTracking">
      <h1>Seguimiento de Lotes</h1>
      <BatchTrackingContent />
    </FeatureGate>
  );
}
```

### Ejemplo 2: Formulario con validación de límites

```tsx
import { useCanAddResource } from '@/lib/hooks';
import { ResourceLimitAlert } from '@/components/subscription';

function CreateUserForm() {
  const canAddUser = useCanAddResource('users');

  const handleSubmit = (data) => {
    if (!canAddUser) {
      toast.error('Has alcanzado el límite de usuarios de tu plan');
      return;
    }
    // Crear usuario...
  };

  return (
    <form onSubmit={handleSubmit}>
      <ResourceLimitAlert resourceType="users" threshold={75} />

      <Input name="name" label="Nombre" />
      <Input name="email" label="Email" />

      <Button type="submit" disabled={!canAddUser}>
        {canAddUser ? 'Crear Usuario' : 'Límite alcanzado'}
      </Button>
    </form>
  );
}
```

### Ejemplo 3: Dashboard con información completa

```tsx
import { useSubscription, useResourceUsage } from '@/lib/hooks';
import { TrialBanner } from '@/components/subscription';

function SubscriptionDashboard() {
  const {
    subscription,
    isInTrial,
    trialDaysRemaining
  } = useSubscription();

  const {
    users,
    products,
    branches,
    warehouses
  } = useResourceUsage();

  return (
    <div>
      <TrialBanner />

      <h1>Plan {subscription?.plan.name}</h1>

      <div className="grid grid-cols-2 gap-4">
        <ResourceCard
          title="Usuarios"
          current={users.current}
          max={users.max}
          percentage={users.percentage}
        />
        <ResourceCard
          title="Productos"
          current={products.current}
          max={products.max}
          percentage={products.percentage}
        />
        <ResourceCard
          title="Sucursales"
          current={branches.current}
          max={branches.max}
          percentage={branches.percentage}
        />
        <ResourceCard
          title="Almacenes"
          current={warehouses.current}
          max={warehouses.max}
          percentage={warehouses.percentage}
        />
      </div>
    </div>
  );
}
```

## 🎯 Códigos de Features Disponibles

```typescript
// POS e Inventario
'hasPOS'
'hasInventory'
'hasBatchTracking'

// Multi-ubicación
'hasMultiBranch'
'hasMultiWarehouse'

// Compras y Ventas
'hasCreditNotes'
'hasPurchaseOrders'
'hasSuppliers'

// Contabilidad
'hasBasicAccounting'
'hasFullAccounting'
'hasCOGS'
'hasFinancialReports'
'hasAccountsPayable'

// NCF (República Dominicana)
'hasNCF'
'hasAllNCFTypes'
'hasDGIIReports'

// Reportes
'hasBasicReports'
'hasAdvancedReports'
'hasCustomReports'
'hasExport'

// Integraciones
'hasAPIAccess'
'hasWebhooks'

// Soporte
'hasEmailSupport'
'hasTraining'
'hasConsulting'
```

## 💡 Mejores Prácticas

1. **Verificar acceso antes de mostrar opciones**
   ```tsx
   const { hasAccess } = useFeatureAccess('hasMultiBranch');
   {hasAccess && <BranchSelector />}
   ```

2. **Validar límites antes de crear recursos**
   ```tsx
   const canAdd = useCanAddResource('users');
   if (!canAdd) {
     toast.error('Límite alcanzado');
     return;
   }
   ```

3. **Mostrar alertas proactivamente**
   ```tsx
   <ResourceLimitAlert resourceType="products" threshold={80} />
   ```

4. **Usar FeatureGate para secciones completas**
   ```tsx
   <FeatureGate feature="hasAPIAccess">
     <APIDocumentationPage />
   </FeatureGate>
   ```

5. **Mostrar el banner de trial en layouts principales**
   ```tsx
   <MainLayout>
     <TrialBanner />
     {children}
   </MainLayout>
   ```