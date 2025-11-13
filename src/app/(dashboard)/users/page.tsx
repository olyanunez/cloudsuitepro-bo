'use client';

import { useState, useEffect, useMemo } from 'react';
import { User } from '@/lib/types/user';
import { UserService } from '@/lib/services/userService';
import { RoleService } from '@/lib/services/roleService';
import { Role } from '@/lib/types/role';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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

export default function UsersPage() {
  const { canCreate, canUpdate, canDelete } = usePermissions('USERS');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    async function loadData() {
      try {
        const [usersData, rolesData] = await Promise.all([
          UserService.getUsers(),
          RoleService.getRoles()
        ]);
        setUsers(usersData);
        setRoles(rolesData);
      } catch (error) {
        console.error('Error loading users data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getRoleName = (user: User): string => {
    // Si el usuario tiene el objeto role, usar el nombre directamente
    if (user.role && user.role.name) {
      return user.role.name;
    }
    // Si no, buscar el rol en la lista local de roles
    const role = roles.find(r => r.id === user.roleId);
    return role?.name || 'Desconocido';
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const updatedUser = await UserService.toggleUserStatus(userId);
      if (updatedUser) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive: !user.isActive } : user
        ));
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const confirmDelete = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const success = await UserService.deleteUser(userToDelete);
      if (success) {
        setUsers(users.filter(user => user.id !== userToDelete));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setUserToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        const fieldA = sortField === 'name' ? a.name : a.email;
        const fieldB = sortField === 'name' ? b.name : b.email;
        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [users, searchTerm, roleFilter, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: keyof User) => {
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
    <ProtectedPage screenCode="USERS" requiredPermission="VIEW">
      <div className="container mx-auto py-8">
        <PageHeader
          title="Gestión de Usuarios"
          icon="user-cog"
        >
          {canCreate && (
            <Link href="/users/create">
              <Button className="bg-primary hover:bg-primary-600">
                <PlusIcon className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </Link>
          )}
        </PageHeader>
      
      {/* Search and filter controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar usuarios..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={roleFilter} onValueChange={(value: string) => setRoleFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            {roles.map(role => (
              <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortField} onValueChange={(value: string) => setSortField(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortDirection} onValueChange={(value: string) => setSortDirection(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Dirección" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascendente</SelectItem>
            <SelectItem value="desc">Descendente</SelectItem>
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
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Permisos
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Último Acceso
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {paginatedUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.avatar ? (
                        <Image 
                          src={user.avatar} 
                          alt={user.name} 
                          width={40}
                          height={40}
                          className="rounded-full mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center mr-3">
                          <span className="text-primary-700 font-medium">
                            {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {getRoleName(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                      {user.role?._count?.roleScreenPermissions || 0} permisos
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString() 
                      : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/users/${user.id}`}>
                        <Button variant="outline" size="sm" className="px-2 py-1">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                      {canUpdate && (
                        <Link href={`/users/edit/${user.id}`}>
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
                          onClick={() => confirmDelete(user.id)}
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
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
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
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
              y todos sus datos asociados del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
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
