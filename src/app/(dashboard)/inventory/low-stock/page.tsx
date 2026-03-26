'use client';

import { useState, useEffect, useMemo } from 'react';
import LowStockService, { LowStockItem } from '@/lib/services/lowStockService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchIcon, ArrowUpDown, ChevronLeft, ChevronRight, PackageIcon, AlertTriangle, EyeIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function LowStockPage() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'productName' | 'productCode' | 'warehouseName' | 'quantity' | 'deficit'>('deficit');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function loadData() {
      try {
        const report = await LowStockService.getLowStockItems();
        setLowStockItems(report.items);
      } catch (error) {
        console.error('Error loading low stock items:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return lowStockItems
      .filter(item => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          item.productName.toLowerCase().includes(searchTermLower) ||
          item.productCode.toLowerCase().includes(searchTermLower) ||
          item.warehouseName.toLowerCase().includes(searchTermLower)
        );
      })
      .sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];

        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
          const compareA = fieldA.toLowerCase();
          const compareB = fieldB.toLowerCase();
          if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
          if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
        } else {
          if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
          if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
  }, [lowStockItems, searchTerm, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: 'productName' | 'productCode' | 'warehouseName' | 'quantity' | 'deficit') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Productos con Stock Bajo</h1>
        </div>
        <Link href="/inventory/products" className="self-end sm:self-auto">
          <Button variant="outline" size="sm">
            <PackageIcon className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="text-xs sm:text-sm">Ver Productos</span>
          </Button>
        </Link>
      </div>

      {/* Info banner */}
      {lowStockItems.length > 0 && (
        <div className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-orange-900 dark:text-orange-100">
                {lowStockItems.length} {lowStockItems.length === 1 ? 'producto requiere' : 'productos requieren'} atención
              </h3>
              <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-200 mt-1">
                Los siguientes productos tienen stock igual o menor al stock mínimo configurado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={sortField} onValueChange={(value: string) => setSortField(value as typeof sortField)}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deficit">Déficit</SelectItem>
            <SelectItem value="productName">Nombre del Producto</SelectItem>
            <SelectItem value="productCode">Código</SelectItem>
            <SelectItem value="warehouseName">Almacén</SelectItem>
            <SelectItem value="quantity">Cantidad Actual</SelectItem>
          </SelectContent>
        </Select>

        <Select value={itemsPerPage.toString()} onValueChange={(value: string) => setItemsPerPage(Number(value))}>
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

      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 sm:p-12">
          <div className="text-center">
            <PackageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos con stock bajo'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Todos los productos tienen stock suficiente'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedItems.map((item) => {
                const severityPercentage = (item.deficit / item.minStock) * 100;
                const isUrgent = severityPercentage >= 50;
                const isCritical = item.quantity === 0;

                return (
                  <div key={item.id} className={`p-3 hover:bg-muted/50 ${isCritical ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isCritical && (
                            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                          <span className="font-medium text-sm">{item.productName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.productCode} • {item.warehouseName}
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-sm font-semibold ${isCritical ? 'text-red-600 dark:text-red-400' : ''}`}>
                            Stock: {item.quantity}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Mín: {item.minStock}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            isCritical
                              ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              : isUrgent
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          }`}>
                            -{item.deficit}
                          </span>
                        </div>
                      </div>
                      <Link href={`/inventory/items/${item.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('productCode')}
                    >
                      <div className="flex items-center">
                        Código
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('productName')}
                    >
                      <div className="flex items-center">
                        Producto
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('warehouseName')}
                    >
                      <div className="flex items-center">
                        Almacén
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('quantity')}
                    >
                      <div className="flex items-center justify-center">
                        Stock Actual
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Stock Mínimo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('deficit')}
                    >
                      <div className="flex items-center justify-center">
                        Déficit
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedItems.map((item) => {
                    const severityPercentage = (item.deficit / item.minStock) * 100;
                    const isUrgent = severityPercentage >= 50;
                    const isCritical = item.quantity === 0;

                    return (
                      <tr key={item.id} className={isCritical ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.productCode}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {isCritical && (
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                            )}
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.productName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {item.warehouseName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-sm font-semibold ${
                            isCritical
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-300">
                          {item.minStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isCritical
                              ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              : isUrgent
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          }`}>
                            -{item.deficit}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/inventory/items/${item.id}`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} de {filteredItems.length} productos
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
        </>
      )}
    </div>
  );
}
