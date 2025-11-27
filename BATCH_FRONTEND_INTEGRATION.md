# Integración Frontend - Sistema de Gestión de Lotes

## 📁 Archivos Creados

### 1. Tipos TypeScript
**Ubicación**: `src/lib/types/batch.ts`

```typescript
// Tipos principales
- BatchStatus (enum)
- BatchSelectionPolicy (enum)
- Batch (interface)
- BatchMovement (interface)
- CreateBatchDto (interface)
- UpdateBatchDto (interface)
- BatchExitDto (interface)
- FilterBatchDto (interface)
- ExpiringBatch (interface)
- PaginatedBatchResponse (interface)
```

### 2. Servicio API
**Ubicación**: `src/lib/services/batchService.ts`

**Métodos disponibles**:
```typescript
export const BatchService = {
  // CRUD básico
  getAll(filters?: FilterBatchDto): Promise<PaginatedBatchResponse>
  getById(id: number): Promise<Batch>
  create(data: CreateBatchDto): Promise<Batch>
  update(id: number, data: UpdateBatchDto): Promise<Batch>
  delete(id: number): Promise<void>

  // Operaciones de lotes
  createExit(data: BatchExitDto): Promise<BatchExitResult>
  getExpiringBatches(days: number): Promise<ExpiringBatch[]>
  getAvailableBatches(productId, warehouseId): Promise<Batch[]>
  getMovements(batchId: number): Promise<any>
  getStats(): Promise<any>
}
```

---

## 🎨 Componentes a Implementar

### Componentes Creados

**Directorio**: `src/components/batches/`

Estos son los componentes base que deberás implementar según tus necesidades:

### 1. **BatchList** - Lista de Lotes
```tsx
// src/components/batches/BatchList.tsx
import { useState, useEffect } from 'react';
import { BatchService } from '@/lib/services/batchService';
import { Batch, FilterBatchDto } from '@/lib/types/batch';

export function BatchList({ warehouseId, productId }: Props) {
  // Implementar tabla con:
  // - Número de lote
  // - Producto
  // - Almacén
  // - Cantidad actual/inicial
  // - Fecha de vencimiento
  // - Estado
  // - Acciones (ver detalle, editar, eliminar)
}
```

### 2. **BatchDetail** - Detalle de Lote
```tsx
// src/components/batches/BatchDetail.tsx
export function BatchDetail({ batchId }: { batchId: number }) {
  // Mostrar:
  // - Información completa del lote
  // - Historial de movimientos
  // - Gráfico de evolución de cantidad
  // - Alertas de vencimiento
}
```

### 3. **ExpirationAlert** - Dashboard de Alertas
```tsx
// src/components/batches/ExpirationAlert.tsx
export function ExpirationAlert({ days = 30 }: Props) {
  const [expiring, setExpiring] = useState<ExpiringBatch[]>([]);

  useEffect(() => {
    BatchService.getExpiringBatches(days).then(setExpiring);
  }, [days]);

  // Mostrar alertas con:
  // - Badge de urgencia (rojo < 7 días, amarillo < 30 días)
  // - Producto y lote
  // - Días hasta vencimiento
  // - Pérdida estimada
  // - Acción rápida (promoción, descuento)
}
```

### 4. **BatchSelector** - Selector de Lotes (para POS/Salidas)
```tsx
// src/components/batches/BatchSelector.tsx
export function BatchSelector({
  productId,
  warehouseId,
  quantity,
  onSelect
}: Props) {
  // Mostrar lotes disponibles para selección manual
  // o usar política automática (FIFO/FEFO/LIFO)
}
```

### 5. **CreateBatchForm** - Formulario de Creación
```tsx
// src/components/batches/CreateBatchForm.tsx
export function CreateBatchForm({ onSuccess }: Props) {
  // Formulario para crear nuevo lote con:
  // - Producto (select)
  // - Almacén (select)
  // - Cantidad
  // - Costo unitario
  // - Fecha de vencimiento (date picker)
  // - Fecha de fabricación (opcional)
  // - Proveedor (opcional)
  // - Ubicación física (opcional)
  // - Notas
}
```

### 6. **BatchCard** - Tarjeta de Lote
```tsx
// src/components/batches/BatchCard.tsx
export function BatchCard({ batch }: { batch: Batch }) {
  // Tarjeta compacta mostrando:
  // - Número de lote
  // - Producto
  // - Cantidad disponible
  // - Indicador de vencimiento
  // - Badge de estado
}
```

---

## 🔗 Integración en Módulos Existentes

### 1. Dashboard Principal
**Archivo**: `src/app/(dashboard)/page.tsx`

```tsx
import { ExpirationAlert } from '@/components/batches/ExpirationAlert';

export default function DashboardPage() {
  return (
    <div>
      {/* Widgets existentes */}

      {/* NUEVO: Widget de alertas de vencimiento */}
      <ExpirationAlert days={30} />
    </div>
  );
}
```

