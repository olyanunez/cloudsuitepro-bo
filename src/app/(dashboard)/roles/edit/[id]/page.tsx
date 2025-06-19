'use client';

import { useState, useEffect } from 'react';
import { Permission, Role, RoleUpdateInput } from '@/lib/types/role';
import { RoleService } from '@/lib/services/roleService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;
  
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<RoleUpdateInput>({
    name: '',
    description: '',
    permissionIds: []
  });
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    permissionIds?: string;
  }>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [roleData, permissionsData] = await Promise.all([
          RoleService.getRoleById(roleId),
          RoleService.getPermissions()
        ]);
        
        if (!roleData) {
          router.push('/roles');
          return;
        }
        
        setRole(roleData);
        setPermissions(permissionsData);
        
        // Initialize form data
        setFormData({
          name: roleData.name,
          description: roleData.description,
          permissionIds: roleData.permissions.map(p => p.id)
        });
      } catch (error) {
        console.error('Error loading role data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (roleId) {
      loadData();
    }
  }, [roleId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      const updatedPermissionIds = checked 
        ? [...(prev.permissionIds || []), value]
        : (prev.permissionIds || []).filter(id => id !== value);
      
      return { ...prev, permissionIds: updatedPermissionIds };
    });
    
    // Clear error when user selects permissions
    if (errors.permissionIds) {
      setErrors(prev => ({ ...prev, permissionIds: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
      permissionIds?: string;
    } = {};
    
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'El nombre del rol es requerido';
    }
    
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (!formData.permissionIds || formData.permissionIds.length === 0) {
      newErrors.permissionIds = 'Debe seleccionar al menos un permiso';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      await RoleService.updateRole(roleId, formData);
      router.push(`/roles/${roleId}`);
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Ocurrió un error al actualizar el rol. Por favor intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // Agrupar permisos por módulo
  const groupedPermissions: Record<string, Permission[]> = {};
  permissions.forEach(permission => {
    if (!groupedPermissions[permission.module]) {
      groupedPermissions[permission.module] = [];
    }
    groupedPermissions[permission.module].push(permission);
  });

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
          <p className="mb-4">El rol que está intentando editar no existe o ha sido eliminado.</p>
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Link href={`/roles/${roleId}`}>
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Rol: {role.name}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Información del Rol</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                    placeholder="Nombre del rol"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                    placeholder="Descripción del rol"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Permisos</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.permissionIds?.length || 0} seleccionados
                </div>
              </div>
              
              {errors.permissionIds && (
                <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.permissionIds}</p>
                </div>
              )}
              
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                  <div key={module} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium text-lg mb-2 capitalize">{module}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {modulePermissions.map(permission => (
                        <div 
                          key={permission.id} 
                          className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700"
                        >
                          <input
                            type="checkbox"
                            id={`permission-${permission.id}`}
                            value={permission.id}
                            checked={formData.permissionIds?.includes(permission.id) || false}
                            onChange={handlePermissionChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`permission-${permission.id}`} className="ml-2 block">
                            <span className="font-medium">{permission.name}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</p>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link href={`/roles/${roleId}`}>
            <Button type="button" variant="outline" className="mr-2">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-primary hover:bg-primary-600"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
