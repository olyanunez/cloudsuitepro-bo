"use client"

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Icon, MenuIcon, NotificationIcon, UserIcon, LogoutIcon } from './Icons'
import { AuthService } from '@/lib/services/authService'

// Definición de los elementos del menú
const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'grid' },
  { name: 'Usuarios', href: '/users', icon: 'user-cog' },
  { name: 'Roles', href: '/roles', icon: 'shield' },
  { name: 'Productos', href: '/products', icon: 'box' },
  { name: 'Órdenes', href: '/orders', icon: 'shopping-bag' },
  { name: 'Clientes', href: '/customers', icon: 'users' },
  { name: 'Configuración', href: '/settings', icon: 'settings' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-gray-950 dark:border-gray-800">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <SheetTrigger onClick={() => setOpen(true)} className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-primary-600 dark:text-primary-400">Xotica</span>
            </Link>
          </div>
          
          {/* Navegación de escritorio */}
          <nav className="hidden md:flex gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  pathname === item.href
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <NotificationIcon />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon">
              <UserIcon />
              <span className="sr-only">Account</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Drawer para móvil */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[240px] sm:w-[300px]">
          <nav className="flex flex-col gap-4 mt-8">
            {menuItems.map((item) => {
              return (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                      pathname === item.href
                        ? "bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100"
                        : "text-gray-600 hover:bg-primary-50 dark:text-gray-300 dark:hover:bg-primary-900/20"
                    }`}
                  >
                    <Icon name={item.icon} />
                    <span>{item.name}</span>
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
          <div className="absolute bottom-4 w-full pr-8">
            <Button variant="outline" className="w-full" onClick={() => {
              AuthService.logout();
              window.location.href = '/login';
              setOpen(false);
            }}>
              <LogoutIcon className="mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

// El componente Icon ahora se importa desde './Icons'
