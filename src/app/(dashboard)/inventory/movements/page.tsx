'use client';

import { useState, useEffect, useMemo } from 'react';
import { InventoryMovement, VariantInventoryMovement, MovementType, Product, Warehouse } from '@/lib/types/inventory';
import { InventoryService, ProductService, WarehouseService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/ui/export-button';
import { ArrowUpDown, ChevronLeft, ChevronRight, EyeIcon, FilterIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';

// Type guard to check if movement is variant-based
function isVariantMovement(movement: InventoryMovement | VariantInventoryMovement): movement is VariantInventoryMovement {
  return 'variantId' in movement && movement.variantId !== undefined;
}

export default function MovementsPage() {
  const [movements, setMovements] = useState<(InventoryMovement | VariantInventoryMovement)[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('all_products');
  const [selectedType, setSelectedType] = useState<string>('all_types');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Sorting state
  const [sortField, setSortField] = useState<'createdAt' | 'type' | 'quantity'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load all necessary data in parallel
        const [movementsData, productsData, warehousesData] = await Promise.all([
          InventoryService.getMovements(),
          ProductService.getProducts(),
          WarehouseService.getWarehouses()
        ]);

        setMovements(movementsData);
        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (error) {
        console.error('Error loading movements data:', error);
        toast.error('Error al cargar los datos de movimientos');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleExport = async (format: 'pdf' | 'excel', exportStartDate?: string, exportEndDate?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({ format });

      if (exportStartDate) params.append('startDate', exportStartDate);
      if (exportEndDate) params.append('endDate', exportEndDate);
      if (selectedType !== 'all_types') params.append('type', selectedType);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/movements/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `movimientos-inventario-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Movimientos exportados a ${format.toUpperCase()} exitosamente`);
    } catch (error: any) {
      toast.error('Error al exportar', { description: error.message });
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const productId = selectedProductId && selectedProductId !== 'all_products' ? parseInt(selectedProductId, 10) : undefined;
      const type = selectedType !== 'all_types' ? selectedType as MovementType : undefined;
      const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
      const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

      const filteredMovements = await InventoryService.getMovements(
        productId,
        type,
        formattedStartDate,
        formattedEndDate
      );

      setMovements(filteredMovements);
      toast.success('Filtros aplicados correctamente');
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error('Error al aplicar los filtros');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    setSelectedProductId('all_products');
    setSelectedType('all_types');
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchTerm('');

    try {
      setLoading(true);
      const movementsData = await InventoryService.getMovements();
      setMovements(movementsData);
      toast.success('Filtros restablecidos');
    } catch (error) {
      console.error('Error resetting filters:', error);
      toast.error('Error al restablecer los filtros');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort movements
  const filteredMovements = useMemo(() => {
    return movements
      .filter(movement => {
        const searchTermLower = searchTerm.toLowerCase();

        // Get product/variant name based on movement type
        let productName = '';
        if (isVariantMovement(movement)) {
          // New variant-based movement
          productName = movement.variant?.product?.name?.toLowerCase() || '';
          const variantSku = movement.variant?.sku?.toLowerCase() || '';
          const variantName = movement.variant?.name?.toLowerCase() || '';

          const reference = movement.reference?.toLowerCase() || '';
          const notes = movement.notes?.toLowerCase() || '';

          return (
            productName.includes(searchTermLower) ||
            variantSku.includes(searchTermLower) ||
            variantName.includes(searchTermLower) ||
            reference.includes(searchTermLower) ||
            notes.includes(searchTermLower)
          );
        } else {
          // Old product-based movement
          productName = movement.product?.name?.toLowerCase() || '';
          const reference = movement.reference?.toLowerCase() || '';
          const notes = movement.notes?.toLowerCase() || '';

          return (
            productName.includes(searchTermLower) ||
            reference.includes(searchTermLower) ||
            notes.includes(searchTermLower)
          );
        }
      })
      .sort((a, b) => {
        if (sortField === 'createdAt') {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortField === 'quantity') {
          return sortDirection === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
        } else {
          // Sort by type
          const typeA = a.type.toLowerCase();
          const typeB = b.type.toLowerCase();
          return sortDirection === 'asc'
            ? typeA.localeCompare(typeB)
            : typeB.localeCompare(typeA);
        }
      });
  }, [movements, searchTerm, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const paginatedMovements = filteredMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: 'createdAt' | 'type' | 'quantity') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Helper function to get warehouse name by ID or object
  const getWarehouseName = (id?: number, warehouse?: any) => {
    if (warehouse) return warehouse.name;
    if (!id) return 'N/A';
    const found = warehouses.find(w => w.id === id);
    return found?.name || `ID: ${id}`;
  };

  // Helper function to get movement type display text
  const getMovementTypeText = (type: MovementType) => {
    const types = {
      [MovementType.ENTRADA]: 'Entrada',
      [MovementType.SALIDA]: 'Salida',
      [MovementType.AJUSTE]: 'Ajuste',
      [MovementType.TRANSFERENCIA]: 'Transferencia'
    };
    return types[type] || type;
  };

  // Helper function to get movement type badge color
  const getMovementTypeColor = (type: MovementType) => {
    switch (type) {
      case MovementType.ENTRADA:
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case MovementType.SALIDA:
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case MovementType.AJUSTE:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case MovementType.TRANSFERENCIA:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  // Helper function to get batch numbers from movement
  const getBatchNumbers = (movement: InventoryMovement | VariantInventoryMovement) => {
    if (!movement.batchMovements || movement.batchMovements.length === 0) {
      return '-';
    }
    const uniqueBatchNumbers = [...new Set(movement.batchMovements.map(bm => bm.batch.batchNumber))];
    return uniqueBatchNumbers.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Movimientos de Inventario</h1>
        <div className="flex gap-2 self-end sm:self-auto">
          <ExportButton screenCode="MOVEMENTS" onExport={handleExport} size="sm" />
          <Link href="/inventory/movements/create">
            <Button size="sm" className="bg-primary hover:bg-primary-600">
              <PlusIcon className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Nuevo Movimiento</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar movimientos..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por producto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_products">Todos los productos</SelectItem>
            {products.map(product => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_types">Todos los tipos</SelectItem>
            <SelectItem value={MovementType.ENTRADA}>Entrada</SelectItem>
            <SelectItem value={MovementType.SALIDA}>Salida</SelectItem>
            <SelectItem value={MovementType.AJUSTE}>Ajuste</SelectItem>
            <SelectItem value={MovementType.TRANSFERENCIA}>Transferencia</SelectItem>
          </SelectContent>
        </Select>

        <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Elementos por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 por página</SelectItem>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="25">25 por página</SelectItem>
            <SelectItem value="50">50 por página</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Desde:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-[180px] justify-start text-left font-normal text-xs sm:text-sm"
                >
                  {startDate ? format(startDate, 'PP', { locale: es }) : 'Fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Hasta:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-[180px] justify-start text-left font-normal text-xs sm:text-sm"
                >
                  {endDate ? format(endDate, 'PP', { locale: es }) : 'Fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2 sm:ml-auto">
          <Button variant="outline" size="sm" onClick={resetFilters} className="flex-1 sm:flex-none">
            <span className="text-xs sm:text-sm">Limpiar</span>
          </Button>
          <Button size="sm" onClick={applyFilters} className="flex-1 sm:flex-none bg-primary hover:bg-primary-600">
            <FilterIcon className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="text-xs sm:text-sm">Aplicar</span>
          </Button>
        </div>
      </div>

      {/* Movements table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedMovements.length > 0 ? (
            paginatedMovements.map((movement) => (
              <div key={movement.id} className="p-3 hover:bg-muted/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getMovementTypeColor(movement.type)}`}>
                        {getMovementTypeText(movement.type)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {isVariantMovement(movement) ? (
                        <>
                          {movement.variant?.product?.name || 'Producto'}
                          {movement.variant?.name && ` - ${movement.variant.name}`}
                        </>
                      ) : (
                        movement.product?.name || `Producto ID: ${movement.productId}`
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm font-semibold">Cant: {movement.quantity}</span>
                      {movement.type === MovementType.TRANSFERENCIA ? (
                        <span className="text-xs text-muted-foreground">
                          {getWarehouseName(movement.sourceWarehouseId, movement.sourceWarehouse)} → {getWarehouseName(movement.destinationWarehouseId, movement.destinationWarehouse)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {movement.type === MovementType.ENTRADA
                            ? getWarehouseName(movement.destinationWarehouseId, movement.destinationWarehouse)
                            : getWarehouseName(movement.sourceWarehouseId, movement.sourceWarehouse)}
                        </span>
                      )}
                    </div>
                    {movement.reference && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Ref: {movement.reference}
                      </div>
                    )}
                  </div>
                  <Link href={`/inventory/movements/${movement.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No se encontraron movimientos
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Fecha
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Tipo
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Producto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center">
                    Cantidad
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Origen/Destino
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Lote
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Referencia
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedMovements.length > 0 ? (
                paginatedMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(movement.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(movement.type)}`}>
                        {getMovementTypeText(movement.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isVariantMovement(movement) ? (
                        <>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {movement.variant?.product?.name || 'Producto'}
                            {movement.variant?.name && ` - ${movement.variant.name}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            SKU: {movement.variant?.sku || 'N/A'}
                            {movement.variant?.attributeValues && movement.variant.attributeValues.length > 0 && (
                              <span className="ml-2">
                                ({movement.variant.attributeValues
                                  .map(av => av.attributeValue?.displayName)
                                  .filter(Boolean)
                                  .join(', ')})
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {movement.product?.name || `Producto ID: ${movement.productId}`}
                          </div>
                          <div className="text-xs text-gray-500">{movement.product?.code || ''}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {movement.type === MovementType.TRANSFERENCIA ? (
                        <>
                          <div>De: {getWarehouseName(movement.sourceWarehouseId, movement.sourceWarehouse)}</div>
                          <div>A: {getWarehouseName(movement.destinationWarehouseId, movement.destinationWarehouse)}</div>
                        </>
                      ) : movement.type === MovementType.ENTRADA ? (
                        getWarehouseName(movement.destinationWarehouseId, movement.destinationWarehouse)
                      ) : (
                        getWarehouseName(movement.sourceWarehouseId, movement.sourceWarehouse)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {getBatchNumbers(movement)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div>{movement.reference || '-'}</div>
                      {movement.notes && (
                        <div className="text-xs italic mt-1">{movement.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1"
                          asChild
                        >
                          <Link href={`/inventory/movements/${movement.id}`}>
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No se encontraron movimientos con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          Mostrando {filteredMovements.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredMovements.length)} de {filteredMovements.length} movimientos
        </div>
        <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Mobile: Show current/total */}
          <span className="sm:hidden text-sm px-2">
            {currentPage} / {totalPages || 1}
          </span>

          {/* Desktop: Show page buttons */}
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}