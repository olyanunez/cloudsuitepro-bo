'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordForm() {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!code || !newPassword || !confirmPassword) {
            toast.error('Por favor completa todos los campos');
            setIsLoading(false);
            return;
        }

        if (code.length !== 6) {
            toast.error('El código debe tener 6 dígitos');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Contraseña actualizada exitosamente', {
                    description: 'Ya puedes iniciar sesión con tu nueva contraseña',
                });
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                toast.error(data.message || 'Error al resetear la contraseña');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al procesar la solicitud');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 px-4">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center">
                        <Image
                            src="/xotica_logo.png"
                            alt="Xotica Business"
                            width={200}
                            height={60}
                            priority
                            className="h-30 w-auto"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Restablecer Contraseña</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {email ? `Código enviado a ${email}` : 'Ingresa el código que recibiste por correo'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Código de Verificación
                        </label>
                        <input
                            id="code"
                            name="code"
                            type="text"
                            required
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm text-center text-2xl font-bold tracking-widest"
                            placeholder="000000"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Ingresa el código de 6 dígitos que recibiste por email
                        </p>
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nueva Contraseña
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full px-3 py-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirmar Contraseña
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full px-3 py-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary hover:bg-primary-600 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Actualizando...' : 'Restablecer Contraseña'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4 space-y-2">
                    <Link href="/forgot-password" className="block text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500">
                        ¿No recibiste el código? Solicitar nuevo código
                    </Link>
                    <Link href="/login" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
