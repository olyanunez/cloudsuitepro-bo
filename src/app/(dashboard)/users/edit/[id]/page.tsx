'use client';

import { useState, useEffect } from 'react';
import { User, UserUpdateInput } from '@/lib/types/user';
import { UserService } from '@/lib/services/userService';
import { RoleService } from '@/lib/services/roleService';
import { Role } from '@/lib/types/role';
import { AvatarUpload } from '@/components/users/AvatarUpload';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
// Usamos elementos HTML estándar en lugar de componentes UI personalizados

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserUpdateInput & { confirmPassword?: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    avatar: '',
    isActive: true
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    roleId?: string;
  }>({});
  const [changePassword, setChangePassword] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, rolesData] = await Promise.all([
          UserService.getUserById(userId),
          RoleService.getRoles()
        ]);
        
        if (!userData) {
          router.push('/users');
          return;
        }
        
        setUser(userData);
        setRoles(rolesData);
        
        // Initialize form data
        setFormData({
          name: userData.name,
          email: userData.email,
          roleId: userData.roleId,
          avatar: userData.avatar || '',
          isActive: userData.isActive
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadData();
    }
  }, [userId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handlePasswordSwitchChange = (checked: boolean) => {
    setChangePassword(checked);
    if (!checked) {
      // Clear password fields if user decides not to change password
      setFormData(prev => ({
        ...prev,
        password: undefined,
        confirmPassword: undefined
      }));
      setErrors(prev => ({
        ...prev,
        password: undefined,
        confirmPassword: undefined
      }));
    }
  };

  const handleAvatarChange = (file: File | null, previewUrl: string | null) => {
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
  };

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      roleId?: string;
    } = {};
    
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }
    
    if (changePassword) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Debe confirmar la contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    
    if (!formData.roleId) {
      newErrors.roleId = 'Debe seleccionar un rol';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Extraer solo los datos necesarios para la API, omitiendo confirmPassword
    const userData: UserUpdateInput = {};
    
    // Copiar solo las propiedades que necesitamos
    if (formData.name) userData.name = formData.name;
    if (formData.email) userData.email = formData.email;
    if (changePassword && formData.password) userData.password = formData.password;
    if (formData.roleId) userData.roleId = formData.roleId;
    if (formData.avatar !== undefined) userData.avatar = formData.avatar;
    userData.isActive = formData.isActive;
    
    // Si no se está cambiando la contraseña, eliminarla del objeto
    if (!changePassword) {
      delete userData.password;
    }
    
    try {
      setSaving(true);
      await UserService.updateUser(userId, userData, avatarFile);
      toast.success('Usuario actualizado exitosamente');
      router.push(`/users/${userId}`);
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = error?.message || 'Ocurrió un error al actualizar el usuario. Por favor intente nuevamente.';
      toast.error(errorMessage);
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
      <div className="mb-6 flex items-center">
        <Link href={`/users/${userId}`}>
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar Usuario</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Foto de Perfil
                  </label>
                  <AvatarUpload
                    currentAvatar={avatarPreview || user?.avatar}
                    onImageChange={handleAvatarChange}
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Nombre Completo <span className="text-red-500">*</span>
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
                    placeholder="Nombre completo"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="changePassword" className="text-sm font-medium">
                      Cambiar contraseña
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Activar para establecer una nueva contraseña
                    </p>
                  </div>
                  <Switch
                    id="changePassword"
                    checked={changePassword}
                    onCheckedChange={handlePasswordSwitchChange}
                  />
                </div>
                
                {changePassword && (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium mb-1">
                        Nueva Contraseña <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                        placeholder="Nueva contraseña"
                      />
                      {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                        Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword || ''}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                        placeholder="Confirmar nueva contraseña"
                      />
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive" className="text-sm font-medium">
                        Usuario Activo
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Los usuarios inactivos no pueden iniciar sesión en el sistema
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={handleSwitchChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Rol y Permisos</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="roleId" className="block text-sm font-medium mb-1">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="roleId"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.roleId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {errors.roleId && <p className="mt-1 text-sm text-red-500">{errors.roleId}</p>}
                </div>
                
                {formData.roleId && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Descripción del Rol</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {roles.find(r => r.id === formData.roleId)?.description || 'Sin descripción'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link href={`/users/${userId}`}>
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
