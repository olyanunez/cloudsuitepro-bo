'use client';

import { useState, useEffect } from 'react';
import { Permission, RoleCreateInput } from '@/lib/types/role';
import { RoleService } from '@/lib/services/roleService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateRolePage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [screensWithPermissions, setScreensWithPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [expandedScreens, setExpandedScreens] = useState<Record<number, boolean>>({});
  const [formData, setFormData] = useState<RoleCreateInput>({
    name: '',
    code: '',
    description: '',
    screenPermissionIds: []
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
        // Cargar permisos para compatibilidad con código existente
        const permissionsData = await RoleService.getPermissions();
        setPermissions(permissionsData);
        
        // Cargar pantallas con sus permisos asociados
        const screensData = await RoleService.getScreensWithPermissions();
        console.log('Datos recibidos en el componente:', screensData);
        
        // Procesar y agrupar los datos para evitar pantallas duplicadas
        const screenMap = new Map();
        
        screensData.forEach((item) => {
          // Extraer la información de la pantalla
          const screenId = item.id || item.screenId || (item.screen && item.screen.id);
          const screenName = item.name || item.screenName || (item.screen && item.screen.name);
          const screenCode = item.code || item.screenCode || (item.screen && item.screen.code);
          
          // Extraer los permisos
          let permissions = [];
          if (Array.isArray(item.permissions)) {
            permissions = item.permissions;
          } else if (item.screenPermissions && Array.isArray(item.screenPermissions)) {
            permissions = item.screenPermissions;
          } else if (item.permissions && typeof item.permissions === 'object') {
            permissions = Object.values(item.permissions);
          }
          
          // Si ya existe esta pantalla en el mapa, agregar los permisos
          if (screenId && screenMap.has(screenId)) {
            const existingScreen = screenMap.get(screenId);
            const existingPermIds = new Set(existingScreen.permissions.map(p => p.id || p.permissionId));
            
            // Agregar solo permisos que no existan ya
            permissions.forEach(perm => {
              const permId = perm.id || perm.permissionId;
              if (!existingPermIds.has(permId)) {
                existingScreen.permissions.push(perm);
                existingPermIds.add(permId);
              }
            });
          } else if (screenId) {
            // Si no existe, crear una nueva entrada
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
        uniqueScreensData.forEach((screen) => {
          initialExpandedState[screen.id] = false; // Todas las pantallas inician colapsadas
        });
        setExpandedScreens(initialExpandedState);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      const updatedScreenPermissionIds = checked 
        ? [...prev.screenPermissionIds, Number(value)]
        : prev.screenPermissionIds.filter(id => id !== Number(value));
      
      return { ...prev, screenPermissionIds: updatedScreenPermissionIds };
    });
    
    // Clear error when user selects permissions
    if (errors.screenPermissionIds) {
      setErrors(prev => ({ ...prev, screenPermissionIds: undefined }));
    }
  };
  
  // Función para seleccionar/deseleccionar todos los permisos de una pantalla
  const handleSelectAllScreenPermissions = (screenId: number, permissions: Permission[], checked: boolean) => {
    const permissionIds = permissions.map(p => p.id);
    
    setFormData(prev => {
      let updatedScreenPermissionIds = [...prev.screenPermissionIds];
      
      if (checked) {
        // Agregar todos los permisos que no estén ya seleccionados
        permissionIds.forEach(id => {
          if (!updatedScreenPermissionIds.includes(id)) {
            updatedScreenPermissionIds.push(id);
          }
        });
      } else {
        // Quitar todos los permisos de esta pantalla
        updatedScreenPermissionIds = updatedScreenPermissionIds.filter(
          id => !permissionIds.includes(id)
        );
      }
      
      return { ...prev, screenPermissionIds: updatedScreenPermissionIds };
    });
    
    // Clear error when user selects permissions
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del rol es requerido';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'El código del rol es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (formData.screenPermissionIds.length === 0) {
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
      await RoleService.createRole(formData);
      router.push('/roles');
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Ocurrió un error al crear el rol. Por favor intente nuevamente.');
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Link href="/roles">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Crear Nuevo Rol</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Información del Rol</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Rol <span className="text-red-500">*</span>
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
                    placeholder="Código del rol (ej: ADMIN, EDITOR)"
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
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Permisos</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.screenPermissionIds.length} seleccionados
                </div>
              </div>
              
              {errors.screenPermissionIds && (
                <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.screenPermissionIds}</p>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Vista de pantallas con permisos */}
                {screensWithPermissions && screensWithPermissions.length > 0 ? (
                  screensWithPermissions.map((screen) => {
                    const screenId = screen.id;
                    const screenName = screen.name || `Pantalla sin nombre`;
                    const screenCode = screen.code || '';
                    const permissions = screen.permissions || [];
                    
                    const isExpanded = expandedScreens[screenId] || false;
                    
                    // Calcular si todos los permisos de esta pantalla están seleccionados
                    const permissionIds = permissions.map(p => p.id || p.permissionId);
                    const allSelected = permissionIds.length > 0 && permissionIds.every(id => 
                      formData.screenPermissionIds.includes(Number(id))
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
                              {permissions.map((permission) => {
                                // Extraer los datos del permiso independientemente de la estructura
                                const permId = permission.id || permission.permissionId;
                                const permName = permission.name || permission.permissionName || `Permiso sin nombre`;
                                const permDescription = permission.description || permission.permissionDescription || '';
                                
                                return (
                                  <div 
                                    key={`${screenId}-${permId}`} 
                                    className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`permission-${permId}`}
                                      value={permId}
                                      checked={formData.screenPermissionIds.includes(Number(permId))}
                                      onChange={handlePermissionChange}
                                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor={`permission-${permId}`} className="ml-2 block">
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
                  })
                ) : (
                  // Vista alternativa agrupada por módulo (como respaldo)
                  Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
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
                              checked={formData.screenPermissionIds.includes(permission.id)}
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link href="/roles">
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
                Guardar Rol
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
