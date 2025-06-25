'use client';

import { useState, useEffect } from 'react';
import { Role, RoleUpdateInput, ScreenWithPermissions } from '@/lib/types/role';
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
  const [allScreensWithPermissions, setAllScreensWithPermissions] = useState<ScreenWithPermissions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<RoleUpdateInput & { permissionIds: string[]; permissionPairs: {screenId: number, permissionId: string}[] }>({
    name: '',
    description: '',
    permissionIds: [],
    screenPermissionIds: [],
    permissionPairs: []
  });
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    permissionIds?: string;
    screenPermissionIds?: string;
  }>({});

  useEffect(() => {
    async function loadData() {
      try {
        const roleData = await RoleService.getRoleById(parseInt(roleId, 10));
        const allScreensWithPerms = await RoleService.getScreensWithPermissions();
        
        if (!roleData) {
          router.push('/roles');
          return;
        }
        
        console.log('Role data:', roleData);
        console.log('All screens with permissions:', allScreensWithPerms);
        
        setRole(roleData);
        
        // Convertir la estructura de ApiScreenWithPermissions a ScreenWithPermissions
        const formattedScreens: ScreenWithPermissions[] = allScreensWithPerms.map(apiScreen => ({
          screen: {
            id: apiScreen.id,
            name: apiScreen.name,
            code: apiScreen.code,
            description: ''
          },
          permissions: apiScreen.permissions
        }));
        
        setAllScreensWithPermissions(formattedScreens);
        
        // Extraer todos los IDs de permisos asignados al rol
        const assignedPermissionIds: string[] = [];
        const assignedScreenPermissionIds: number[] = [];
        
        if (roleData.screensWithPermissions && roleData.screensWithPermissions.length > 0) {
          roleData.screensWithPermissions.forEach(screenWithPerm => {
            screenWithPerm.permissions.forEach(permission => {
              assignedPermissionIds.push(permission.id.toString());
              // Aquí deberíamos obtener los screenPermissionIds reales, pero como no los tenemos
              // usamos un valor temporal
              // assignedScreenPermissionIds.push(screenPermission.id);
            });
          });
        }
        
        // Crear pares de screenId-permissionId para un mejor control
        const permissionPairs: {screenId: number, permissionId: string}[] = [];
        
        if (roleData.screensWithPermissions && roleData.screensWithPermissions.length > 0) {
          roleData.screensWithPermissions.forEach(screenWithPerm => {
            const screenId = screenWithPerm.screen.id;
            screenWithPerm.permissions.forEach(permission => {
              permissionPairs.push({
                screenId,
                permissionId: permission.id.toString()
              });
            });
          });
        }
        
        // Initialize form data
        setFormData({
          name: roleData.name,
          code: roleData.code,
          description: roleData.description,
          permissionIds: assignedPermissionIds,
          screenPermissionIds: assignedScreenPermissionIds,
          permissionPairs: permissionPairs
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

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>, screenId: number) => {
    const { value, checked } = e.target;
    const permissionId = value;
    
    setFormData(prev => {
      // Actualizar los pares screenId-permissionId
      let updatedPairs = [...prev.permissionPairs];
      
      if (checked) {
        // Agregar el par si no existe
        if (!updatedPairs.some(p => p.screenId === screenId && p.permissionId === permissionId)) {
          updatedPairs.push({ screenId, permissionId });
        }
      } else {
        // Eliminar el par si existe
        updatedPairs = updatedPairs.filter(p => !(p.screenId === screenId && p.permissionId === permissionId));
      }
      
      // Actualizar permissionIds para compatibilidad con la UI
      const updatedPermissionIds = updatedPairs.map(p => p.permissionId);
      
      return { 
        ...prev, 
        permissionIds: updatedPermissionIds,
        permissionPairs: updatedPairs
        // En un caso real, aquí actualizaríamos screenPermissionIds
      };
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
      newErrors.screenPermissionIds = 'Debe seleccionar al menos un permiso';
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
      
      // Convertir los IDs de string a number para screenPermissionIds
      const screenPermissionIds: number[] = [];
      
      // Extraer los IDs de permisos únicos de los pares
      if (formData.permissionPairs && formData.permissionPairs.length > 0) {
        formData.permissionIds.forEach(id => {
          const numId = parseInt(id, 10);
          if (!isNaN(numId) && !screenPermissionIds.includes(numId)) {
            screenPermissionIds.push(numId);
          }
        });
      }
      
      console.log('Permisos seleccionados para enviar:', screenPermissionIds);
      
      // Datos completos del rol incluyendo permisos
      const updateData: RoleUpdateInput = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        screenPermissionIds: screenPermissionIds
      };
      
      console.log('Enviando datos completos al backend:', updateData);
      
      await RoleService.updateRole(parseInt(roleId, 10), updateData);
      router.push(`/roles/${roleId}`);
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Ocurrió un error al actualizar el rol. Por favor intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // Ordenar pantallas alfabéticamente por nombre
  const sortedScreens = [...allScreensWithPermissions].sort((a, b) => {
    return (a.screen.name || '').localeCompare(b.screen.name || '');
  });
  
  // Calcular el total de permisos seleccionados
  const selectedPermissionsCount = formData.permissionIds?.length || 0;

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
                  <p>{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                  <p>{role.updatedAt ? new Date(role.updatedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Permisos</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedPermissionsCount} seleccionados
                </div>
              </div>
              
              {errors.permissionIds && (
                <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.permissionIds}</p>
                </div>
              )}
              
              <div className="space-y-6">
                {sortedScreens.map((screenWithPerms) => (
                  <div key={screenWithPerms.screen.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium text-lg mb-2 capitalize">{screenWithPerms.screen.name || `Pantalla ${screenWithPerms.screen.id}`}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{screenWithPerms.screen.description || `Código: ${screenWithPerms.screen.code}`}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {screenWithPerms.permissions && screenWithPerms.permissions.length > 0 ? (
                        screenWithPerms.permissions.map((permission) => (
                          <div 
                            key={`${screenWithPerms.screen.id}-${permission.id}`} 
                            className="flex items-center p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          >
                            <input
                              type="checkbox"
                              id={`permission-${screenWithPerms.screen.id}-${permission.id}`}
                              value={permission.id.toString()}
                              checked={formData.permissionPairs?.some(p => p.screenId === screenWithPerms.screen.id && p.permissionId === permission.id.toString()) || false}
                              onChange={(e) => handlePermissionChange(e, screenWithPerms.screen.id)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`permission-${screenWithPerms.screen.id}-${permission.id}`} className="ml-2 block w-full">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-blue-600 dark:text-blue-400">{permission.name}</span>
                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">{permission.code}</span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{permission.description || `Permiso ID: ${permission.id}`}</p>
                              {permission.module && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-100 dark:bg-gray-800 inline-block px-2 py-1 rounded">Módulo: {permission.module}</p>
                              )}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 col-span-2">No hay permisos disponibles para esta pantalla.</p>
                      )}
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
