'use client';

import { useState, useEffect } from 'react';
import { Role, Permission } from '@/lib/types/role';
import { RoleService } from '@/lib/services/roleService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, PencilIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function RoleDetailPage() {
  const params = useParams();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const roleId = params.id as string;

  useEffect(() => {
    async function loadRole() {
      try {
        const roleData = await RoleService.getRoleById(roleId);
        setRole(roleData);
      } catch (error) {
        console.error('Error loading role data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (roleId) {
      loadRole();
    }
  }, [roleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Rol no encontrado</h2>
          <p className="mb-4">El rol que está buscando no existe o ha sido eliminado.</p>
          <Link href="/roles">
            <Button variant="outline">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Volver a la lista de roles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Agrupar permisos por módulo
  const groupedPermissions: Record<string, Permission[]> = {};
  role.permissions.forEach(permission => {
    if (!groupedPermissions[permission.module]) {
      groupedPermissions[permission.module] = [];
    }
    groupedPermissions[permission.module].push(permission);
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/roles">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{role.name}</h1>
        </div>
        <Link href={`/roles/edit/${role.id}`}>
          <Button className="bg-primary hover:bg-primary-600">
            <PencilIcon className="mr-2 h-4 w-4" />
            Editar Rol
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Información del Rol</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                <p className="font-medium">{role.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Descripción</p>
                <p>{role.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de Creación</p>
                <p>{new Date(role.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                <p>{new Date(role.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Permisos ({role.permissions.length})</h2>
            
            {Object.keys(groupedPermissions).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Este rol no tiene permisos asignados.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, permissions]) => (
                  <div key={module} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium text-lg mb-2 capitalize">{module}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map(permission => (
                        <div 
                          key={permission.id} 
                          className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700"
                        >
                          <div>
                            <p className="font-medium">{permission.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