### 2. Módulo de Inventario
**Archivo**: `src/app/(dashboard)/inventory/page.tsx`

```tsx
import { BatchList } from '@/components/batches/BatchList';

export default function InventoryPage() {
  return (
    <Tabs>
      <TabsList>
        <TabsTrigger value="products">Productos</TabsTrigger>
        <TabsTrigger value="batches">Lotes</TabsTrigger> {/* NUEVO */}
      </TabsList>

      <TabsContent value="batches">
        <BatchList />
      </TabsContent>
    </Tabs>
  );
}
```

### 3. Entrada de Mercancía
**Archivo**: `src/app/(dashboard)/inventory/entry/page.tsx`

```tsx
import { CreateBatchForm } from '@/components/batches/CreateBatchForm';

export default function InventoryEntryPage() {
  return (
    <div>
      <h1>Entrada de Mercancía</h1>
      <CreateBatchForm onSuccess={handleSuccess} />
    </div>
  );
}
```

### 4. POS (Punto de Venta)
**Archivo**: `src/components/pos/ProductSearch.tsx` (o similar)

```tsx
import { BatchSelector } from '@/components/batches/BatchSelector';

// Al agregar producto al carrito:
function handleAddToCart(product: Product, quantity: number) {
  if (product.isStockable) {
    // Mostrar selector de lotes si el producto es stock able
    return (
      <BatchSelector
        productId={product.id}
        warehouseId={currentWarehouse.id}
        quantity={quantity}
        onSelect={handleBatchSelection}
      />
    );
  }
}
```

---

## 📊 Rutas Nuevas a Crear

```
/dashboard/
├── inventory/
│   ├── batches                    # Lista de todos los lotes
│   ├── batches/[id]               # Detalle de lote específico
│   ├── batches/expiring           # Dashboard de vencimientos
│   ├── batches/new                # Crear nuevo lote
│   └── batches/[id]/edit          # Editar lote
```

### Ejemplo de ruta de lista:
**Archivo**: `src/app/(dashboard)/inventory/batches/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { BatchService } from '@/lib/services/batchService';
import { BatchList } from '@/components/batches/BatchList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BatchesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Lotes</h1>
        <Link href="/dashboard/inventory/batches/new">
          <Button>Nuevo Lote</Button>
        </Link>
      </div>

      <BatchList />
    </div>
  );
}
```

---

## 🎯 Funcionalidades Clave

### 1. **Trazabilidad Visual**
```tsx
// Mostrar el flujo: Lote → Factura → Nota de Crédito
<Timeline>
  <TimelineItem>
    <Badge>Entrada</Badge>
    Lote LOTE-2025-000001 creado
    <Date>2025-11-20</Date>
  </TimelineItem>
  <TimelineItem>
    <Badge>Salida</Badge>
    10 unidades vendidas en FAC-2025-123
    <Date>2025-11-21</Date>
  </TimelineItem>
  <TimelineItem>
    <Badge>Entrada</Badge>
    5 unidades devueltas en NC-00001
    <Date>2025-11-22</Date>
  </TimelineItem>
</Timeline>
```

### 2. **Indicadores Visuales**
```tsx
// Badge de estado del lote
function getBatchStatusBadge(batch: Batch) {
  const badges = {
    ACTIVE: <Badge variant="success">Activo</Badge>,
    EXPIRED: <Badge variant="destructive">Vencido</Badge>,
    BLOCKED: <Badge variant="warning">Bloqueado</Badge>,
    DEPLETED: <Badge variant="secondary">Agotado</Badge>,
  };
  return badges[batch.status];
}

// Indicador de vencimiento
function getExpirationIndicator(batch: Batch) {
  if (!batch.expirationDate) return null;

  const daysUntil = getDaysUntil(batch.expirationDate);

  if (daysUntil < 7) return <Badge variant="destructive">¡Vence en {daysUntil} días!</Badge>;
  if (daysUntil < 30) return <Badge variant="warning">Vence en {daysUntil} días</Badge>;
  return <Badge variant="secondary">Vence en {daysUntil} días</Badge>;
}
```

### 3. **Filtros Avanzados**
```tsx
<BatchFilters>
  <Select label="Almacén" value={filters.warehouseId} />
  <Select label="Producto" value={filters.productId} />
  <Select label="Estado" value={filters.status} />
  <Checkbox label="Solo con stock" checked={filters.withStock} />
  <Input label="Proveedor" value={filters.supplierName} />
  <DateRange label="Vencimiento" />
</BatchFilters>
```

---

## 🔔 Notificaciones y Alertas

