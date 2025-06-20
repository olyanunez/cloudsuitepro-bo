'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Asegurarse de que estamos en el cliente antes de acceder a localStorage
    if (typeof window !== 'undefined') {
      // Verificar si el usuario está autenticado
      const isLoggedIn = localStorage.getItem('auth_token');

      // const isLoggedIn = localStorage.getItem('auth_token');
      if (isLoggedIn) {
        // Si está autenticado, redirigir al dashboard
        router.push('/dashboard');
      } else {
        // Si no está autenticado, redirigir al login
        router.push('/login');
      }
    }
  }, [router]);

  // This will be shown briefly before redirecting
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="mb-8">
          <Image
            className="dark:invert mx-auto"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
        </div>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">Redirigiendo...</p>
      </div>
    </div>
  );
}
