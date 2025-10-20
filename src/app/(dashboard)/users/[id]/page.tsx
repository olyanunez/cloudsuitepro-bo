'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types/user';
import { Role } from '@/lib/types/role';
import { UserService } from '@/lib/services/userService';
import { RoleService } from '@/lib/services/roleService';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, PencilIcon, TrashIcon, UserIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
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
// No se necesita importar Badge ya que usaremos divs con Tailwind

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Convertir el userId a número ya que el servicio espera un number
        const userIdNum = parseInt(userId, 10);
        const userData = await UserService.getUserById(userIdNum);

        if (!userData) {
          return;
        }

        setUser(userData);

        // Cargar información del rol si existe roleId
        if (userData.roleId) {
          const roleData = await RoleService.getRoleById(userData.roleId);
          setRole(roleData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadData();
    }
  }, [userId]);

  const handleDelete = async () => {
    try {
      // Convertir el userId a número ya que el servicio espera un number
      const userIdNum = parseInt(userId, 10);
      await UserService.deleteUser(userIdNum);
      // El método deleteUser no devuelve un valor, así que siempre redirigimos
      router.push('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Ocurrió un error al eliminar el usuario. Por favor intente nuevamente.');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      // Convertir el userId a número ya que el servicio espera un number
      const userIdNum = parseInt(userId, 10);
      const updatedUser = await UserService.toggleUserStatus(userIdNum);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Ocurrió un error al cambiar el estado del usuario. Por favor intente nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <p className="text-yellow-800 dark:text-yellow-200">Usuario no encontrado</p>
        </div>
        <div className="mt-4">
          <Link href="/users">
            <Button variant="outline">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver a Usuarios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/users">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Detalle de Usuario</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            className={user.isActive ? "text-yellow-600" : "text-green-600"}
          >
            {user.isActive ? "Desactivar" : "Activar"}
          </Button>
          <Link href={`/users/edit/${userId}`}>
            <Button variant="outline" size="sm">
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                      {user.isActive ? "Activo" : "Inactivo"}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                  <div className="mt-2">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 mr-2">
                      {role?.name || "Rol desconocido"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-lg font-medium mb-3">Información del Usuario</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                  <p className="font-mono text-sm">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rol</p>
                  <p>{role?.name || "Desconocido"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</p>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                  <p>{new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Último Inicio de Sesión</p>
                  <p>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estado</p>
                  <p>{user.isActive ? 'Activo' : 'Inactivo'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Información del Rol</h3>
            {role ? (
              <div>
                <h4 className="font-medium">{role.name}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{role.description}</p>

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Permisos ({role._count?.roleScreenPermissions || role.permissionsCount || 0})</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {role.screensWithPermissions?.map(screen => (
                      <div key={screen.screen.id} className="mb-3">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">{screen.screen.name}</p>
                        {screen.permissions.map(permission => (
                          <div key={permission.id} className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md mb-1">
                            <p className="text-sm font-medium">{permission.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                    {(!role.screensWithPermissions || role.screensWithPermissions.length === 0) && (
                      <p className="text-sm text-gray-500">No hay permisos disponibles</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No se encontró información del rol</p>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
  );
}
