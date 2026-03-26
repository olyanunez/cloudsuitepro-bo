'use client';

import { useState, useEffect, useMemo } from 'react';
import { Role } from '@/lib/types/role';
import { RoleService } from '@/lib/services/roleService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/ui/export-button';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, SearchIcon, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/layout/PageHeader';
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
import { isAuthenticated } from '@/lib/services/apiService';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function RolesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { canCreate, canUpdate, canDelete } = usePermissions('ROLES');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'description' | 'createdAt'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        const rolesData = await RoleService.getRoles();
        setRoles(rolesData);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al cargar los roles';
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, toast]);

  const confirmDelete = (roleId: string | number) => {
    setRoleToDelete(String(roleId));
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      const response = await RoleService.deleteRole(roleToDelete);

      // Convertir roleToDelete a número para comparar con role.id que es número
      const roleToDeleteNum = parseInt(roleToDelete, 10);

      // Actualizar el estado removiendo el rol eliminado
      setRoles(prevRoles => prevRoles.filter(role => role.id !== roleToDeleteNum));

      // Mostrar mensaje de éxito
      toast({
        title: "Rol eliminado",
        description: response?.message || "El rol ha sido eliminado exitosamente",
      });

      console.log('Rol eliminado exitosamente:', response?.message);
    } catch (error) {
      console.error('Error deleting role:', error);

      // Mostrar mensaje de error
      const message = error instanceof Error ? error.message : 'Error al eliminar el rol';
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setRoleToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleExport = async (
    format: 'pdf' | 'excel',
    startDate?: string,
    endDate?: string
  ) => {
    const token = localStorage.getItem('auth_token');
    const params = new URLSearchParams({ format });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/export?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Error al exportar');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roles-${format}-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getPermissionsCount = (role: Role): number => {
    console.log('Calculando permisos para rol:', role.name);

    // Si el rol tiene el campo _count.roleScreenPermissions, usarlo directamente
    if (role._count && typeof role._count.roleScreenPermissions === 'number') {
      console.log('Usando _count.roleScreenPermissions:', role._count.roleScreenPermissions);
      return role._count.roleScreenPermissions;
    }

    // Si el rol tiene el campo permissionsCount, usarlo directamente
    if (typeof role.permissionsCount === 'number') {
      console.log('Usando permissionsCount:', role.permissionsCount);
      return role.permissionsCount;
    }

    // Si tiene screensWithPermissions, calcular el total sumando los permisos de cada pantalla
    if (role.screensWithPermissions && role.screensWithPermissions.length > 0) {
      const count = role.screensWithPermissions.reduce((total, screen) => {
        return total + (screen.permissions?.length || 0);
      }, 0);
      console.log('Calculado desde screensWithPermissions:', count);
      return count;
    }

    // Si no hay información de permisos, devolver 0
    console.log('No se encontró información de permisos, devolviendo 0');
    return 0;
  };

  // Filter and sort roles
  const filteredRoles = useMemo(() => {
    return roles
      .filter(role => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          role.name.toLowerCase().includes(searchTermLower) ||
          (role.description && role.description.toLowerCase().includes(searchTermLower))
        );
      })
      .sort((a, b) => {
        // Usar tipos específicos en lugar de any
        let fieldA: string | Date;
        let fieldB: string | Date;

        if (sortField === 'createdAt') {
          // Asegurarse de que createdAt sea un valor válido para crear una fecha
          fieldA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          fieldB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        } else {
          // Asegurarse de que los campos sean strings
          fieldA = (a[sortField] as string)?.toLowerCase() || '';
          fieldB = (b[sortField] as string)?.toLowerCase() || '';
        }

        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [roles, searchTerm, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: 'name' | 'description' | 'createdAt') => {
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
    <ProtectedPage screenCode="ROLES" requiredPermission="VIEW">
      <div className="container mx-auto py-8">
        <PageHeader
          title="Gestión de Roles"
          icon="shield"
        >
          <div className="flex gap-2">
            <ExportButton
              screenCode="ROLES"
              onExport={handleExport}
              requiresDateRange={true}
            />
            {canCreate && (
              <Link href="/roles/create">
                <Button className="bg-primary hover:bg-primary-600">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Nuevo Rol
                </Button>
              </Link>
            )}
          </div>
        </PageHeader>

        {/* Search and filter controls */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar roles..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={sortField} onValueChange={(value: string) => setSortField(value as 'name' | 'description' | 'createdAt')}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nombre</SelectItem>
              <SelectItem value="description">Descripción</SelectItem>
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
            {paginatedRoles.map((role) => (
              <div key={role.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {role.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {role.description || 'Sin descripción'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {getPermissionsCount(role)} permisos
                      </span>
                      <span className="text-xs text-gray-400">
                        {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link href={`/roles/${role.id}`}>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    {canUpdate && (
                      <Link href={`/roles/edit/${role.id}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                        onClick={() => confirmDelete(role.id)}
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Permisos
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
                {paginatedRoles.map((role) => (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {role.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {role.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        {getPermissionsCount(role)} permisos
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/roles/${role.id}`}>
                          <Button variant="outline" size="sm" className="px-2 py-1">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </Link>
                        {canUpdate && (
                          <Link href={`/roles/edit/${role.id}`}>
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
                            onClick={() => confirmDelete(role.id)}
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
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRoles.length)} de {filteredRoles.length} roles
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Desktop: page number buttons */}
            <div className="hidden sm:flex items-center space-x-1">
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

            {/* Mobile: simple page indicator */}
            <span className="sm:hidden text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
              {currentPage} / {totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
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
                Esta acción eliminará permanentemente el rol y no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteRole}
                className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600"
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