### Widget de Dashboard
```tsx
// src/components/dashboard/ExpiringBatchesWidget.tsx
export function ExpiringBatchesWidget() {
  const [batches, setBatches] = useState<ExpiringBatch[]>([]);

  useEffect(() => {
    // Obtener lotes que vencen en 30 días
    BatchService.getExpiringBatches(30).then(setBatches);
  }, []);

  if (batches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Vencimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-green-600 flex items-center gap-2">
            <CheckCircle2 />
            No hay productos próximos a vencer
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="text-orange-500" />
          {batches.length} Lotes Próximos a Vencer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {batches.map(batch => (
            <li key={batch.id} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{batch.product?.name}</div>
                <div className="text-sm text-muted-foreground">
                  Lote: {batch.batchNumber}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-orange-600">
                  {batch.daysUntilExpiration} días
                </div>
                <div className="text-xs text-muted-foreground">
                  Pérdida est: ${batch.estimatedLoss.toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Link href="/dashboard/inventory/batches/expiring">
          <Button variant="outline" className="w-full">
            Ver Todos
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
```

---

## 📚 Ejemplos de Uso

### Crear Lote (Entrada de Mercancía)
```tsx
import { BatchService } from '@/lib/services/batchService';

async function handleCreateBatch(formData) {
  try {
    const batch = await BatchService.create({
      productId: formData.productId,
      warehouseId: formData.warehouseId,
      quantity: formData.quantity,
      unitCost: formData.unitCost,
      expirationDate: formData.expirationDate,
      supplierName: formData.supplierName,
      location: formData.location,
      notes: formData.notes,
    });

    toast.success(`Lote ${batch.batchNumber} creado exitosamente`);
    router.push(`/dashboard/inventory/batches/${batch.id}`);
  } catch (error) {
    toast.error('Error al crear lote');
  }
}
```

### Obtener Lotes con Filtros
```tsx
import { BatchService } from '@/lib/services/batchService';

async function loadBatches() {
  const response = await BatchService.getAll({
    page: 1,
    limit: 20,
    warehouseId: selectedWarehouse?.id,
    withStock: true,
    status: 'ACTIVE',
  });

  setBatches(response.data);
  setTotalPages(response.meta.totalPages);
}
```

### Alertas de Vencimiento
```tsx
import { BatchService } from '@/lib/services/batchService';

async function loadExpiringBatches() {
  // Lotes que vencen en los próximos 30 días
  const expiring = await BatchService.getExpiringBatches(30);

  setExpiringBatches(expiring);

  // Mostrar notificación si hay lotes críticos (< 7 días)
  const critical = expiring.filter(b => b.daysUntilExpiration < 7);
  if (critical.length > 0) {
    toast.warning(`¡${critical.length} lotes vencen en menos de 7 días!`);
  }
}
```

---

## ✅ Checklist de Implementación

### Backend (✅ Completado)
- [x] Schema Prisma actualizado
- [x] BatchesService implementado
- [x] BatchesController con 9 endpoints
- [x] Integración con POS
- [x] Integración con Notas de Crédito
- [x] Sistema de trazabilidad completo

### Frontend (📝 Por Implementar)
- [x] Tipos TypeScript creados (`batch.ts`)
- [x] Servicio API creado (`batchService.ts`)
- [ ] Componentes UI base
  - [ ] `BatchList` - Tabla de lotes
  - [ ] `BatchDetail` - Detalle de lote
  - [ ] `CreateBatchForm` - Formulario de creación
  - [ ] `BatchCard` - Tarjeta de lote
  - [ ] `ExpirationAlert` - Widget de alertas
  - [ ] `BatchSelector` - Selector para POS
- [ ] Rutas del dashboard
  - [ ] `/inventory/batches` - Lista
  - [ ] `/inventory/batches/[id]` - Detalle
  - [ ] `/inventory/batches/new` - Crear
  - [ ] `/inventory/batches/expiring` - Alertas
- [ ] Integración en POS
- [ ] Widget de dashboard
- [ ] Reportes y gráficos

---

## 🚀 Próximos Pasos Recomendados

1. **Crear componentes UI básicos** (semana 1-2)
   - BatchList con tabla paginada
   - CreateBatchForm con validación
   - ExpirationAlert para dashboard

2. **Implementar rutas del dashboard** (semana 2-3)
   - Página de lista de lotes
   - Página de detalle
   - Formulario de creación

3. **Integración con POS** (semana 3-4)
   - Mostrar información de lotes en productos
   - Selector de lotes opcional
   - Trazabilidad en facturas

4. **Dashboards y reportes** (semana 4-5)
   - Widget de vencimientos en dashboard principal
   - Reporte de rotación de lotes
   - Gráficos de valorización

---

## 📞 Soporte

- **Documentación Backend**: `docs/BATCH_SYSTEM.md`
- **Guía Rápida**: `docs/BATCH_QUICK_START.md`
- **API Swagger**: `http://localhost:3000/api/docs`

**Estado**: Sistema backend 100% funcional y listo para integración frontend! 🎉
