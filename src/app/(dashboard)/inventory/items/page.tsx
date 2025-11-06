'use client';

import { useState, useEffect, useMemo } from 'react';
import { InventoryItem } from '@/lib/types/inventory';
import { InventoryService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, SearchIcon, ArrowUpDown, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function InventoryItemsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'product.name' | 'warehouse.name' | 'quantity' | 'createdAt'>('product.name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function loadData() {
      try {
        const itemsData = await InventoryService.getItems();
        console.log('Inventory items received from backend:', itemsData);
        setItems(itemsData);
      } catch (error) {
        console.error('Error loading inventory items data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const confirmDelete = (itemId: number) => {
    setItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      await InventoryService.deleteItem(itemToDelete);
      setItems(items.filter(item => item.id !== itemToDelete));
      console.log('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    } finally {
      setItemToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          (item.product?.name?.toLowerCase().includes(searchTermLower) || false) ||
          (item.warehouse?.name?.toLowerCase().includes(searchTermLower) || false)
        );
      })
      .sort((a, b) => {
        let fieldA: string | number | Date;
        let fieldB: string | number | Date;

        if (sortField === 'product.name') {
          fieldA = a.product?.name?.toLowerCase() || '';
          fieldB = b.product?.name?.toLowerCase() || '';
        } else if (sortField === 'warehouse.name') {
          fieldA = a.warehouse?.name?.toLowerCase() || '';
          fieldB = b.warehouse?.name?.toLowerCase() || '';
        } else if (sortField === 'quantity') {
          fieldA = a.quantity || 0;
          fieldB = b.quantity || 0;
        } else { // createdAt
          fieldA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          fieldB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        }

        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [items, searchTerm, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: 'product.name' | 'warehouse.name' | 'quantity' | 'createdAt') => {
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
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
        <Link href="/inventory/items/create">
          <Button className="bg-primary hover:bg-primary-600">
            <PlusIcon className="mr-2 h-4 w-4" />
            Nuevo Item
          </Button>
        </Link>
      </div>

      {/* Search and filter controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por producto o almacén..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={sortField} onValueChange={(value: string) => setSortField(value as 'product.name' | 'warehouse.name' | 'quantity' | 'createdAt')}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="product.name">Nombre del Producto</SelectItem>
            <SelectItem value="warehouse.name">Almacén</SelectItem>
            <SelectItem value="quantity">Cantidad</SelectItem>
            <SelectItem value="createdAt">Fecha de Creación</SelectItem>
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

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Imagen
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('product.name')}
                >
                  <div className="flex items-center">
                    Producto
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('warehouse.name')}
                >
                  <div className="flex items-center">
                    Almacén
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
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
                  Stock Mínimo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center">
                    Fecha de Creación
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
                const primaryImage = item.product?.images?.find(img => img.isPrimary) || item.product?.images?.[0];

                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={item.product?.name || 'Producto'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.product?.code || 'Sin código'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.warehouse?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.quantity <= item.minStock ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'}`}>
                      {item.quantity} unidades
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.minStock} unidades
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/inventory/items/${item.id}`}>
                        <Button variant="outline" size="sm" className="px-2 py-1">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/inventory/items/edit/${item.id}`}>
                        <Button variant="outline" size="sm" className="px-2 py-1">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                        onClick={() => confirmDelete(item.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} de {filteredItems.length} items
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente este item de inventario y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
