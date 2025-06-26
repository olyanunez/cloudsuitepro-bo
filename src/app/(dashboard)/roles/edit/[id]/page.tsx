'use client';

import { useState, useEffect } from 'react';
import { Permission, RoleUpdateInput } from '@/lib/types/role';
import { RoleService } from '@/lib/services/roleService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

// Extendemos el tipo Permission para incluir screenPermissionId
type ExtendedPermission = Permission & { screenPermissionId?: number };

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;
  
  const [role, setRole] = useState<(RoleUpdateInput & { createdAt?: string | Date, updatedAt?: string | Date }) | null>(null);
  const [screensWithPermissions, setScreensWithPermissions] = useState<{id: number, name: string, code: string, permissions: ExtendedPermission[]}[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [expandedScreens, setExpandedScreens] = useState<Record<number, boolean>>({});
  
  const [formData, setFormData] = useState<RoleUpdateInput & { 
    screenPermissionPairs: {screenId: number, permissionId: number, screenPermissionId: number}[] 
  }>({
    name: '',
    code: '',
    description: '',
    screenPermissionIds: [],
    screenPermissionPairs: []
  });
  
  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
    description?: string;
    screenPermissionIds?: string;
  }>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Cargar el rol actual
        const roleData = await RoleService.getRoleById(parseInt(roleId, 10));
        if (!roleData) {
          router.push('/roles');
          return;
        }
        
        setRole(roleData);
        
        // Cargar todas las pantallas con sus permisos
        const screensData = await RoleService.getScreensWithPermissions();
        console.log('Datos de pantallas con permisos:', screensData);
        
        // Procesar y agrupar los datos
        const screenMap = new Map();
        
        screensData.forEach((item) => {
          const screenId = item.id;
          const screenName = item.name;
          const screenCode = item.code;
          const permissions = item.permissions || [];
          
          if (screenId) {
            screenMap.set(screenId, {
              id: screenId,
              name: screenName,
              code: screenCode,
              permissions: [...permissions]
            });
          }
        });
        
        // Convertir el mapa a un array
        const uniqueScreensData = Array.from(screenMap.values());
        setScreensWithPermissions(uniqueScreensData);
        
        // Inicializar el estado de expansión de pantallas
        const initialExpandedState: Record<number, boolean> = {};
        uniqueScreensData.forEach(screen => {
          initialExpandedState[screen.id] = false;
        });
        setExpandedScreens(initialExpandedState);
        
        // Extraer los permisos asignados al rol
        const screenPermissionPairs: {screenId: number, permissionId: number, screenPermissionId: number}[] = [];
        
        if (roleData.screensWithPermissions && roleData.screensWithPermissions.length > 0) {
          roleData.screensWithPermissions.forEach(screenWithPerm => {
            const screenId = screenWithPerm.screen.id;
            screenWithPerm.permissions.forEach(permission => {
              screenPermissionPairs.push({
                screenId,
                permissionId: parseInt(permission.id.toString(), 10),
                screenPermissionId: permission.screenPermissionId || 0
              });
            });
          });
        }
        
        // Extraer los IDs de screenPermission para la API y filtrar valores inválidos (0 o undefined)
        const screenPermissionIds = screenPermissionPairs
          .map(p => p.screenPermissionId)
          .filter(id => id !== 0 && id !== undefined);
        
        // Inicializar formData con los datos del rol
        setFormData({
          name: roleData.name,
          code: roleData.code,
          description: roleData.description,
          screenPermissionIds,
          screenPermissionPairs
        });
      } catch (error) {
        console.error('Error loading role data:', error);
        alert('Ocurrió un error al cargar los datos del rol.');
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

  const toggleScreenExpansion = (screenId: number) => {
    setExpandedScreens(prev => ({
      ...prev,
      [screenId]: !prev[screenId]
    }));
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>, screenId: number) => {
    const { value, checked } = e.target;
    // El valor ahora contiene screenPermissionId-permissionId
    const [screenPermissionId, permissionId] = value.split('-').map(Number);
    
    console.log(`Cambiando permiso: screenId=${screenId}, permissionId=${permissionId}, screenPermissionId=${screenPermissionId}, checked=${checked}`);
    
    setFormData(prev => {
      // Actualizar los pares screenId-permissionId-screenPermissionId
      let updatedPairs = [...prev.screenPermissionPairs];
      
      if (checked) {
        // Agregar el par si no existe
        if (!updatedPairs.some(p => p.screenId === screenId && p.permissionId === permissionId)) {
          updatedPairs.push({ screenId, permissionId, screenPermissionId });
        }
      } else {
        // Eliminar el par si existe usando screenId y permissionId en lugar de screenPermissionId
        // para manejar correctamente los casos donde screenPermissionId es 0
        updatedPairs = updatedPairs.filter(p => !(p.screenId === screenId && p.permissionId === permissionId));
      }
      
      // Extraer los IDs de screenPermission para la API y filtrar valores inválidos (0 o undefined)
      const updatedScreenPermissionIds = updatedPairs
        .map(p => p.screenPermissionId)
        .filter(id => id !== 0 && id !== undefined);
      
      console.log('Pares actualizados:', updatedPairs);
      console.log('IDs de screenPermission filtrados:', updatedScreenPermissionIds);
      
      return { 
        ...prev, 
        screenPermissionPairs: updatedPairs,
        screenPermissionIds: updatedScreenPermissionIds
      };
    });
    
    // Clear error when user selects permissions
    if (errors.screenPermissionIds) {
      setErrors(prev => ({ ...prev, screenPermissionIds: undefined }));
    }
  };

  // Función para seleccionar/deseleccionar todos los permisos de una pantalla
  const handleSelectAllScreenPermissions = (screenId: number, permissions: ExtendedPermission[], checked: boolean) => {
    setFormData(prev => {
      let updatedPairs = [...prev.screenPermissionPairs];
      
      if (checked) {
        // Agregar todos los permisos de la pantalla que no estén ya seleccionados
        permissions.forEach(permission => {
          const permissionId = permission.id;
          const screenPermissionId = permission.screenPermissionId || 0;
          
          if (!updatedPairs.some(p => p.screenPermissionId === screenPermissionId)) {
            updatedPairs.push({
              screenId,
              permissionId,
              screenPermissionId
            });
          }
        });
      } else {
        // Eliminar todos los permisos de esta pantalla
        updatedPairs = updatedPairs.filter(p => p.screenId !== screenId);
      }
      
      // Actualizar screenPermissionIds y filtrar valores inválidos (0 o undefined)
      const updatedScreenPermissionIds = updatedPairs
        .map(p => p.screenPermissionId)
        .filter(id => id !== 0 && id !== undefined);
      
      return {
        ...prev,
        screenPermissionPairs: updatedPairs,
        screenPermissionIds: updatedScreenPermissionIds
      };
    });
    
    // Clear error
    if (errors.screenPermissionIds) {
      setErrors(prev => ({ ...prev, screenPermissionIds: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      code?: string;
      description?: string;
      screenPermissionIds?: string;
    } = {};
    
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'El nombre del rol es obligatorio';
    }
    
    if (!formData.code || !formData.code.trim()) {
      newErrors.code = 'El código del rol es obligatorio';
    }
    
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'La descripción del rol es obligatoria';
    }
    
    // Eliminamos la validación que requiere al menos un permiso
    // Un rol puede existir sin permisos asignados
    
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
      
      // Preparar los datos para enviar al backend
      // Necesitamos enviar todos los permisos seleccionados, incluso si no tienen un screenPermissionId válido
      // Para ello, enviaremos un array con los pares screenId-permissionId
      const screenPermissionPairs = formData.screenPermissionPairs || [];
      
      // Creamos un array con todos los pares screenId-permissionId seleccionados
      const allSelectedPermissions = screenPermissionPairs.map(pair => ({
        screenId: pair.screenId,
        permissionId: pair.permissionId
      }));
      
      console.log('Enviando datos del rol:', formData);
      console.log('Todos los permisos seleccionados:', allSelectedPermissions);
      
      // Preparar los datos para enviar al backend
      const dataToSend = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        // Enviamos todos los permisos seleccionados como pares screenId-permissionId
        screenPermissionPairs: allSelectedPermissions
      };
      
      await RoleService.updateRoleWithPermissions(parseInt(roleId, 10), dataToSend);
      router.push(`/roles/${roleId}`);
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Ocurrió un error al actualizar el rol. Por favor intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // Ordenar pantallas alfabéticamente por nombre
  const sortedScreens = [...screensWithPermissions].sort((a, b) => {
    return (a.name || '').localeCompare(b.name || '');
  });
  
  // Calcular el total de permisos seleccionados
  // Usar screenPermissionPairs para contar los permisos seleccionados, ya que screenPermissionIds
  // puede tener menos elementos debido al filtrado de valores 0
  const selectedPermissionsCount = formData.screenPermissionPairs?.length || 0;

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
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                    placeholder="Código del rol"
                  />
                  {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
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
                  <p>{role?.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Última Actualización</p>
                  <p>{role?.updatedAt ? new Date(role.updatedAt).toLocaleDateString() : 'N/A'}</p>
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
              
              {errors.screenPermissionIds && (
                <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.screenPermissionIds}</p>
                </div>
              )}
              
              <div className="space-y-6">
                {sortedScreens.map((screen) => {
                  const screenId = screen.id;
                  const screenName = screen.name || `Pantalla sin nombre`;
                  const screenCode = screen.code || '';
                  const permissions = screen.permissions || [];
                  
                  const isExpanded = expandedScreens[screenId] || false;
                  
                  // Calcular si todos los permisos de esta pantalla están seleccionados
                  const allSelected = permissions.length > 0 && permissions.every((permission: ExtendedPermission) => 
                    formData.screenPermissionPairs.some(p => p.screenId === screenId && p.permissionId === Number(permission.id))
                  );
                  
                  return (
                    <div key={screenId} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden mb-3">
                      <div 
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                        onClick={() => toggleScreenExpansion(screenId)}
                      >
                        <div className="flex items-center">
                          {isExpanded ? 
                            <ChevronDownIcon className="h-4 w-4 mr-2" /> : 
                            <ChevronRightIcon className="h-4 w-4 mr-2" />
                          }
                          <h3 className="font-medium">{screenName}</h3>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            {screenCode}
                          </span>
                          <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                            {permissions.length} permisos
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`screen-${screenId}`}
                            checked={allSelected}
                            onChange={(e) => handleSelectAllScreenPermissions(screenId, permissions, e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                            onClick={(e) => e.stopPropagation()} // Evitar que se expanda/colapse al hacer clic en el checkbox
                          />
                          <label htmlFor={`screen-${screenId}`} className="text-sm" onClick={(e) => e.stopPropagation()}>
                            Seleccionar todos
                          </label>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-3 bg-white dark:bg-gray-900">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {permissions.map((permission: ExtendedPermission) => {
                              // Extraer los datos del permiso
                              const permId = permission.id;
                              const permName = permission.name || `Permiso sin nombre`;
                              const permDescription = permission.description || '';
                              const screenPermissionId = permission.screenPermissionId || 0;
                              
                              // Verificar si este permiso está seleccionado
                              const isChecked = formData.screenPermissionPairs.some(
                                p => p.screenId === screenId && p.permissionId === Number(permId)
                              );
                              
                              return (
                                <div 
                                  key={`${screenId}-${permId}`} 
                                  className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700"
                                >
                                  <input
                                    type="checkbox"
                                    id={`permission-${screenId}-${permId}`}
                                    value={`${screenPermissionId}-${permId}`}
                                    checked={isChecked}
                                    onChange={(e) => handlePermissionChange(e, screenId)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor={`permission-${screenId}-${permId}`} className="ml-2 block">
                                    <span className="font-medium">{permName}</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{permDescription}</p>
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
