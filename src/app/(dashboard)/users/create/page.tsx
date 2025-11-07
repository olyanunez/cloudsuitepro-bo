'use client';

import { useState, useEffect } from 'react';
import { UserCreateInput } from '@/lib/types/user';
import { UserService } from '@/lib/services/userService';
import { RoleService } from '@/lib/services/roleService';
import { Role } from '@/lib/types/role';
import { AvatarUpload } from '@/components/users/AvatarUpload';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateUserPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserCreateInput & { confirmPassword: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    avatar: ''
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

  useEffect(() => {
    async function loadRoles() {
      try {
        const rolesData = await RoleService.getRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error('Error loading roles data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRoles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }
    
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
    
    // Preparar datos para enviar (sin incluir confirmPassword)
    const userData: UserCreateInput = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      roleId: formData.roleId,
      avatar: formData.avatar
    };

    try {
      setSaving(true);
      await UserService.createUser(userData, avatarFile);
      router.push('/users');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Ocurrió un error al crear el usuario. Por favor intente nuevamente.');
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
        <Link href="/users">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Crear Nuevo Usuario</h1>
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
                    currentAvatar={avatarPreview}
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
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                    placeholder="Contraseña"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700`}
                    placeholder="Confirmar contraseña"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
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
          <Link href="/users">
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
                Crear Usuario
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
