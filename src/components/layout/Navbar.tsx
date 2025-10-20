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
import { AuthService } from '@/lib/services/authService'
import { useTenant } from '@/lib/contexts/TenantContext'
import { BuildingIcon, MenuIcon, UserIcon } from 'lucide-react'
import { LogoutIcon, NotificationIcon, Icon } from './Icons'

// Definición de los elementos del menú
const menuItems = [
  { name: 'Usuarios', href: '/users', icon: 'user-cog' },
  { name: 'Roles', href: '/roles', icon: 'shield' },
  {
    name: 'Inventario',
    href: '/inventory',
    icon: 'archive',
    submenu: [
      { name: 'Inventario', href: '/inventory/items', icon: 'box' },
      // { name: 'Dashboard', href: '/inventory', icon: 'layout-dashboard' },s
      { name: 'Categorías', href: '/inventory/categories', icon: 'tag' },
      { name: 'Productos', href: '/inventory/products', icon: 'shopping-bag' },
      { name: 'Almacenes', href: '/inventory/warehouses', icon: 'building' },
      { name: 'Movimientos', href: '/inventory/movements', icon: 'repeat' },
      { name: 'Reportes', href: '/inventory/reports', icon: 'bar-chart-2' },
    ]
  },
  { name: 'Órdenes', href: '/orders', icon: 'shopping-bag' },
  { name: 'Clientes', href: '/customers', icon: 'users' },
  { name: 'Configuración', href: '/settings', icon: 'settings' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({})
  const pathname = usePathname()
  const { tenantId, tenantName } = useTenant()

  // Inicializar submenús abiertos basados en la ruta actual
  React.useEffect(() => {
    const newOpenSubmenus: Record<string, boolean> = {}
    menuItems.forEach(item => {
      if (item.submenu && (pathname === item.href || pathname.startsWith(item.href + '/'))) {
        newOpenSubmenus[item.href] = true
      }
    })
    setOpenSubmenus(newOpenSubmenus)
  }, [pathname])

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
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${pathname === item.href || pathname.startsWith(item.href + '/')
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-500 dark:text-gray-400"
                    } flex items-center gap-1`}
                >
                  {item.name}
                  {item.submenu && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-3 w-3 transition duration-200 group-hover:rotate-180">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  )}
                </Link>
                {item.submenu && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-md border border-gray-200 bg-white p-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 dark:border-gray-800 dark:bg-gray-950">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${pathname === subItem.href ? 'bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                      >
                        <Icon name={subItem.icon} className="h-4 w-4" />
                        <span>{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {tenantId && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <BuildingIcon className="h-4 w-4" />
                <span>{tenantName || `Empresa ${tenantId}`}</span>
              </div>
            )}
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
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isSubmenuOpen = !!openSubmenus[item.href];

              return (
                <div key={item.href} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    {item.submenu ? (
                      <button
                        onClick={() => {
                          const newOpenSubmenus = { ...openSubmenus };
                          newOpenSubmenus[item.href] = !isSubmenuOpen;
                          setOpenSubmenus(newOpenSubmenus);
                        }}
                        className={`flex items-center gap-2 px-2 py-1 rounded-md w-full text-left ${isActive
                          ? "bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100"
                          : "text-gray-600 hover:bg-primary-50 dark:text-gray-300 dark:hover:bg-primary-900/20"
                          }`}
                      >
                        <Icon name={item.icon} />
                        <span>{item.name}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`ml-auto h-4 w-4 transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    ) : (
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 px-2 py-1 rounded-md w-full ${isActive
                            ? "bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100"
                            : "text-gray-600 hover:bg-primary-50 dark:text-gray-300 dark:hover:bg-primary-900/20"
                            }`}
                        >
                          <Icon name={item.icon} />
                          <span>{item.name}</span>
                        </Link>
                      </SheetClose>
                    )}
                  </div>

                  {item.submenu && isSubmenuOpen && (
                    <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-gray-200 dark:border-gray-700 pl-2">
                      {item.submenu.map((subItem) => (
                        <SheetClose asChild key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm ${pathname === subItem.href
                              ? "bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100"
                              : "text-gray-600 hover:bg-primary-50 dark:text-gray-300 dark:hover:bg-primary-900/20"
                              }`}
                          >
                            <Icon name={subItem.icon} className="h-4 w-4" />
                            <span>{subItem.name}</span>
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  )}
                </div>
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
