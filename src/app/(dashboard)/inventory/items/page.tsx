'use client';

import { useState, useEffect, useMemo } from 'react';
import { InventoryItem } from '@/lib/types/inventory';
import { InventoryService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/ui/export-button';
import { PencilIcon, TrashIcon, EyeIcon, SearchIcon, ArrowUpDown, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
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

  const handleExport = async (format: 'pdf' | 'excel', exportStartDate?: string, exportEndDate?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({ format });

      if (exportStartDate) params.append('startDate', exportStartDate);
      if (exportEndDate) params.append('endDate', exportEndDate);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventario-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Inventario exportado a ${format.toUpperCase()} exitosamente`);
    } catch (error: any) {
      toast.error('Error al exportar', { description: error.message });
    }
  };

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
        const itemAny = item as any;
        const variant = itemAny.variant;
        const product = variant?.product || item.product;
        const productName = product?.name || '';
        const variantSku = variant?.sku || '';
        const variantName = variant?.name || '';
        const warehouseName = item.warehouse?.name || '';

        return (
          productName.toLowerCase().includes(searchTermLower) ||
          variantSku.toLowerCase().includes(searchTermLower) ||
          variantName.toLowerCase().includes(searchTermLower) ||
          warehouseName.toLowerCase().includes(searchTermLower)
        );
      })
      .sort((a, b) => {
        let fieldA: string | number | Date;
        let fieldB: string | number | Date;

        if (sortField === 'product.name') {
          const aVariant = (a as any).variant;
          const bVariant = (b as any).variant;
          fieldA = (aVariant?.product?.name || a.product?.name || '').toLowerCase();
          fieldB = (bVariant?.product?.name || b.product?.name || '').toLowerCase();
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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Gestión de Inventario</h1>
        <ExportButton screenCode="INVENTORY" onExport={handleExport} size="sm" />
      </div>

      {/* Search and filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por producto, SKU, variante o almacén..."
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
        {/* Mobile Card View */}
        <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedItems.map((item) => {
            const itemAny = item as any;
            const variant = itemAny.variant;
            const product = variant?.product || item.product;
            const variantImages = variant?.images || [];
            const variantPrimaryImage = variantImages.find((img: any) => img.isPrimary) || variantImages[0];
            const productPrimaryImage = product?.images?.find((img: any) => img.isPrimary) || product?.images?.[0];
            const displayImage = variantPrimaryImage || productPrimaryImage;

            return (
              <div key={item.id} className="p-3 hover:bg-muted/50">
                <div className="flex items-start gap-3">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                    {displayImage ? (
                      <Image
                        src={typeof displayImage === 'string' ? displayImage : displayImage.url}
                        alt={product?.name || 'Producto'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product?.name || 'N/A'}
                      {variant?.name && <span> - {variant.name}</span>}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {variant ? `SKU: ${variant.sku}` : (product?.code || 'Sin código')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Almacén: {item.warehouse?.name || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${item.quantity <= item.minStock ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'}`}>
                        {item.quantity} ud.
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Mín: {item.minStock}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Link href={`/inventory/items/${item.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/inventory/items/edit/${item.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => confirmDelete(item.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
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
                const itemAny = item as any;
                const variant = itemAny.variant;
                const product = variant?.product || item.product;

                // Para productos con variantes, usar la imagen de la variante; si no, usar la del producto
                const variantImages = variant?.images || [];
                const variantPrimaryImage = variantImages.find((img: any) => img.isPrimary) || variantImages[0];
                const productPrimaryImage = product?.images?.find((img: any) => img.isPrimary) || product?.images?.[0];
                const displayImage = variantPrimaryImage || productPrimaryImage;

                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600">
                        {displayImage ? (
                          <Image
                            src={typeof displayImage === 'string' ? displayImage : displayImage.url}
                            alt={product?.name || 'Producto'}
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
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product?.name || 'N/A'}
                        {variant?.name && <span> - {variant.name}</span>}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {variant ? `SKU: ${variant.sku}` : (product?.code || 'Sin código')}
                      </div>
                      {variant?.attributeValues && variant.attributeValues.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {variant.attributeValues.map((av: any) => (
                            <span
                              key={av.id}
                              className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium"
                            >
                              {av.attributeValue?.displayName}
                            </span>
                          ))}
                        </div>
                      )}
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} de {filteredItems.length} items
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
