'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { Icon } from '@/components/layout/Icons';
import ProfileService, { UserProfile } from '@/lib/services/profileService';
import { DashboardService, SalesTrend } from '@/lib/services/dashboardService';
import LowStockService from '@/lib/services/lowStockService';
import { CreditService, CustomerWithPendingBalance } from '@/lib/services/creditService';
import { Button } from '@/components/ui/button';
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
  DollarSign,
  AlertTriangle,
  Loader2,
  RefreshCw,
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

// Formatear número como moneda RD
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
  }).format(value);
};

// Formatear fecha
const formatDate = () => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const date = new Date().toLocaleDateString('es-DO', options);
  // Capitalizar primera letra
  return date.charAt(0).toUpperCase() + date.slice(1);
};

// Colores únicos para cada día de la semana (7 colores distintos)
const barColors: Record<number, string> = {
  0: 'bg-rose-500 hover:bg-rose-600',      // Domingo
  1: 'bg-blue-500 hover:bg-blue-600',      // Lunes
  2: 'bg-emerald-500 hover:bg-emerald-600', // Martes
  3: 'bg-amber-500 hover:bg-amber-600',    // Miércoles
  4: 'bg-violet-500 hover:bg-violet-600',  // Jueves
  5: 'bg-cyan-500 hover:bg-cyan-600',      // Viernes
  6: 'bg-indigo-500 hover:bg-indigo-600',  // Sábado
};

