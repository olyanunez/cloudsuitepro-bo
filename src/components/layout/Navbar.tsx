"use client"

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AuthService } from '@/lib/services/authService'
import { PermissionService } from '@/lib/services/permissionService'
import { useTenant } from '@/lib/contexts/TenantContext'
import { BuildingIcon, MenuIcon, UserIcon, LogOut, Settings } from 'lucide-react'
import { LogoutIcon, NotificationIcon, Icon } from './Icons'
import BranchSwitcher from './BranchSwitcher'
import ProfileService from '@/lib/services/profileService'
import UserPreferencesService from '@/lib/services/userPreferencesService'
import LowStockService, { LowStockItem } from '@/lib/services/lowStockService'
import { Bell, AlertTriangle, ArrowRight } from 'lucide-react'

// Definición de los elementos del menú
// screenCode: código de la pantalla para validar permisos (null = sin permisos requeridos)
// Los screenCodes deben coincidir exactamente con los definidos en el backend
const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'layout-dashboard', screenCode: 'DASHBOARD' },
  { name: 'Usuarios', href: '/users', icon: 'user-cog', screenCode: 'USERS' },
  { name: 'Roles', href: '/roles', icon: 'shield', screenCode: 'ROLES' },
  { name: 'Punto de Venta', href: '/pos', icon: 'shopping-cart', screenCode: 'POS' },
  { name: 'Facturas', href: '/invoices', icon: 'file-text', screenCode: 'INVOICE' },
  { name: 'Notas de Crédito', href: '/credit-notes', icon: 'undo-2', screenCode: 'CREDIT_NOTE' },
  { name: 'Sesiones de Caja', href: '/cash-sessions', icon: 'hand-coins', screenCode: 'CASH_SESSIONS' },
  {
    name: 'Contabilidad',
    href: '/accounting',
    icon: 'calculator',
    screenCode: null, // Este es un contenedor, no requiere permisos
    submenu: [
      { name: 'Panel Contable', href: '/accounting', icon: 'layout-dashboard', screenCode: 'ACCOUNTING' },
      { name: 'Plan de Cuentas', href: '/accounting/accounts', icon: 'book-open', screenCode: 'ACCOUNTING' },
      { name: 'Asientos Contables', href: '/accounting/journal-entries', icon: 'file-text', screenCode: 'ACCOUNTING' },
      { name: 'Balance General', href: '/accounting/reports/balance-sheet', icon: 'bar-chart-3', screenCode: 'ACCOUNTING' },
      { name: 'Estado de Resultados', href: '/accounting/reports/income-statement', icon: 'trending-up', screenCode: 'ACCOUNTING' },
    ]
  },
  {
    name: 'NCF y Fiscalización',
    href: '/ncf',
    icon: 'file-check',
    screenCode: null, // Este es un contenedor, no requiere permisos
    submenu: [
      { name: 'Dashboard NCF', href: '/ncf', icon: 'layout-dashboard', screenCode: 'NCF' },
      { name: 'Secuencias NCF', href: '/ncf/sequences', icon: 'hash', screenCode: 'NCF' },
      { name: 'Reportes DGII', href: '/ncf/reports', icon: 'file-text', screenCode: 'DGII' },
      { name: 'Configuración NCF', href: '/ncf/config', icon: 'settings', screenCode: 'NCF' },
    ]
  },
  {
    name: 'Inventario',
    href: '/inventory',
    icon: 'archive',
    screenCode: null, // Este es un contenedor, no requiere permisos
    submenu: [
      { name: 'Inventario', href: '/inventory/items', icon: 'box', screenCode: 'INVENTORY' },
      { name: 'Lotes', href: '/inventory/batches', icon: 'layers', screenCode: 'INVENTORY' },
      { name: 'Categorías', href: '/inventory/categories', icon: 'tag', screenCode: 'PRODUCT_CATEGORY' },
      { name: 'Productos', href: '/inventory/products', icon: 'shopping-bag', screenCode: 'PRODUCTS' },
      { name: 'Sucursales', href: '/inventory/branches', icon: 'building-2', screenCode: 'BRANCH' },
      { name: 'Almacenes', href: '/inventory/warehouses', icon: 'building', screenCode: 'WAREHOUSE' },
      { name: 'Movimientos', href: '/inventory/movements', icon: 'repeat', screenCode: 'MOVEMENTS' },
      { name: 'Reportes', href: '/inventory/reports', icon: 'bar-chart-2', screenCode: 'INVENTORY_REPORT' },
    ]
  },
  {
    name: 'Compras',
    href: '/purchases',
    icon: 'truck',
    screenCode: null, // Este es un contenedor, no requiere permisos
    submenu: [
      { name: 'Proveedores', href: '/suppliers', icon: 'truck', screenCode: 'SUPPLIERS' },
      { name: 'Órdenes de Compra', href: '/purchase-orders', icon: 'file-text', screenCode: 'PURCHASE_ORDERS' },
    ]
  },
  {
    name: 'Reportes',
    href: '#',
    icon: 'bar-chart-3',
    screenCode: null,
    submenu: [
      { name: 'Reportes', href: '/reports', icon: 'bar-chart-3', screenCode: 'REPORTS' },
      { name: 'Productos Más Vendidos', href: '/reports/top-products', icon: 'trending-up', screenCode: 'REPORTS' },
      { name: 'Márgenes de Productos', href: '/reports/product-margins', icon: 'dollar-sign', screenCode: 'REPORTS' },
      { name: 'Ventas por Categoría', href: '/reports/sales-by-category', icon: 'tag', screenCode: 'REPORTS' },
      { name: 'Ventas por Cajero', href: '/reports/sales-by-cashier', icon: 'users', screenCode: 'REPORTS' },
      { name: 'Tendencia de Ventas', href: '/reports/sales-trend', icon: 'calendar', screenCode: 'REPORTS' },
      { name: 'Comparación de Períodos', href: '/reports/period-comparison', icon: 'git-compare', screenCode: 'REPORTS' },
    ]
  },
  { name: 'Clientes', href: '/customers', icon: 'users', screenCode: 'CUSTOMERS' },
  { name: 'Créditos', href: '/credit', icon: 'credit-card', screenCode: 'CREDIT' },
  {
    name: 'Configuración',
    href: '/settings',
    icon: 'settings',
    screenCode: null, // Este es un contenedor, no requiere permisos
    submenu: [
      { name: 'General', href: '/settings', icon: 'settings', screenCode: 'TENANT' },
      { name: 'Suscripción', href: '/settings/subscription', icon: 'credit-card', screenCode: null },
      { name: 'Facturación', href: '/settings/billing', icon: 'wallet', screenCode: null },
    ]
  },
]

