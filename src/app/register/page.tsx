'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Stepper } from '@/components/ui/stepper';
import { AuthService } from '@/lib/services/authService';

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-3xl space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Registro de Empresa</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Crea tu empresa y cuenta de administrador
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Stepper - Pasos del registro */}
          <div className="md:w-1/4">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>

          {/* Formulario */}
          <div className="md:w-3/4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentStep === 0 ? 'Información de la Empresa' : 'Información del Administrador'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-sm mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Paso 1: Información de la Empresa */}
                  {currentStep === 0 && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                          <Input
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Nombre de la empresa"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="companyTaxId">ID Fiscal / NIT *</Label>
                          <Input
                            id="companyTaxId"
                            value={companyTaxId}
                            onChange={(e) => setCompanyTaxId(e.target.value)}
                            placeholder="ID fiscal o NIT"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="companyEmail">Correo Electrónico *</Label>
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
                          <Label htmlFor="companyPhone">Teléfono</Label>
                          <Input
                            id="companyPhone"
                            value={companyPhone}
                            onChange={(e) => setCompanyPhone(e.target.value)}
                            placeholder="Teléfono de contacto"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="companyAddress">Dirección</Label>
                        <Input
                          id="companyAddress"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          placeholder="Dirección de la empresa"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="companyDescription">Descripción</Label>
                        <Textarea
                          id="companyDescription"
                          value={companyDescription}
                          onChange={(e) => setCompanyDescription(e.target.value)}
                          placeholder="Breve descripción de la empresa"
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}

                  {/* Paso 2: Información del Administrador */}
                  {currentStep === 1 && (
                    <>
                      <div>
                        <Label htmlFor="adminName">Nombre Completo *</Label>
                        <Input
                          id="adminName"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder="Nombre del administrador"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="adminEmail">Correo Electrónico *</Label>
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
                        <Label htmlFor="adminPassword">Contraseña *</Label>
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
                        <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
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

                  <CardFooter className="flex justify-between pt-4 px-0">
                    {currentStep > 0 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handlePrevStep}
                      >
                        Anterior
                      </Button>
                    )}
                    
                    <div className="ml-auto">
                      {currentStep === 0 ? (
                        <Button type="button" onClick={handleNextStep}>
                          Siguiente
                        </Button>
                      ) : (
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Registrando...' : 'Completar Registro'}
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
