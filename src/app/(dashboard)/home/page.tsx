'use client';

import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { Icon } from '@/components/layout/Icons';
import {
  ShoppingCart,
  FileText,
  LayoutDashboard,
  Wallet,
  TrendingUp,
  CreditCard,
  Users,
  Calculator,
  Settings,
  Home,
} from 'lucide-react';

interface ShortcutButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  colorClass: string;
  screenCode?: string;
  featureRequired?: string;
}

const shortcuts: ShortcutButton[] = [
  {
    id: 'pos',
    label: 'Punto de Venta',
    icon: <ShoppingCart className="h-14 w-14" />,
    href: '/pos',
    colorClass: 'shortcut-pos',
    screenCode: 'POS',
  },
  {
    id: 'invoices',
    label: 'Facturas',
    icon: <FileText className="h-14 w-14" />,
    href: '/invoices',
    colorClass: 'shortcut-invoices',
    screenCode: 'INVOICE',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-14 w-14" />,
    href: '/dashboard',
    colorClass: 'shortcut-dashboard',
    screenCode: 'DASHBOARD',
  },
  {
    id: 'cash-sessions',
    label: 'Sesiones de Caja',
    icon: <Wallet className="h-14 w-14" />,
    href: '/cash-sessions',
    colorClass: 'shortcut-cash-sessions',
    screenCode: 'CASH_SESSIONS',
  },
  {
    id: 'top-products',
    label: 'Productos más Vendidos',
    icon: <TrendingUp className="h-14 w-14" />,
    href: '/reports/top-products',
    colorClass: 'shortcut-top-products',
    screenCode: 'REPORTS',
  },
  {
    id: 'credit',
    label: 'Créditos',
    icon: <CreditCard className="h-14 w-14" />,
    href: '/credit',
    colorClass: 'shortcut-credit',
    screenCode: 'CREDIT',
  },
  {
    id: 'customers',
    label: 'Clientes',
    icon: <Users className="h-14 w-14" />,
    href: '/customers',
    colorClass: 'shortcut-customers',
    screenCode: 'CUSTOMERS',
  },
  {
    id: 'accounting',
    label: 'Contabilidad',
    icon: <Calculator className="h-14 w-14" />,
    href: '/accounting',
    colorClass: 'shortcut-accounting',
    screenCode: 'ACCOUNTING',
  },
  {
    id: 'settings',
    label: 'Configuraciones',
    icon: <Settings className="h-14 w-14" />,
    href: '/settings',
    colorClass: 'shortcut-settings',
  },
];

export default function ShortcutsPage() {
  const router = useRouter();
  const { subscription } = useSubscription();

  // Verificar permisos para cada módulo
  const posPermissions = usePermissions('POS');
  const invoicePermissions = usePermissions('INVOICE');
  const dashboardPermissions = usePermissions('DASHBOARD');
  const cashSessionsPermissions = usePermissions('CASH_SESSIONS');
  const reportsPermissions = usePermissions('REPORTS');
  const creditPermissions = usePermissions('CREDIT');
  const customersPermissions = usePermissions('CUSTOMERS');
  const accountingPermissions = usePermissions('ACCOUNTING');
  const settingsPermissions = usePermissions('SETTINGS');

  const permissionsMap: Record<string, boolean> = {
    POS: posPermissions.canView,
    INVOICE: invoicePermissions.canView,
    DASHBOARD: dashboardPermissions.canView,
    CASH_SESSIONS: cashSessionsPermissions.canView,
    REPORTS: reportsPermissions.canView,
    CREDIT: creditPermissions.canView,
    CUSTOMERS: customersPermissions.canView,
    ACCOUNTING: accountingPermissions.canView,
    SETTINGS: settingsPermissions.canView,
  };

  // Verificar si el plan tiene un feature específico
  const hasFeature = (featureName: string): boolean => {
    if (!subscription?.plan) return true; // Si no hay suscripción cargada, mostrar por defecto
    return (subscription.plan as any)[featureName] === true;
  };

  // Filtrar shortcuts basados en permisos y features
  const visibleShortcuts = shortcuts.filter((shortcut) => {
    // Verificar permiso
    if (shortcut.screenCode && !permissionsMap[shortcut.screenCode]) {
      return false;
    }
    // Verificar feature del plan
    if (shortcut.featureRequired && !hasFeature(shortcut.featureRequired)) {
      return false;
    }
    return true;
  });

  const handleClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="container mx-auto -mt-2">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon name="home" className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Inicio</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Accede rápidamente a los módulos del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleShortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            role="button"
            tabIndex={0}
            onClick={() => handleClick(shortcut.href)}
            onKeyDown={(e) => e.key === 'Enter' && handleClick(shortcut.href)}
            className={`shortcut-button ${shortcut.colorClass} cursor-pointer flex items-center gap-4 py-12 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2`}
          >
            <div
              className="flex-shrink-0 p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              {shortcut.icon}
            </div>
            <span className="text-2xl">{shortcut.label}</span>
          </div>
        ))}
      </div>

      {visibleShortcuts.length === 0 && (
        <div className="mt-12 text-center text-muted-foreground">
          <Home className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No tienes acceso a ningún módulo</p>
          <p className="text-sm mt-2">Contacta al administrador para obtener permisos</p>
        </div>
      )}
    </div>
  );
}
