'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProductCategory } from '@/lib/types/inventory';
import { ProductCategoryService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/ui/export-button';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, SearchIcon, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import ProtectedPage from '@/components/ProtectedPage';
import { usePermissions } from '@/lib/hooks/usePermissions';
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

export default function CategoriesPage() {
  const { canCreate, canUpdate, canDelete } = usePermissions('PRODUCT_CATEGORY');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'description' | 'createdAt' | 'isActive'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function loadData() {
      try {
        const categoriesData = await ProductCategoryService.getAll();
        console.log('Categorías recibidas del backend:', categoriesData);

        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories data:', error);
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-categories/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `categorias-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Categorías exportadas a ${format.toUpperCase()} exitosamente`);
    } catch (error: any) {
      toast.error('Error al exportar', { description: error.message });
    }
  };

  const confirmDelete = (categoryId: string | number) => {
    setCategoryToDelete(String(categoryId));
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await ProductCategoryService.delete(parseInt(categoryToDelete, 10));
      setCategories(categories.filter(category => category.id !== parseInt(categoryToDelete, 10)));
      console.log('Categoría eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setCategoryToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter(category => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          category.name.toLowerCase().includes(searchTermLower) ||
          (category.description && category.description.toLowerCase().includes(searchTermLower))
        );
      })
      .sort((a, b) => {
        // Usar tipos específicos en lugar de any
        let fieldA: string | Date | boolean;
        let fieldB: string | Date | boolean;

        if (sortField === 'createdAt') {
          // Asegurarse de que createdAt sea un valor válido para crear una fecha
          fieldA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          fieldB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        } else if (sortField === 'isActive') {
          // Manejar el campo booleano
          fieldA = a.isActive;
          fieldB = b.isActive;
        } else {
          // Asegurarse de que los campos sean strings
          fieldA = (a[sortField] as string)?.toLowerCase() || '';
          fieldB = (b[sortField] as string)?.toLowerCase() || '';
        }

        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [categories, searchTerm, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: 'name' | 'description' | 'createdAt' | 'isActive') => {
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
    <ProtectedPage screenCode="PRODUCT_CATEGORY" requiredPermission="VIEW">
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Gestión de Categorías</h1>
          <div className="flex gap-2 self-end sm:self-auto">
            <ExportButton screenCode="PRODUCT_CATEGORY" onExport={handleExport} size="sm" />
            {canCreate && (
              <Link href="/inventory/categories/create">
                <Button size="sm" className="bg-primary hover:bg-primary-600">
                  <PlusIcon className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">Nueva Categoría</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search and filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar categorías..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={sortField} onValueChange={(value: string) => setSortField(value as 'name' | 'description' | 'createdAt' | 'isActive')}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="description">Descripción</SelectItem>
              <SelectItem value="isActive">Estado</SelectItem>
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
            {paginatedCategories.map((category) => (
              <div key={category.id} className="p-3 hover:bg-muted/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{category.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${category.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                        {category.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {category.description || 'Sin descripción'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Link href={`/inventory/categories/${category.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    {canUpdate && (
                      <Link href={`/inventory/categories/edit/${category.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => confirmDelete(category.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Nombre
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center">
                      Descripción
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('isActive')}
                  >
                    <div className="flex items-center">
                      Estado
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
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
                {paginatedCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {category.description || 'Sin descripción'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                        {category.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/inventory/categories/${category.id}`}>
                          <Button variant="outline" size="sm" className="px-2 py-1">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        {canUpdate && (
                          <Link href={`/inventory/categories/edit/${category.id}`}>
                            <Button variant="outline" size="sm" className="px-2 py-1">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {canDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-2 py-1 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                            onClick={() => confirmDelete(category.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCategories.length)} de {filteredCategories.length} categorías
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
                Esta acción eliminará permanentemente la categoría y no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteCategory} className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedPage>
  );
}