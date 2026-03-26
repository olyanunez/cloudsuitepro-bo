'use client';

import { useState, useEffect, useMemo } from 'react';
import { Branch } from '@/lib/types/inventory';
import { BranchService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, SearchIcon, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { ExportButton } from '@/components/ui/export-button';
import { toast } from 'sonner';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'code' | 'name' | 'address' | 'phone' | 'createdAt' | 'isActive'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function loadData() {
      try {
        const branchesData = await BranchService.getBranches();
        console.log('Sucursales recibidas del backend:', branchesData);
        setBranches(branchesData);
      } catch (error) {
        console.error('Error loading branches data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const confirmDelete = (branchId: string | number) => {
    setBranchToDelete(String(branchId));
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;

    try {
      await BranchService.deleteBranch(parseInt(branchToDelete, 10));
      setBranches(branches.filter(branch => branch.id !== parseInt(branchToDelete, 10)));
      console.log('Sucursal eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting branch:', error);
    } finally {
      setBranchToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filter and sort branches
  const filteredBranches = useMemo(() => {
    return branches
      .filter(branch => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          branch.code.toLowerCase().includes(searchTermLower) ||
          branch.name.toLowerCase().includes(searchTermLower) ||
          (branch.address && branch.address.toLowerCase().includes(searchTermLower)) ||
          (branch.phone && branch.phone.toLowerCase().includes(searchTermLower)) ||
          (branch.email && branch.email.toLowerCase().includes(searchTermLower))
        );
      })
      .sort((a, b) => {
        let fieldA: string | Date | boolean;
        let fieldB: string | Date | boolean;

        if (sortField === 'createdAt') {
          fieldA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          fieldB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        } else if (sortField === 'isActive') {
          fieldA = a.isActive;
          fieldB = b.isActive;
        } else {
          fieldA = (a[sortField] as string)?.toLowerCase() || '';
          fieldB = (b[sortField] as string)?.toLowerCase() || '';
        }

        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [branches, searchTerm, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: 'code' | 'name' | 'address' | 'phone' | 'createdAt' | 'isActive') => {
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

  const handleExport = async (format: 'pdf' | 'excel', startDate?: string, endDate?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      const params = new URLSearchParams({ format });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/branches/export?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sucursales-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Archivo ${format.toUpperCase()} descargado exitosamente`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al exportar datos');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Gestión de Sucursales</h1>
        <div className="flex gap-2 self-end sm:self-auto">
          <ExportButton screenCode="BRANCHES" onExport={handleExport} size="sm" />
          <Link href="/inventory/branches/create">
            <Button size="sm" className="bg-primary hover:bg-primary-600">
              <PlusIcon className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Nueva Sucursal</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar sucursales..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={sortField} onValueChange={(value: string) => setSortField(value as 'code' | 'name' | 'address' | 'phone' | 'createdAt' | 'isActive')}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="code">Código</SelectItem>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="address">Dirección</SelectItem>
            <SelectItem value="phone">Teléfono</SelectItem>
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
          {paginatedBranches.map((branch) => (
            <div key={branch.id} className="p-3 hover:bg-muted/50">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{branch.name}</span>
                    <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{branch.code}</code>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${branch.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                      {branch.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {branch.address || 'Sin dirección'}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {branch.phone && (
                      <span className="text-xs text-muted-foreground">{branch.phone}</span>
                    )}
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded-full text-[10px] font-medium">
                      {branch.warehouses?.length || 0} almacén(es)
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link href={`/inventory/branches/${branch.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/inventory/branches/edit/${branch.id}`}>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => confirmDelete(branch.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
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
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center">
                    Código
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
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
                  onClick={() => handleSort('address')}
                >
                  <div className="flex items-center">
                    Dirección
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center">
                    Teléfono
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Almacenes
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
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedBranches.map((branch) => (
                <tr key={branch.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {branch.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {branch.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {branch.address || 'No especificada'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {branch.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded-full text-xs font-medium">
                      {branch.warehouses?.length || 0} almacén(es)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${branch.isActive ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                      {branch.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/inventory/branches/${branch.id}`}>
                        <Button variant="outline" size="sm" className="px-2 py-1">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/inventory/branches/edit/${branch.id}`}>
                        <Button variant="outline" size="sm" className="px-2 py-1">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                        onClick={() => confirmDelete(branch.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
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
          Mostrando {filteredBranches.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredBranches.length)} de {filteredBranches.length} sucursales
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
              Esta acción eliminará permanentemente la sucursal y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBranch} className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
