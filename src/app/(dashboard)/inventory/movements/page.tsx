'use client';

import { useState, useEffect, useMemo } from 'react';
import { InventoryMovement, MovementType, Product, Warehouse } from '@/lib/types/inventory';
import { InventoryService, ProductService, WarehouseService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
import { toast } from 'react-hot-toast';

export default function MovementsPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
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
        const productName = movement.product?.name?.toLowerCase() || '';
        const reference = movement.reference?.toLowerCase() || '';
        const notes = movement.notes?.toLowerCase() || '';

        return (
          productName.includes(searchTermLower) ||
          reference.includes(searchTermLower) ||
          notes.includes(searchTermLower)
        );
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

  // Helper function to get warehouse name by ID
  const getWarehouseName = (id?: number) => {
    if (!id) return 'N/A';
    const warehouse = warehouses.find(w => w.id === id);
    return warehouse?.name || `ID: ${id}`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
        <Link href="/inventory/movements/create">
          <Button className="bg-primary hover:bg-primary-600">
            <PlusIcon className="mr-2 h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </Link>
      </div>

      {/* Search and filter controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Desde:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal"
              >
                {startDate ? format(startDate, 'PP', { locale: es }) : 'Seleccionar fecha'}
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

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Hasta:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal"
              >
                {endDate ? format(endDate, 'PP', { locale: es }) : 'Seleccionar fecha'}
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

        <div className="flex space-x-2 ml-auto">
          <Button variant="outline" onClick={resetFilters}>
            Limpiar Filtros
          </Button>
          <Button onClick={applyFilters} className="bg-primary hover:bg-primary-600">
            <FilterIcon className="mr-2 h-4 w-4" />
            Aplicar Filtros
          </Button>
        </div>
      </div>

      {/* Movements table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
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
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {movement.product?.name || `Producto ID: ${movement.productId}`}
                      </div>
                      <div className="text-xs text-gray-500">{movement.product?.code || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {movement.type === MovementType.TRANSFERENCIA ? (
                        <>
                          <div>De: {getWarehouseName(movement.sourceWarehouseId)}</div>
                          <div>A: {getWarehouseName(movement.destinationWarehouseId)}</div>
                        </>
                      ) : movement.type === MovementType.ENTRADA ? (
                        getWarehouseName(movement.destinationWarehouseId)
                      ) : (
                        getWarehouseName(movement.sourceWarehouseId)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div>{movement.reference || '-'}</div>
                      {movement.notes && (
                        <div className="text-xs italic mt-1">{movement.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/inventory/movements/${movement.id}`}>
                          <Button variant="outline" size="sm" className="px-2 py-1">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No se encontraron movimientos con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {filteredMovements.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredMovements.length)} de {filteredMovements.length} movimientos
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
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

          <Button
            variant="outline"
            size="sm"
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