'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Stepper } from '@/components/ui/stepper';
import { AuthService } from '@/lib/services/authService';
import { Sparkles, TrendingUp, Shield } from 'lucide-react';

export default function RegisterPage() {
  // Estado para controlar el paso actual
  const [currentStep, setCurrentStep] = useState(0);

  // Estados para la información de la empresa (Tenant)
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyTaxId, setCompanyTaxId] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  // Estados para la información del administrador
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Definición de los pasos
  const steps = [
    {
      title: 'Información de la Empresa',
      description: 'Datos de la empresa o negocio'
    },
    {
      title: 'Información del Administrador',
      description: 'Datos de acceso del administrador'
    }
  ];

  // Función para validar el primer paso (información de la empresa)
  const validateCompanyStep = () => {
    if (!companyName) {
      setError('El nombre de la empresa es obligatorio');
      return false;
    }
    if (!companyEmail) {
      setError('El correo electrónico de la empresa es obligatorio');
      return false;
    }
    if (!companyTaxId) {
      setError('El ID fiscal de la empresa es obligatorio');
      return false;
    }
    return true;
  };

  // Función para validar el segundo paso (información del administrador)
  const validateAdminStep = () => {
    if (!adminName) {
      setError('El nombre del administrador es obligatorio');
      return false;
    }
    if (!adminEmail) {
      setError('El correo electrónico del administrador es obligatorio');
      return false;
    }
    if (!adminPassword) {
      setError('La contraseña es obligatoria');
      return false;
    }
    if (adminPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  // Función para avanzar al siguiente paso
  const handleNextStep = () => {
    setError('');
    if (currentStep === 0) {
      if (validateCompanyStep()) {
        setCurrentStep(1);
      }
    }
  };

  // Función para volver al paso anterior
  const handlePrevStep = () => {
    setError('');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar el paso del administrador si estamos en ese paso
    if (currentStep === 1 && !validateAdminStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar los datos para el registro
      const registerData = {
        tenant: {
          name: companyName,
          address: companyAddress,
          phone: companyPhone,
          email: companyEmail,
          taxId: companyTaxId,
          description: companyDescription
        },
        admin: {
          name: adminName,
          email: adminEmail,
          password: adminPassword
        }
      };

      // Llamar al servicio de autenticación para registrar
      await AuthService.register(registerData);

      toast.success('Registro exitoso. ¡Bienvenido! Tu empresa ha sido registrada correctamente.');

      // Redirigir al dashboard después del registro
      router.push('/dashboard');
    } catch (error) {
      console.error('Error en registro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar. Por favor intente nuevamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-row-reverse">
      {/* Lado derecho - Formulario con fondo amarillo degradado */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Título */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 text-center">Registro</h2>
              <p className="text-sm text-gray-600 text-center mt-1">
                Crea tu cuenta empresarial
              </p>
            </div>

            {/* Stepper */}
            <div className="mb-6">
              <Stepper steps={steps} currentStep={currentStep} />
            </div>

            {/* Mensajes de error */}
            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm mb-4 border border-red-200">
                {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Paso 1: Información de la Empresa */}
              {currentStep === 0 && (
                <>
                  <div>
                    <Label htmlFor="companyName" className="text-sm font-medium">
                      Nombre de la Empresa *
                    </Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Nombre de la empresa"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyTaxId" className="text-sm font-medium">
                      ID Fiscal / NIT *
                    </Label>
                    <Input
                      id="companyTaxId"
                      value={companyTaxId}
                      onChange={(e) => setCompanyTaxId(e.target.value)}
                      placeholder="ID fiscal o NIT"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyEmail" className="text-sm font-medium">
                      Correo Electrónico *
                    </Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="correo@empresa.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyPhone" className="text-sm font-medium">
                      Teléfono
                    </Label>
                    <Input
                      id="companyPhone"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="Teléfono de contacto"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyAddress" className="text-sm font-medium">
                      Dirección
                    </Label>
                    <Input
                      id="companyAddress"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Dirección de la empresa"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyDescription" className="text-sm font-medium">
                      Descripción
                    </Label>
                    <Textarea
                      id="companyDescription"
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="Breve descripción de la empresa"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Paso 2: Información del Administrador */}
              {currentStep === 1 && (
                <>
                  <div>
                    <Label htmlFor="adminName" className="text-sm font-medium">
                      Nombre Completo *
                    </Label>
                    <Input
                      id="adminName"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Nombre del administrador"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminEmail" className="text-sm font-medium">
                      Correo Electrónico *
                    </Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminPassword" className="text-sm font-medium">
                      Contraseña *
                    </Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmar Contraseña *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              {/* Botones de navegación */}
              <div className="flex justify-between pt-6">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    className="w-24"
                  >
                    Anterior
                  </Button>
                )}

                <div className={currentStep === 0 ? 'ml-auto' : ''}>
                  {currentStep === 0 ? (
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      style={{
                        backgroundColor: '#eab308',
                        color: 'white',
                        borderColor: '#eab308'
                      }}
                      className="px-8 font-semibold hover:opacity-90 transition-opacity"
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        backgroundColor: '#eab308',
                        color: 'white',
                        borderColor: '#eab308'
                      }}
                      className="px-8 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSubmitting ? 'Registrando...' : 'Completar Registro'}
                    </Button>
                  )}
                </div>
              </div>
            </form>

            {/* Link a login */}
            <div className="text-center mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="font-medium text-yellow-600 hover:text-yellow-700">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lado izquierdo - Contenido promocional */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900  justify-center">
        <div className="max-w-xl text-white">
          {/* Logo */}
          <div className="mb-2 flex justify-center">
            <Image
              src="/xotica_logo.png"
              alt="Xotica Business"
              width={800}
              height={240}
              priority
              className="h-56 w-auto"
            />
          </div>

          {/* Título principal */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 leading-tight text-center">
              Transforma tu negocio con la mejor plataforma
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              La plataforma todo-en-uno para gestionar tu inventario, ventas y
              reportes. Comienza gratis y lleva tu negocio al siguiente nivel.
            </p>
          </div>

          {/* Características destacadas */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-500 rounded-lg p-3 flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Fácil de usar</h3>
                <p className="text-gray-400">
                  Interfaz intuitiva diseñada para que comiences en minutos
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-yellow-500 rounded-lg p-3 flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Aumenta tus ventas</h3>
                <p className="text-gray-400">
                  Herramientas poderosas para optimizar tu negocio
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-yellow-500 rounded-lg p-3 flex-shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">100% Seguro</h3>
                <p className="text-gray-400">
                  Tus datos protegidos con los más altos estándares
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas o testimonios */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-yellow-400">500+</p>
                <p className="text-sm text-gray-400 mt-1">Empresas confían</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">99.9%</p>
                <p className="text-sm text-gray-400 mt-1">Disponibilidad</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">24/7</p>
                <p className="text-sm text-gray-400 mt-1">Soporte</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
