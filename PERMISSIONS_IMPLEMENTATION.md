# Implementación de Validaciones de Permisos en el Frontend

## Resumen

Se han implementado validaciones de permisos en el BackOffice (BO) de Xotica para controlar el acceso a módulos y acciones según los permisos asignados a cada usuario. El sistema valida permisos VIEW, CREATE, UPDATE y DELETE para cada pantalla.

## Componentes Creados

### 1. Hook `usePermissions`
**Ubicación:** `/src/lib/hooks/usePermissions.ts`

Hook personalizado para verificar permisos en componentes de React.

```typescript
const { canView, canCreate, canUpdate, canDelete } = usePermissions('SCREEN_CODE');
```

### 2. Componente `ProtectedPage`
**Ubicación:** `/src/components/ProtectedPage.tsx`

Wrapper para proteger páginas completas que requieren permisos específicos.

```tsx
<ProtectedPage screenCode="SCREEN_CODE" requiredPermission="VIEW">
  {/* Contenido de la página */}
</ProtectedPage>
```

### 3. Servicio `PermissionService`
**Ubicación:** `/src/lib/services/permissionService.ts` (ya existía)

Servicio que maneja la lógica de permisos del usuario almacenados en localStorage.

## Códigos de Pantalla (screenCodes)

Los códigos de pantalla deben coincidir exactamente con los definidos en el backend:

| Módulo | screenCode | Permisos Disponibles |
|--------|-----------|---------------------|
| Dashboard | `DASHBOARD` | VIEW |
| Usuarios | `USERS` | VIEW, CREATE, UPDATE, DELETE, EXPORT |
| Roles | `ROLES` | VIEW, CREATE, UPDATE, DELETE |
| Punto de Venta | `POS` | VIEW, EXECUTE_SALES |
| Facturas | `INVOICE` | VIEW, PRINT, EXPORT |
| Notas de Crédito | `CREDIT_NOTE` | VIEW, CREATE_CREDIT_NOTE, EXPORT |
| Clientes | `CUSTOMERS` | VIEW, CREATE, UPDATE, DELETE, EXPORT, IMPORT |
| Productos | `PRODUCTS` | VIEW, CREATE, UPDATE, DELETE, EXPORT, IMPORT |
| Categorías | `PRODUCT_CATEGORY` | VIEW, CREATE, UPDATE, DELETE |
| Inventario | `INVENTORY` | VIEW, UPDATE |
| Almacenes | `WAREHOUSE` | VIEW, CREATE, UPDATE, DELETE |
| Sucursales | `BRANCH` | VIEW, CREATE, UPDATE, DELETE |
| Movimientos | `MOVEMENTS` | VIEW, CREATE_MOVEMENT, EXPORT |
| Plan de Cuentas | `CHART_OF_ACCOUNTS` | VIEW, CREATE, UPDATE, DELETE, EXPORT |
| Asientos Contables | `JOURNAL_ENTRIES` | VIEW, CREATE, UPDATE, DELETE, POST, VOID, EXPORT |
| Reportes Financieros | `FINANCIAL_REPORTS` | VIEW, GENERATE_REPORT, EXPORT |
| NCF | `NCF` | VIEW, CREATE_SEQUENCE, UPDATE_SEQUENCE, EXPORT |
| DGII | `DGII` | VIEW, EXPORT |
| Reportes | `REPORTS` | VIEW, EXPORT |
| Configuración | `TENANT` | VIEW, UPDATE, CONFIGURE |

## Patrón de Implementación

### Paso 1: Importar las dependencias

```typescript
import ProtectedPage from '@/components/ProtectedPage';
import { usePermissions } from '@/lib/hooks/usePermissions';
```

### Paso 2: Usar el hook en el componente

```typescript
export default function MyPage() {
  const { canCreate, canUpdate, canDelete } = usePermissions('SCREEN_CODE');
  // ... resto del código
}
```

### Paso 3: Envolver el contenido con ProtectedPage

```tsx
return (
  <ProtectedPage screenCode="SCREEN_CODE" requiredPermission="VIEW">
    <div className="container">
      {/* Contenido de la página */}
    </div>
  </ProtectedPage>
);
```

### Paso 4: Condicionar botones de acción

```tsx
{/* Botón Crear */}
{canCreate && (
  <Link href="/ruta/create">
    <Button>
      <PlusIcon className="mr-2 h-4 w-4" />
      Nuevo
    </Button>
  </Link>
)}

{/* Botón Editar */}
{canUpdate && (
  <Link href={`/ruta/edit/${id}`}>
    <Button variant="ghost" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  </Link>
)}

{/* Botón Eliminar */}
{canDelete && (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleDelete(id)}
  >
    <Trash2 className="h-4 w-4 text-red-600" />
  </Button>
)}
```

## Páginas Ya Implementadas

✅ **Completamente implementadas con protecciones (VIEW + CREATE/UPDATE/DELETE):**
- [/customers/page.tsx](src/app/(dashboard)/customers/page.tsx) - CUSTOMERS
- [/roles/page.tsx](src/app/(dashboard)/roles/page.tsx) - ROLES
- [/users/page.tsx](src/app/(dashboard)/users/page.tsx) - USERS
- [/inventory/products/page.tsx](src/app/(dashboard)/inventory/products/page.tsx) - PRODUCTS

✅ **Implementadas con protección VIEW:**
- [/pos/page.tsx](src/app/(dashboard)/pos/page.tsx) - POS
- [/invoices/page.tsx](src/app/(dashboard)/invoices/page.tsx) - INVOICE