// Componente para items de submenu en el mini sidebar con portal
function SidebarSubmenuItem({
  item,
  isActive,
  pathname
}: {
  item: typeof menuItems[number];
  isActive: boolean;
  pathname: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para abrir el menú (cancela cualquier cierre pendiente)
  const openMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  // Función para cerrar el menú con delay
  const closeMenuWithDelay = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150); // 150ms de delay para dar tiempo a mover el mouse
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isHovered && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.top,
        left: rect.right + 4,
      });
    }
  }, [isHovered]);

  // Cerrar el menú si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsHovered(false);
      }
    };

    if (isHovered) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHovered]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        title={item.name}
        onMouseEnter={openMenu}
        onMouseLeave={closeMenuWithDelay}
        className={`flex items-center justify-center p-2 rounded-lg transition-colors w-full relative ${isActive
          ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100"
          : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        }`}
      >
        <Icon name={item.icon} className="h-5 w-5" />
        {/* Flecha indicadora */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-50"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Menú flotante usando Portal */}
      {isHovered && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuPosition.top,
            left: menuPosition.left,
            zIndex: 9999,
          }}
          onMouseEnter={openMenu}
          onMouseLeave={closeMenuWithDelay}
          className="w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{item.name}</p>
            {item.submenu?.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                onClick={() => setIsHovered(false)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${
                  pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                    ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100 font-medium"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <Icon name={subItem.icon} className="h-4 w-4" />
                <span>{subItem.name}</span>
              </Link>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({})
  const pathname = usePathname()
  const router = useRouter()
  const { tenantId, tenantName } = useTenant()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [lowStockDropdownOpen, setLowStockDropdownOpen] = useState(false)

  // Cargar perfil del usuario
  React.useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await ProfileService.getMyProfile()
        setUserProfile(profile)
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }
    loadProfile()
  }, [])

  // Cargar preferencia de sidebar expandido
  React.useEffect(() => {
    async function loadSidebarPreference() {
      try {
        const preferences = await UserPreferencesService.getPreferences()
        // Solo abrir automáticamente en pantallas grandes (md y arriba)
        if (preferences.sidebarExpanded && window.innerWidth >= 768) {
          setOpen(true)
        }
      } catch (error) {
        console.error('Error loading sidebar preference:', error)
      }
    }
    loadSidebarPreference()
  }, [])

  // Cargar alertas de stock bajo
  React.useEffect(() => {
    async function loadLowStockAlerts() {
      try {
        // Verificar si el usuario tiene activadas las alertas
        const preferences = await UserPreferencesService.getPreferences()
        if (!preferences.lowStockAlerts) {
          return // No cargar si no está activado
        }

        // Cargar contador
        const countData = await LowStockService.getLowStockCount()
        setLowStockCount(countData.count)

        // Si hay productos, cargar los primeros 5 para el dropdown
        if (countData.count > 0) {
          const report = await LowStockService.getLowStockItems()
          setLowStockItems(report.items.slice(0, 5))
        }
      } catch (error) {
        console.error('Error loading low stock alerts:', error)
      }
    }
    loadLowStockAlerts()

    // Actualizar cada 5 minutos
    const interval = setInterval(loadLowStockAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Función para verificar si un item debe ser visible
  const shouldShowMenuItem = (item: any) => {
    // Si no tiene screenCode, es de acceso libre
    if (!item.screenCode) return true

    // Verificar si el usuario tiene permiso VIEW para esta pantalla
    return PermissionService.canView(item.screenCode)
  }

  // Filtrar items del menú basado en permisos
  const filteredMenuItems = React.useMemo(() => {
    return menuItems.map(item => {
      // Si el item tiene submenú, filtrar los items del submenú
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter(shouldShowMenuItem)

        // Solo mostrar el item padre si tiene al menos un hijo visible
        if (filteredSubmenu.length === 0) return null

        return {
          ...item,
          submenu: filteredSubmenu
        }
      }

      // Para items sin submenú, verificar permisos directamente
      return shouldShowMenuItem(item) ? item : null
    }).filter(Boolean) // Remover items null
  }, []) // Se recalcula cuando cambian los permisos (en login/logout)

  // Inicializar submenús abiertos basados en la ruta actual
  React.useEffect(() => {
    const newOpenSubmenus: Record<string, boolean> = {}
    filteredMenuItems.forEach(item => {
      if (item && item.submenu) {
        // Verificar si la ruta actual coincide con el item padre
        const isParentActive = pathname === item.href || pathname.startsWith(item.href + '/')

        // Verificar si algún sub-item coincide con la ruta actual
        const isSubItemActive = item.submenu.some(subItem =>
          pathname === subItem.href || pathname.startsWith(subItem.href + '/')
        )

        // Abrir el submenú si el padre o algún hijo está activo
        if (isParentActive || isSubItemActive) {
          newOpenSubmenus[item.href] = true
        }
      }
    })
    setOpenSubmenus(newOpenSubmenus)
  }, [pathname, filteredMenuItems])

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-gray-950 dark:border-gray-800">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <SheetTrigger onClick={() => setOpen(true)} className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Image
                src="/xotica_short_logo.png"
                alt="Xotica"
                width={32}
                height={32}
                priority
                className="h-12 w-12"
              />
              <span className="font-bold text-xl text-primary-600 dark:text-primary-400 hidden sm:inline">Xotica</span>
            </Link>
          </div>

          {/* Navegación de escritorio */}
          {/* <nav className="hidden md:flex gap-6">
            {menuItems.map((item) => (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${pathname === item.href || pathname.startsWith(item.href + '/')
                    ? "text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600"
                    } flex items-center gap-1 pb-1`}
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
          </nav> */}

          <div className="flex items-center gap-4">
            {tenantId && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <BuildingIcon className="h-4 w-4" />
                  <span>{tenantName || `Empresa ${tenantId}`}</span>
                </div>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
                <BranchSwitcher />
              </div>
            )}
            {/* Dropdown de Alertas de Stock Bajo */}
            <DropdownMenu open={lowStockDropdownOpen} onOpenChange={setLowStockDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {lowStockCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-semibold">
                      {lowStockCount > 9 ? '9+' : lowStockCount}
                    </span>
                  )}
                  <span className="sr-only">Alertas</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>Stock Bajo</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {lowStockCount === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No hay productos con stock bajo
                  </div>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto">
                      {lowStockItems.map((item) => (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={() => {
                            router.push(`/inventory/products/${item.productId}`)
                            setLowStockDropdownOpen(false)
                          }}
                          className="cursor-pointer flex-col items-start px-4 py-2"
                        >
                          <div className="font-medium text-sm">{item.productName}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.warehouseName} • Stock: {item.quantity}/{item.minStock}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        router.push('/inventory/low-stock')
                        setLowStockDropdownOpen(false)
                      }}
                      className="cursor-pointer text-primary-600 dark:text-primary-400"
                    >
                      <span>Ver todos ({lowStockCount})</span>
                      <ArrowRight className="ml-auto h-4 w-4" />
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                  {userProfile?.avatar ? (
                    <Image
                      src={userProfile.avatar}
                      alt="Foto de perfil"
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <span className="sr-only">Account menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile?.name ? `${userProfile.name} ${userProfile.lastName || ''}`.trim() : 'Usuario'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile?.email || ''}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    AuthService.logout()
                    router.push('/login')
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mini Sidebar - Solo iconos (visible en desktop cuando el drawer está cerrado) */}
      {!open && (
        <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-16 flex-col items-center bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 py-4 z-30">
          <nav className="flex flex-col gap-2 flex-1 w-full px-2 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              if (!item) return null;

              let isActive = pathname === item.href || (item.href !== '#' && pathname.startsWith(item.href + '/'));

              if (item.submenu) {
                isActive = item.submenu.some(subItem =>
                  pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                );
              }

              // Para items con submenú, mostrar menú flotante
              if (item.submenu) {
                return (
                  <SidebarSubmenuItem
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    pathname={pathname}
                  />
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.name}
                  className={`flex items-center justify-center p-2 rounded-lg transition-colors ${isActive
                    ? "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 w-full px-2">
            <button
              onClick={() => setOpen(true)}
              title="Expandir menú"
              className="flex items-center justify-center p-2 rounded-lg w-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            </button>
          </div>
        </aside>
      )}

      {/* Drawer para móvil */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[240px] sm:w-[300px] flex flex-col rounded-r-[30px]">
          {/* Logo en el sidebar */}
          <div className="flex items-center justify-center  border-b border-gray-200 dark:border-gray-800">
            <Image
              src="/xotica_logo.png"
              alt="Xotica Business"
              width={140}
              height={40}
              priority
              className="h-20 w-auto"
            />
          </div>
          <nav className="flex flex-col gap-4 mt-4 overflow-y-auto flex-1 pr-2">
            {filteredMenuItems.map((item) => {
              if (!item) return null;

              // Determinar si el ítem está activo
              let isActive = pathname === item.href || (item.href !== '#' && pathname.startsWith(item.href + '/'));

              // Si tiene submenú, verificar si algún subitem está activo
              if (item.submenu) {
                isActive = item.submenu.some(subItem =>
                  pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                );
              }

              const isSubmenuOpen = !!openSubmenus[item.href];
              return (
                <div key={item.href} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    {item.submenu ? (
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          const newOpenSubmenus = { ...openSubmenus };
                          newOpenSubmenus[item.href] = !isSubmenuOpen;
                          setOpenSubmenus(newOpenSubmenus);
                        }}
                        className={
                          `flex items-center gap-2 px-2 py-1 rounded-md w-full cursor-pointer ${isActive
                            ? "bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100 font-bold border-l-4 border-yellow-500"
                            : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          }`
                        }
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
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 px-2 py-1 rounded-md w-full ${isActive
                            ? "bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100 font-bold border-l-4 border-yellow-500"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                              ? "bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100 font-bold border-l-4 border-yellow-500"
                              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
