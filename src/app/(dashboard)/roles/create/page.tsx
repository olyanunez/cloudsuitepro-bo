'use client';

import { useState, useEffect } from 'react';
import { Permission, RoleCreateInput } from '@/lib/types/role';
import { RoleService } from '@/lib/services/roleService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Tipo extendido para permisos con screenPermissionId
type ExtendedPermission = Permission & { screenPermissionId?: number };

// Tipo para pantallas con permisos
interface ScreenWithPermissions {
  id: number;
  name: string;
  code: string;
  permissions: ExtendedPermission[];
}

export default function CreateRolePage() {
  const router = useRouter();
  const [screensWithPermissions, setScreensWithPermissions] = useState<ScreenWithPermissions[]>([]);
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
        const screensData = await RoleService.getScreensWithPermissions();
        console.log('Datos recibidos:', screensData);
        setScreensWithPermissions(screensData);

        // Inicializar el estado de expansión de pantallas
        const initialExpandedState: Record<number, boolean> = {};
        screensData.forEach((screen) => {
          initialExpandedState[screen.id] = false;
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

  const handlePermissionChange = (screenPermissionId: number, checked: boolean) => {
    setFormData(prev => {
      let updatedIds = [...prev.screenPermissionIds];

      if (checked) {
        if (!updatedIds.includes(screenPermissionId)) {
          updatedIds.push(screenPermissionId);
        }
      } else {
        updatedIds = updatedIds.filter(id => id !== screenPermissionId);
      }

      return {
        ...prev,
        screenPermissionIds: updatedIds
      };
    });

    if (errors.screenPermissionIds) {
      setErrors(prev => ({ ...prev, screenPermissionIds: undefined }));
    }
  };

  const handleSelectAllScreenPermissions = (permissions: ExtendedPermission[], checked: boolean) => {
    const screenPermissionIds = permissions
      .map(p => p.screenPermissionId)
      .filter((id): id is number => id !== undefined);

    setFormData(prev => {
      let updatedIds = [...prev.screenPermissionIds];

      if (checked) {
        screenPermissionIds.forEach(spId => {
          if (!updatedIds.includes(spId)) {
            updatedIds.push(spId);
          }
        });
      } else {
        updatedIds = updatedIds.filter(id => !screenPermissionIds.includes(id));
      }

      return {
        ...prev,
        screenPermissionIds: updatedIds
      };
    });

    if (errors.screenPermissionIds) {
      setErrors(prev => ({ ...prev, screenPermissionIds: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre del rol es requerido';
    }

    if (!formData.code?.trim()) {
      newErrors.code = 'El código del rol es requerido';
    }

    if (!formData.description?.trim()) {
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
      console.log('Enviando datos:', formData);
      await RoleService.createRole(formData);
      router.push('/roles');
    } catch (error: any) {
      console.error('Error creating role:', error);
      alert(error.message || 'Ocurrió un error al crear el rol. Por favor intente nuevamente.');
    } finally {
      setSaving(false);
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

              <div className="space-y-3">
                {screensWithPermissions.map((screen) => {
                  const isExpanded = expandedScreens[screen.id] || false;

                  // Verificar si todos los permisos de esta pantalla están seleccionados
                  const screenPermissionIds = screen.permissions
                    .map(p => p.screenPermissionId)
                    .filter((id): id is number => id !== undefined);
                  const allSelected = screenPermissionIds.length > 0 &&
                    screenPermissionIds.every(id => formData.screenPermissionIds.includes(id));

                  return (
                    <div key={screen.id} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      <div
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750"
                        onClick={() => toggleScreenExpansion(screen.id)}
                      >
                        <div className="flex items-center">
                          {isExpanded ?
                            <ChevronDownIcon className="h-4 w-4 mr-2" /> :
                            <ChevronRightIcon className="h-4 w-4 mr-2" />
                          }
                          <h3 className="font-medium">{screen.name}</h3>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            {screen.code}
                          </span>
                          <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                            {screen.permissions.length} permisos
                          </span>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`screen-${screen.id}`}
                            checked={allSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectAllScreenPermissions(screen.permissions, e.target.checked);
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label
                            htmlFor={`screen-${screen.id}`}
                            className="text-sm cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Seleccionar todos
                          </label>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-3 bg-white dark:bg-gray-900">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {screen.permissions.map((permission) => {
                              const screenPermissionId = permission.screenPermissionId;
                              if (!screenPermissionId) return null;

                              return (
                                <div
                                  key={screenPermissionId}
                                  className="flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700"
                                >
                                  <input
                                    type="checkbox"
                                    id={`permission-${screenPermissionId}`}
                                    checked={formData.screenPermissionIds.includes(screenPermissionId)}
                                    onChange={(e) => handlePermissionChange(screenPermissionId, e.target.checked)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor={`permission-${screenPermissionId}`} className="ml-2 block flex-1 cursor-pointer">
                                    <span className="font-medium">{permission.name}</span>
                                    {permission.description && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</p>
                                    )}
                                    <p className="text-xs text-blue-500 dark:text-blue-400">ID: {screenPermissionId}</p>
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
