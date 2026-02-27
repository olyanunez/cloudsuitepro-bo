'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/ui/export-button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiGet, apiDelete, apiPatch } from '@/lib/services/apiService';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, EyeIcon, Truck, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '@/components/ProtectedPage';
import { usePermissions } from '@/lib/hooks/usePermissions';
import PageHeader from '@/components/layout/PageHeader';
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

interface Supplier {
  id: number;
  code: string;
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
  _count?: {
    batches: number;
  };
}

interface SupplierResponse {
  data: Supplier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function SuppliersPage() {
  const router = useRouter();
  const { canCreate, canUpdate, canDelete } = usePermissions('SUPPLIERS');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const limit = itemsPerPage;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: number; name: string } | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await apiGet<SupplierResponse>(`/suppliers?${params}`);
      setSuppliers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error: any) {
      toast.error('Error al cargar proveedores', {
        description: error.message || 'No se pudieron cargar los proveedores',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page, search, itemsPerPage]);

  const handleExport = async (format: 'pdf' | 'excel', exportStartDate?: string, exportEndDate?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({ format });

      if (exportStartDate) params.append('startDate', exportStartDate);
      if (exportEndDate) params.append('endDate', exportEndDate);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proveedores-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Proveedores exportados a ${format.toUpperCase()} exitosamente`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudieron exportar los proveedores';
      toast.error('Error al exportar', {
        description: errorMessage,
      });
    }
  };

  const confirmDelete = (id: number, supplierName: string) => {
    setSupplierToDelete({ id, name: supplierName });
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await apiDelete(`/suppliers/${supplierToDelete.id}`);
      toast.success('Proveedor eliminado exitosamente');
      fetchSuppliers();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo eliminar el proveedor';
      toast.error('Error al eliminar proveedor', {
        description: errorMessage,
      });
    } finally {
      setSupplierToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await apiPatch(`/suppliers/${id}/toggle-active`, {});
      toast.success(
        `Proveedor ${currentStatus ? 'desactivado' : 'activado'} exitosamente`
      );
      fetchSuppliers();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo cambiar el estado del proveedor';
      toast.error('Error al cambiar estado del proveedor', {
        description: errorMessage,
      });
    }
  };

  return (
    <ProtectedPage screenCode="SUPPLIERS" requiredPermission="VIEW">
      <div className="container mx-auto py-8">
        <PageHeader
          title="Proveedores"
          description="Gestiona la información de tus proveedores"
          icon="truck"
        >
          <ExportButton screenCode="SUPPLIERS" onExport={handleExport} />
          {canCreate && (
            <Link href="/suppliers/create">
              <Button className="bg-primary hover:bg-primary-600">
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </Link>
          )}
        </PageHeader>

        {/* Search and filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por código, nombre, email, teléfono o RNC..."
              className="pl-10 w-full"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setPage(1);
            }}
          >
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Proveedores</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Proveedores Activos</p>
                <p className="text-2xl font-bold">
                  {suppliers.filter((s) => s.isActive).length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <Truck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Proveedores Inactivos</p>
                <p className="text-2xl font-bold">
                  {suppliers.filter((s) => !s.isActive).length}
                </p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                <Truck className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Código
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    RNC
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lotes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      Cargando...
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                      No se encontraron proveedores
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {supplier.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {supplier.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {supplier.email && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="h-3 w-3 mr-1" />
                              {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="h-3 w-3 mr-1" />
                              {supplier.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {supplier.taxId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium">
                          {supplier._count?.batches || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleToggleActive(supplier.id, supplier.isActive)
                          }
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${supplier.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {supplier.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/suppliers/${supplier.id}`}>
                            <Button variant="outline" size="sm" className="px-2 py-1">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          {canUpdate && (
                            <Link href={`/suppliers/edit/${supplier.id}`}>
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
                              onClick={() =>
                                confirmDelete(supplier.id, supplier.name)
                              }
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total} proveedores
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
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
                Esta acción no se puede deshacer. Se eliminará permanentemente el proveedor
                &quot;{supplierToDelete?.name}&quot; y todos sus datos asociados del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="!bg-red-500 hover:!bg-red-600 !text-white"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedPage>
  );
}
