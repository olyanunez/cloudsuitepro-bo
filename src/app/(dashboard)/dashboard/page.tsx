'use client';

import { useEffect, useState } from 'react';
import { useBranch } from '@/lib/contexts/BranchContext';
import { DashboardService } from '@/lib/services/dashboardService';
import { CashSessionService } from '@/lib/services/cashSessionService';
import UserPreferencesService from '@/lib/services/userPreferencesService';
import { KPICards } from './components/KPICards';
import { SalesTrendChart } from './components/SalesTrendChart';
import { PaymentMethodChart } from './components/PaymentMethodChart';
import { InventorySection } from './components/InventorySection';
import { TopCustomersWidget } from './components/TopCustomersWidget';
import { CashSessionsWidget } from './components/CashSessionsWidget';
import { NcfAlertsWidget } from './components/NcfAlertsWidget';
import { NcfUsageChart } from './components/NcfUsageChart';
import { NcfComplianceWidget } from './components/NcfComplianceWidget';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ncfService from '@/lib/services/ncfService';

export default function DashboardPage() {
  const { activeBranchId } = useBranch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para datos
  const [salesStats, setSalesStats] = useState<any>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [lowStockData, setLowStockData] = useState<any>(null);
  const [cashSessions, setCashSessions] = useState<any[]>([]);
  const [ncfStats, setNcfStats] = useState<any>(null);
  const [ncfUsageData, setNcfUsageData] = useState<any[]>([]);

  // Estado para preferencias de usuario
  const [showNcfAlerts, setShowNcfAlerts] = useState<boolean>(false);

  // Cargar todos los datos
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // Calcular fechas (hoy)
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // Cargar datos en paralelo
      const [stats, trend, growth, inventory, lowStock, sessions, ncfStatsData, ncfUsage] = await Promise.all([
        // Estadísticas de ventas de hoy
        DashboardService.getSalesStats({
          branchId: activeBranchId || undefined,
          startDate: startOfDay.toISOString().split('T')[0],
          endDate: endOfDay.toISOString().split('T')[0],
        }),

        // Tendencia de ventas (últimos 30 días)
        DashboardService.getSalesTrend(30, activeBranchId || undefined),

        // Tasa de crecimiento (hoy vs ayer)
        DashboardService.getGrowthRate({
          branchId: activeBranchId || undefined,
          startDate: startOfDay.toISOString().split('T')[0],
          endDate: endOfDay.toISOString().split('T')[0],
        }),

        // Valorización de inventario
        DashboardService.getStockValuation(),

        // Productos con stock bajo
        DashboardService.getLowStockReport(),

        // Sesiones de caja de hoy
        CashSessionService.getSessions({
          branchId: activeBranchId || undefined,
          startDate: startOfDay.toISOString().split('T')[0],
          endDate: endOfDay.toISOString().split('T')[0],
        }),

        // Estadísticas de NCF
        ncfService.getDashboardStats().catch(() => null),

        // Uso de NCF por mes
        ncfService.getNcfUsageByMonth(6).catch(() => []),
      ]);

      setSalesStats(stats);
      setSalesTrend(trend);
      setGrowthData(growth);
      setInventoryData(inventory);
      setLowStockData(lowStock);
      setCashSessions(sessions);
      setNcfStats(ncfStatsData);
      setNcfUsageData(ncfUsage);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeBranchId]);

  // Cargar preferencias del usuario
  useEffect(() => {
    async function loadPreferences() {
      try {
        const preferences = await UserPreferencesService.getPreferences();
        setShowNcfAlerts(preferences.ncfExpirationAlerts);
      } catch (error) {
        console.error('Error loading user preferences:', error);
        // Por defecto, no mostrar alertas si hay error
        setShowNcfAlerts(false);
      }
    }
    loadPreferences();
  }, []);

  // Calcular métricas - convertir a número explícitamente
  const totalSales = parseFloat(salesStats?.totalAmount || 0);
  const transactionCount = parseInt(salesStats?.totalInvoices || 0);
  const avgTicket = transactionCount > 0 ? totalSales / transactionCount : 0;
  const growthRate = growthData?.growthRate || 0;

  // Calcular métricas de sesiones de caja
  const openSessions = cashSessions.filter((s) => s.status === 'OPEN').length;
  const totalCollected = cashSessions.reduce(
    (sum, s) =>
      sum +
      parseFloat(s.totalCash || '0') +
      parseFloat(s.totalCard || '0') +
      parseFloat(s.totalTransfer || '0'),
    0
  );
  const totalDifference = cashSessions.reduce(
    (sum, s) =>
      sum +
      parseFloat(s.difference || '0') +
      parseFloat(s.differenceVouchers || '0'),
    0
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Dashboard"
        icon="layout-dashboard"
        description="Resumen ejecutivo de tu negocio"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={loadDashboardData}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </PageHeader>

      {/* KPIs Principales */}
      <KPICards
        totalSales={totalSales}
        transactionCount={transactionCount}
        avgTicket={avgTicket}
        growthRate={growthRate}
      />

      {/* Gráficos de Ventas */}
      <div className="grid gap-4 md:grid-cols-3">
        <SalesTrendChart data={salesTrend} />
        <PaymentMethodChart data={salesStats?.invoicesByPaymentMethod || []} />
      </div>

      {/* Sección de Inventario */}
      <InventorySection
        totalValue={inventoryData?.summary?.totalValue || 0}
        lowStockCount={lowStockData?.count || 0}
        totalProducts={inventoryData?.summary?.totalItems || 0}
        lowStockItems={lowStockData?.items || []}
      />

      {/* Sesiones de Caja y Top Clientes */}
      <div className="grid gap-4 md:grid-cols-2">
        <CashSessionsWidget
          openSessions={openSessions}
          totalCollected={totalCollected}
          totalDifference={totalDifference}
          recentSessions={cashSessions.map((s) => ({
            id: s.id,
            sessionNumber: s.sessionNumber,
            userName: s.user?.name || 'Usuario',
            totalCash: parseFloat(s.totalCash || '0'),
            totalCard: parseFloat(s.totalCard || '0'),
            totalTransfer: parseFloat(s.totalTransfer || '0'),
            difference: parseFloat(s.difference || '0'),
            differenceVouchers: parseFloat(s.differenceVouchers || '0'),
            status: s.status,
          }))}
        />

        <TopCustomersWidget />
      </div>

      {/* Sección de NCF / Cumplimiento Fiscal */}
      {ncfStats && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <NcfUsageChart data={ncfUsageData} />
            <NcfComplianceWidget
              totalActiveSequences={ncfStats.totalActiveSequences || 0}
              expiringCount={ncfStats.expiringCount || 0}
              criticalCount={ncfStats.criticalCount || 0}
              totalNcfUsed={ncfUsageData.reduce((sum, item) => sum + (item.total || 0), 0)}
            />
          </div>

          {showNcfAlerts && (ncfStats.expiringSequences?.length > 0 || ncfStats.criticalSequences?.length > 0) && (
            <NcfAlertsWidget
              expiringSequences={ncfStats.expiringSequences || []}
              criticalSequences={ncfStats.criticalSequences || []}
              expiringCount={ncfStats.expiringCount || 0}
              criticalCount={ncfStats.criticalCount || 0}
            />
          )}
        </>
      )}

      {/* Footer informativo */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-center text-muted-foreground">
            📊 Dashboard actualizado • Última actualización:{' '}
            {new Date().toLocaleString('es-DO')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
