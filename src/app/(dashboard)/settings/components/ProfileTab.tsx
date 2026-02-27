'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Save, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ProfileService, { UserProfile, UpdateProfileDto } from '@/lib/services/profileService';
import { AvatarUpload } from '@/components/users/AvatarUpload';

export default function ProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UpdateProfileDto>({
    name: '',
    lastName: '',
    email: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await ProfileService.getMyProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        lastName: data.lastName || '',
        email: data.email || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (file: File | null, previewUrl: string | null) => {
    setAvatarFile(file);
    setAvatarPreview(previewUrl);
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name?.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.email?.trim()) {
      toast.error('El correo electrónico es requerido');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('El correo electrónico no es válido');
      return;
    }

    try {
      setSaving(true);
      const updatedProfile = await ProfileService.updateMyProfile(formData, avatarFile);
      setProfile(updatedProfile);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo actualizar el perfil';
      toast.error('Error al actualizar perfil', {
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!passwordData.currentPassword) {
      toast.error('Ingresa tu contraseña actual');
      return;
    }

    if (!passwordData.newPassword) {
      toast.error('Ingresa una nueva contraseña');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setSaving(true);

      await ProfileService.changePassword(passwordData.currentPassword, passwordData.newPassword);

      toast.success('Contraseña actualizada correctamente', {
        description: 'Tu contraseña ha sido cambiada exitosamente',
      });

      // Limpiar formulario
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordSection(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo cambiar la contraseña';
      toast.error('Error al cambiar contraseña', {
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Cargando perfil...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Actualiza tu información personal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitProfile} className="space-y-4">
            {/* Avatar */}
            <div className="space-y-2">
              <Label>Foto de Perfil</Label>
              <AvatarUpload
                currentAvatar={avatarPreview || profile?.avatar}
                onImageChange={handleAvatarChange}
              />
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Correo Electrónico <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Botón Guardar */}
            <Button type="submit" disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Información de la Cuenta */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
            <CardDescription>Detalles de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Rol</Label>
              <p className="font-medium">{profile?.role?.name || 'Sin rol asignado'}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Estado</Label>
              <p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile?.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                >
                  {profile?.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground">Fecha de Registro</Label>
              <p className="font-medium">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                  : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seguridad - Cambiar Contraseña */}
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>Administra la seguridad de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            {!showPasswordSection ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordSection(true)}
                className="w-full"
              >
                <Lock className="mr-2 h-4 w-4" />
                Cambiar Contraseña
              </Button>
            ) : (
              <form onSubmit={handleSubmitPassword} className="space-y-4">
                {/* Contraseña Actual */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10"
                      placeholder="Tu contraseña actual"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                      }
                      className="absolute right-3 top-3 !bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nueva Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10"
                      placeholder="Nueva contraseña (mínimo 6 caracteres)"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                      }
                      className="absolute right-3 top-3 !bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="pl-10 pr-10"
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                      }
                      className="absolute right-3 top-3 !bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