✅ **Navbar actualizado:**
- [/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx) - Ya filtra menús según permisos

## Páginas Pendientes de Implementación

Las siguientes páginas principales necesitan aplicar el patrón de protección:

### Alta Prioridad
- `/credit-notes/page.tsx` - CREDIT_NOTE

### Media Prioridad
- `/inventory/categories/page.tsx` - PRODUCT_CATEGORY
- `/inventory/warehouses/page.tsx` - WAREHOUSE
- `/inventory/branches/page.tsx` - BRANCH
- `/inventory/movements/page.tsx` - MOVEMENTS
- `/inventory/items/page.tsx` - INVENTORY
- `/inventory/reports/page.tsx` - INVENTORY_REPORT

### Contabilidad
- `/accounting/page.tsx` - FINANCIAL_REPORTS
- `/accounting/accounts/page.tsx` - CHART_OF_ACCOUNTS
- `/accounting/journal-entries/page.tsx` - JOURNAL_ENTRIES
- `/accounting/reports/balance-sheet/page.tsx` - FINANCIAL_REPORTS
- `/accounting/reports/income-statement/page.tsx` - FINANCIAL_REPORTS

### Reportes y NCF
- `/reports/page.tsx` - REPORTS
- `/ncf/sequences/page.tsx` - NCF
- `/ncf/reports/page.tsx` - DGII
- `/ncf/config/page.tsx` - NCF

### Configuración
- `/settings/page.tsx` - TENANT
- `/dashboard/page.tsx` - DASHBOARD

## Páginas de Detalle y Edición

Las páginas de detalle (`[id]/page.tsx`) y edición (`edit/[id]/page.tsx`) también deben protegerse:

```tsx
// Para páginas de detalle - requiere VIEW
<ProtectedPage screenCode="SCREEN_CODE" requiredPermission="VIEW">

// Para páginas de edición - requiere UPDATE
<ProtectedPage screenCode="SCREEN_CODE" requiredPermission="UPDATE">

// Para páginas de creación - requiere CREATE
<ProtectedPage screenCode="SCREEN_CODE" requiredPermission="CREATE">
```

## Ejemplo Completo

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import ProtectedPage from '@/components/ProtectedPage';
import { usePermissions } from '@/lib/hooks/usePermissions';
import Link from 'next/link';

export default function ExamplePage() {
  const { canCreate, canUpdate, canDelete } = usePermissions('EXAMPLE');
  const [items, setItems] = useState([]);

  // ... lógica del componente

  return (
    <ProtectedPage screenCode="EXAMPLE" requiredPermission="VIEW">
      <div className="p-6">
        {/* Header con botón crear */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Título</h1>
          {canCreate && (
            <Link href="/example/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo
              </Button>
            </Link>
          )}
        </div>

        {/* Tabla con acciones */}
        <table>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <div className="flex space-x-2">
                    <Link href={`/example/${item.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {canUpdate && (
                      <Link href={`/example/edit/${item.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedPage>
  );
}
```

## Notas Importantes

1. **Siempre usar el screenCode correcto**: Los códigos deben coincidir exactamente con los definidos en el backend (ver tabla arriba).

2. **Permisos VIEW obligatorios**: Todas las páginas principales deben validar el permiso VIEW como mínimo.

3. **No remover el botón Ver**: El botón de ver detalles (Eye icon) generalmente no requiere validación adicional ya que la página ya valida VIEW.

4. **Consistencia en el UI**: Cuando un usuario no tiene un permiso, el botón simplemente no se muestra (no se deshabilita).

5. **Páginas de creación/edición**: Las páginas de formularios (`create` y `edit`) deben protegerse con los permisos CREATE y UPDATE respectivamente.

6. **Testing**: Después de implementar, probar con usuarios de diferentes roles para verificar que las validaciones funcionan correctamente.

## Flujo de Autenticación

1. Al hacer login, el backend retorna los permisos del usuario
2. Los permisos se almacenan en `localStorage` bajo la key `user_permissions`
3. `PermissionService` lee los permisos de `localStorage`
4. `usePermissions` hook usa `PermissionService` para verificar permisos
5. `ProtectedPage` component usa `PermissionService` para proteger páginas

## Comandos Útiles

```bash
# Buscar todas las páginas principales del dashboard
find src/app/\(dashboard\) -name "page.tsx" -type f | grep -v "\[id\]" | grep -v "edit" | grep -v "create"

# Buscar páginas que aún no tienen ProtectedPage
grep -L "ProtectedPage" src/app/\(dashboard\)/*/page.tsx

# Verificar páginas con botones de crear sin validación
grep -n "Nuevo\|Create\|PlusIcon" src/app/\(dashboard\)/*/page.tsx
```

## Próximos Pasos

1. ✅ Implementar hook `usePermissions`
2. ✅ Implementar componente `ProtectedPage`
3. ✅ Actualizar `Navbar` con screenCodes correctos
4. ✅ Implementar protecciones en Customers, Roles, Users (completas con CREATE/UPDATE/DELETE)
5. ✅ Implementar protecciones en POS, Invoices, Products (completadas)
6. ⏳ Implementar protecciones en las páginas restantes siguiendo el patrón
7. ⏳ Probar con diferentes roles y permisos
8. ⏳ Documentar cualquier caso especial o excepciones

---

**Fecha de creación:** 2025-01-13
**Última actualización:** 2025-01-13