// Componente comparación semanal
function WeekComparisonChart({
  currentWeek,
  previousWeek,
  growthRate
}: {
  currentWeek: number;
  previousWeek: number;
  growthRate: number;
}) {
  const maxValue = Math.max(currentWeek, previousWeek, 1);
  const currentPercent = (currentWeek / maxValue) * 100;
  const previousPercent = (previousWeek / maxValue) * 100;
  const isPositive = growthRate >= 0;

  return (
    <div className="space-y-3">
      {/* Semana Actual */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Esta semana</span>
          <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(currentWeek)}</span>
        </div>
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${currentPercent}%` }}
          />
        </div>
      </div>

      {/* Semana Anterior */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Semana anterior</span>
          <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(previousWeek)}</span>
        </div>
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gray-400 to-gray-300 dark:from-gray-500 dark:to-gray-400 rounded-full transition-all duration-500"
            style={{ width: `${previousPercent}%` }}
          />
        </div>
      </div>

      {/* Indicador de crecimiento */}
      <div className="flex items-center justify-center pt-1">
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${isPositive
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
          <TrendingUp className={`h-4 w-4 ${!isPositive ? 'rotate-180' : ''}`} />
          <span>{isPositive ? '+' : ''}{growthRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

// Componente mini gráfico de barras
function MiniBarChart({ data }: { data: SalesTrend[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Sin datos disponibles
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.total), 1);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="flex flex-col">
      {/* Área del gráfico */}
      <div className="flex items-end justify-between gap-2 h-24 px-1">
        {data.map((item, index) => {
          const heightPercent = Math.max((item.total / maxValue) * 100, 5);
          const dayIndex = new Date(item.date).getDay();
          const colorClass = barColors[dayIndex];

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <div
                className={`w-full rounded-t transition-all duration-300 cursor-pointer ${colorClass}`}
                style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                title={`${formatCurrency(item.total)} - ${item.invoiceCount} facturas`}
              />
            </div>
          );
        })}
      </div>
      {/* Etiquetas de días */}
      <div className="flex justify-between gap-2 px-1 mt-2">
        {data.map((item, index) => {
          const dayIndex = new Date(item.date).getDay();
          return (
            <div key={index} className="flex-1 text-center">
              <span className="text-xs text-gray-500 font-medium">{days[dayIndex]}</span>
            </div>
          );
        })}
      </div>
      {/* Valores */}
      <div className="flex justify-between gap-2 px-1 mt-1">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <span className="text-[9px] text-gray-400">
              {item.total > 0 ? `${(item.total / 1000).toFixed(0)}k` : '0'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ShortcutsPage() {
  const router = useRouter();
  const { subscription } = useSubscription();

  // Estados para datos
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [salesStats, setSalesStats] = useState<{ totalInvoices: number; totalAmount: number } | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [pendingCredits, setPendingCredits] = useState<{ count: number; total: number }>({ count: 0, total: 0 });
  const [salesTrend, setSalesTrend] = useState<SalesTrend[]>([]);
  const [weekComparison, setWeekComparison] = useState<{
    currentWeek: number;
    previousWeek: number;
    growthRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

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
  const inventoryPermissions = usePermissions('INVENTORY');

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
    INVENTORY: inventoryPermissions.canView,
  };

  // Función para cargar datos
  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Calcular fechas para la comparación semanal (últimos 7 días)
      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6); // 7 días incluyendo hoy

      // Cargar datos en paralelo
      const [profileData, salesData, lowStockData, creditCustomers, trendData, growthData] = await Promise.allSettled([
        ProfileService.getMyProfile(),
        DashboardService.getSalesStats({
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
        }),
        LowStockService.getLowStockCount(),
        CreditService.getCustomersWithPendingBalance(),
        DashboardService.getSalesTrend(7),
        DashboardService.getGrowthRate({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate,
        }),
      ]);

      if (profileData.status === 'fulfilled') {
        setProfile(profileData.value);
      }

      if (salesData.status === 'fulfilled') {
        setSalesStats(salesData.value);
      }

      if (lowStockData.status === 'fulfilled') {
        setLowStockCount(lowStockData.value.count);
      }

      if (creditCustomers.status === 'fulfilled') {
        const customers = creditCustomers.value as CustomerWithPendingBalance[];
        const total = customers.reduce((sum, c) => sum + c.currentBalance, 0);
        setPendingCredits({ count: customers.length, total });
      }

      if (trendData.status === 'fulfilled') {
        setSalesTrend(trendData.value);
      }

      if (growthData.status === 'fulfilled') {
        setWeekComparison({
          currentWeek: growthData.value.currentPeriod.total,
          previousWeek: growthData.value.previousPeriod.total,
          growthRate: growthData.value.growthRate,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar y cuando la ventana recupera el foco
  useEffect(() => {
    loadData();

    // Recargar cuando la ventana recupera el foco (ej: volver del POS)
    const handleFocus = () => {
      loadData(false); // Sin mostrar loading para no interrumpir
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

  // Verificar si el plan tiene un feature específico
  const hasFeature = (featureName: string): boolean => {
    if (!subscription?.plan) return true;
    return (subscription.plan as any)[featureName] === true;
  };

  // Filtrar shortcuts basados en permisos y features
  const visibleShortcuts = shortcuts.filter((shortcut) => {
    if (shortcut.screenCode && !permissionsMap[shortcut.screenCode]) {
      return false;
    }
    if (shortcut.featureRequired && !hasFeature(shortcut.featureRequired)) {
      return false;
    }
    return true;
  });

  const handleClick = (href: string) => {
    router.push(href);
  };

  // Nombre para mostrar
  const displayName = profile?.name || profile?.email?.split('@')[0] || 'Usuario';

  return (
    <div className="container mx-auto -mt-2 space-y-6">
      {/* Mensaje de Bienvenida */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-3 sm:p-6 border border-primary/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="p-2 sm:p-3 bg-primary/20 rounded-full shrink-0">
              <Home className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate sm:whitespace-normal">
                ¡Hola, {displayName}!
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {formatDate()}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start sm:self-auto h-8 px-3 text-xs sm:text-sm"
            onClick={() => loadData()}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Accesos Directos - Solo visible en móvil arriba */}
      <div className="sm:hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="home" className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Accesos Rápidos</h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {visibleShortcuts.map((shortcut) => (
            <div
              key={shortcut.id}
              role="button"
              tabIndex={0}
              onClick={() => handleClick(shortcut.href)}
              onKeyDown={(e) => e.key === 'Enter' && handleClick(shortcut.href)}
              className={`shortcut-button ${shortcut.colorClass} cursor-pointer flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2`}
            >
              <div
                className="flex-shrink-0 p-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <span className="[&>svg]:h-8 [&>svg]:w-8">
                  {shortcut.icon}
                </span>
              </div>
              <span className="text-[10px] text-center leading-tight">{shortcut.label}</span>
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

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {/* Ventas del Día */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => permissionsMap.INVOICE && router.push('/invoices')}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Ventas del Día</p>
              {loading ? (
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-gray-400 mt-1" />
              ) : (
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {formatCurrency(salesStats?.totalAmount || 0)}
                </p>
              )}
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-full shrink-0">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Facturas Hoy */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => permissionsMap.INVOICE && router.push('/invoices')}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Facturas Hoy</p>
              {loading ? (
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-gray-400 mt-1" />
              ) : (
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {salesStats?.totalInvoices || 0}
                </p>
              )}
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Stock Bajo */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => permissionsMap.INVENTORY && router.push('/inventory/low-stock')}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Stock Bajo</p>
              {loading ? (
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-gray-400 mt-1" />
              ) : (
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {lowStockCount} <span className="text-xs sm:text-sm font-normal text-gray-500">prod.</span>
                </p>
              )}
            </div>
            <div className={`p-2 sm:p-3 rounded-full shrink-0 ${lowStockCount > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <AlertTriangle className={`h-5 w-5 sm:h-6 sm:w-6 ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Cuentas por Cobrar */}
        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => permissionsMap.CREDIT && router.push('/credit')}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Por Cobrar</p>
              {loading ? (
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-gray-400 mt-1" />
              ) : (
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {formatCurrency(pendingCredits.total)}
                </p>
              )}
            </div>
            <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-full shrink-0">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          {!loading && pendingCredits.count > 0 && (
            <p className="text-xs text-gray-500 mt-1 sm:mt-2">{pendingCredits.count} clientes</p>
          )}
        </div>
      </div>

      {/* Gráfico y Accesos Rápidos (desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Ventas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Gráfico de últimos 7 días */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Ventas - Últimos 7 días</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <MiniBarChart data={salesTrend} />
          )}

          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-5" />

          {/* Comparación semanal */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">vs Semana Anterior</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : weekComparison ? (
            <WeekComparisonChart
              currentWeek={weekComparison.currentWeek}
              previousWeek={weekComparison.previousWeek}
              growthRate={weekComparison.growthRate}
            />
          ) : (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
              Sin datos disponibles
            </div>
          )}
        </div>

        {/* Accesos Directos - Solo visible en desktop */}
        <div className="hidden sm:block lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="home" className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Accesos Rápidos</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {visibleShortcuts.map((shortcut) => (
              <div
                key={shortcut.id}
                role="button"
                tabIndex={0}
                onClick={() => handleClick(shortcut.href)}
                onKeyDown={(e) => e.key === 'Enter' && handleClick(shortcut.href)}
                className={`shortcut-button ${shortcut.colorClass} cursor-pointer flex flex-row items-center justify-start gap-2 sm:gap-3 lg:gap-4 py-5 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2`}
              >
                <div
                  className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg [&>svg]:h-10 [&>svg]:w-10 sm:[&>svg]:h-12 sm:[&>svg]:w-12 lg:[&>svg]:h-14 lg:[&>svg]:w-14"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  {shortcut.icon}
                </div>
                <span className="text-sm sm:text-base lg:text-xl">{shortcut.label}</span>
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
      </div>
    </div>
  );
}
