'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types/user';
import { Role } from '@/lib/types/role';
import { Branch } from '@/lib/types/inventory';
import { UserService } from '@/lib/services/userService';
import { RoleService } from '@/lib/services/roleService';
import { BranchService } from '@/lib/services/inventoryService';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeftIcon, PencilIcon, TrashIcon, UserIcon, Building2, PlusIcon, XIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
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

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Branch assignment states
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [branchToUnassign, setBranchToUnassign] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const userIdNum = parseInt(userId, 10);
        const userData = await UserService.getUserById(userIdNum);

        if (!userData) {
          return;
        }

        setUser(userData);

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

  const handleOpenAssignDialog = async () => {
    try {
      const branches = await BranchService.getBranches();
      setAvailableBranches(branches);
      setIsAssignDialogOpen(true);
    } catch (error) {
      console.error('Error loading branches:', error);
      toast.error('Error al cargar las sucursales');
    }
  };

  const handleBranchSelection = (branchId: number, checked: boolean) => {
    if (checked) {
      setSelectedBranches([...selectedBranches, branchId]);
    } else {
      setSelectedBranches(selectedBranches.filter((id) => id !== branchId));
    }
  };

  const handleAssignBranches = async () => {
    if (selectedBranches.length === 0) {
      toast.error('Debe seleccionar al menos una sucursal');
      return;
    }

    try {
      setAssigning(true);
      const userIdNum = parseInt(userId, 10);
      const updatedUser = await UserService.assignBranches(userIdNum, {
        branchIds: selectedBranches,
      });
      setUser(updatedUser);
      toast.success('Sucursales asignadas exitosamente');
      setIsAssignDialogOpen(false);
      setSelectedBranches([]);
    } catch (error) {
      console.error('Error assigning branches:', error);
      toast.error('Error al asignar sucursales');
    } finally {
      setAssigning(false);
    }
  };

  const confirmUnassign = (branchId: number) => {
    setBranchToUnassign(branchId);
    setIsUnassignDialogOpen(true);
  };

  const handleUnassignBranch = async () => {
    if (!branchToUnassign) return;

    try {
      const userIdNum = parseInt(userId, 10);
      const updatedUser = await UserService.unassignBranch(userIdNum, branchToUnassign);
      setUser(updatedUser);
      toast.success('Sucursal desasignada exitosamente');
      setIsUnassignDialogOpen(false);
      setBranchToUnassign(null);
    } catch (error) {
      console.error('Error unassigning branch:', error);
      toast.error('Error al desasignar la sucursal');
      setBranchToUnassign(null);
      setIsUnassignDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      const userIdNum = parseInt(userId, 10);
      await UserService.deleteUser(userIdNum);
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
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/users">
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Volver</span>
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Detalle de Usuario</h1>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            className={user.isActive ? "text-yellow-600" : "text-green-600"}
          >
            <span className="text-xs sm:text-sm">{user.isActive ? "Desactivar" : "Activar"}</span>
          </Button>
          <Link href={`/users/edit/${userId}`}>
            <Button variant="outline" size="sm">
              <PencilIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <TrashIcon className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Eliminar</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || ''}
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
                  <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                  <p>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}</p>
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

          {/* Assigned Branches */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5" />
                Sucursales Asignadas ({user.userBranches?.length || 0})
              </CardTitle>
              <Button onClick={handleOpenAssignDialog} size="sm" className="bg-primary hover:bg-primary-600">
                <PlusIcon className="mr-2 h-4 w-4" />
                Asignar Sucursales
              </Button>
            </CardHeader>
            <CardContent>
              {!user.userBranches || user.userBranches.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No hay sucursales asignadas a este usuario
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.userBranches.map((userBranch) => (
                    <div
                      key={userBranch.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-base">{userBranch.branch.name}</h4>
                        <button
                          onClick={() => confirmUnassign(userBranch.branchId)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Desasignar sucursal"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Código: {userBranch.branch.code}
                      </p>
                      {userBranch.branch.address && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {userBranch.branch.address}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Assign Branches Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Asignar Sucursales al Usuario</DialogTitle>
            <DialogDescription>
              Seleccione las sucursales que desea asignar a este usuario
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {availableBranches.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay sucursales disponibles</p>
            ) : (
              <div className="space-y-3">
                {availableBranches.map((branch) => {
                  const isAlreadyAssigned = user?.userBranches?.some((ub) => ub.branchId === branch.id) || false;
                  return (
                    <div
                      key={branch.id}
                      className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        id={`branch-${branch.id}`}
                        checked={selectedBranches.includes(branch.id) || isAlreadyAssigned}
                        onChange={(e) => {
                          if (!isAlreadyAssigned) {
                            handleBranchSelection(branch.id, e.target.checked);
                          }
                        }}
                        disabled={isAlreadyAssigned}
                        className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <label
                        htmlFor={`branch-${branch.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Código: {branch.code}
                        </div>
                        {branch.address && (
                          <div className="text-sm text-gray-500 dark:text-gray-500">{branch.address}</div>
                        )}
                        {isAlreadyAssigned && (
                          <span className="text-xs text-green-600 dark:text-green-400">Ya asignada</span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAssignBranches}
              disabled={assigning || selectedBranches.length === 0}
              className="bg-primary hover:bg-primary-600"
            >
              {assigning ? 'Asignando...' : 'Asignar Sucursales'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unassign Branch Dialog */}
      <AlertDialog open={isUnassignDialogOpen} onOpenChange={setIsUnassignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desasignar Sucursal?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea desasignar esta sucursal del usuario? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnassignBranch}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Desasignar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
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
              className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
