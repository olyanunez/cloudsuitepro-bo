'use client';

import { useState, useEffect } from 'react';
import { InventoryMovement, MovementType, Product } from '@/lib/types/inventory';
import { InventoryService, ProductService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon, EyeIcon, FilterIcon, CalendarIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function MovementsPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Sorting and pagination
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Default newest first
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load movements and products in parallel
      const [movementsData, productsData] = await Promise.all([
        InventoryService.getMovements(),
        ProductService.getProducts()
      ]);
      
      setMovements(movementsData);
      setFilteredMovements(movementsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Apply all filters to the original movements data
    let result = [...movements];

    // Filter by product
    if (productFilter !== 'all') {
      const productId = parseInt(productFilter, 10);
      result = result.filter(movement => movement.productId === productId);
    }

    // Filter by movement type
    if (typeFilter !== 'all') {
      result = result.filter(movement => movement.type === typeFilter);
    }

    // Filter by date range
    if (startDate) {
      const startDateTime = new Date(startDate).setHours(0, 0, 0, 0);
      result = result.filter(movement => {
        const movementDate = new Date(movement.createdAt).getTime();
        return movementDate >= startDateTime;
      });
    }

    if (endDate) {
      const endDateTime = new Date(endDate).setHours(23, 59, 59, 999);
      result = result.filter(movement => {
        const movementDate = new Date(movement.createdAt).getTime();
        return movementDate <= endDateTime;
      });
    }

    // Filter by search term (reference or notes)
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        movement =>
          (movement.reference && movement.reference.toLowerCase().includes(lowerCaseSearch)) ||
          (movement.notes && movement.notes.toLowerCase().includes(lowerCaseSearch)) ||
          (movement.product?.name && movement.product.name.toLowerCase().includes(lowerCaseSearch))
      );
    }

    // Sort movements
    result.sort((a, b) => {
      let aValue: any = a[sortField as keyof InventoryMovement];
      let bValue: any = b[sortField as keyof InventoryMovement];

      // Handle nested properties
      if (sortField === 'product') {
        aValue = a.product?.name || '';
        bValue = b.product?.name || '';
      }

      if (aValue === bValue) return 0;

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMovements(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  useEffect(() => {
    applyFilters();
  }, [movements, searchTerm, productFilter, typeFilter, startDate, endDate, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending for new sort field
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setProductFilter('all');
    setTypeFilter('all');
    setStartDate('');
    setEndDate('');
  };

  // Get movement type label
  const getMovementTypeLabel = (type: MovementType): string => {
    switch (type) {
      case 'ENTRY': return 'Entrada';
      case 'EXIT': return 'Salida';
      case 'ADJUSTMENT': return 'Ajuste';
      case 'TRANSFER': return 'Transferencia';
      default: return type;
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovements = filteredMovements.slice(startIndex, endIndex);

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

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por referencia o notas..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por producto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los productos</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="ENTRY">Entrada</SelectItem>
                <SelectItem value="EXIT">Salida</SelectItem>
                <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                <SelectItem value="TRANSFER">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="date"
              placeholder="Fecha inicio"
              className="pl-10"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="date"
              placeholder="Fecha fin"
              className="pl-10"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end mb-6">
          <Button variant="outline" onClick={resetFilters} className="flex items-center">
            <FilterIcon className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : currentMovements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No se encontraron movimientos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('reference')}
                  >
                    Referencia
                    {sortField === 'reference' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('product')}
                  >
                    Producto
                    {sortField === 'product' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    Tipo
                    {sortField === 'type' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-right"
                    onClick={() => handleSort('quantity')}
                  >
                    Cantidad
                    {sortField === 'quantity' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    Fecha
                    {sortField === 'createdAt' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-medium">{movement.reference || '-'}</TableCell>
                    <TableCell>{movement.product?.name || 'Producto desconocido'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          movement.type === 'ENTRY' ? 'bg-green-100 text-green-800' :
                          movement.type === 'EXIT' ? 'bg-red-100 text-red-800' :
                          movement.type === 'ADJUSTMENT' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {getMovementTypeLabel(movement.type)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={movement.type === 'ENTRY' || movement.type === 'ADJUSTMENT' && movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                        {movement.type === 'ENTRY' || (movement.type === 'ADJUSTMENT' && movement.quantity > 0) ? '+' : ''}
                        {movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      {movement.createdAt ? format(new Date(movement.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/inventory/movements/${movement.id}`}>
                          <Button variant="ghost" size="icon" title="Ver detalles">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Filas por página:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
