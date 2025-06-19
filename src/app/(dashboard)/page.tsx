'use client';


import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UsersIcon, ShieldIcon, LayoutDashboardIcon } from 'lucide-react';

export default function DashboardPage() {

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full mr-4">
              <LayoutDashboardIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold">Panel Principal</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Bienvenido al panel de administración de Xotica. Desde aquí podrás gestionar todos los aspectos de la plataforma.
          </p>
          <div className="mt-4">
            <Button className="w-full">
              Ver Estadísticas
            </Button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
              <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">Usuarios</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Gestiona los usuarios de la plataforma, crea nuevos usuarios, edita sus perfiles o cambia sus permisos.
          </p>
          <div className="mt-4">
            <Link href="/users">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Gestionar Usuarios
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
              <ShieldIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold">Roles</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Configura los roles y permisos para los diferentes tipos de usuarios en la plataforma.
          </p>
          <div className="mt-4">
            <Link href="/roles">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Gestionar Roles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
