'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!email) {
            toast.error('Por favor ingresa tu correo electrónico');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Código de recuperación enviado', {
                    description: 'Revisa tu correo electrónico',
                });
                // Redirigir a la página de reset password
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                toast.error(data.message || 'Error al enviar el código');
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
                            src="/branding/transparente/cloudsuitepro_logo1.png"
                            alt="CloudSuite Pro"
                            width={200}
                            height={60}
                            priority
                            className="h-30 w-auto"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">¿Olvidaste tu contraseña?</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Ingresa tu correo electrónico y te enviaremos un código de recuperación
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-primary hover:bg-primary-600 text-gray-900 dark:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Código'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <Link href="/login" className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
