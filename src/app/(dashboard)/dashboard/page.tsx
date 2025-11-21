'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useBranch } from '@/lib/contexts/BranchContext';
import { usePermissions } from '@/lib/hooks/usePermissions';
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
import { BatchExpirationWidget } from './components/BatchExpirationWidget';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ncfService from '@/lib/services/ncfService';
import { BatchService } from '@/lib/services/batchService';
import ProtectedPage from '@/components/ProtectedPage';

export default function DashboardPage() {
  const pathname = usePathname();
  const { activeBranchId } = useBranch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPath, setLastPath] = useState('');

  // Permisos de cada módulo
  const { canView: canViewInvoices } = usePermissions('INVOICE');
  const { canView: canViewInventory } = usePermissions('INVENTORY');
  const { canView: canViewCustomers } = usePermissions('CUSTOMERS');
  const { canView: canViewCashSessions } = usePermissions('CASH_SESSIONS');
  const { canView: canViewNcf } = usePermissions('NCF');

  // Estados para datos
  const [salesStats, setSalesStats] = useState<any>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [lowStockData, setLowStockData] = useState<any>(null);
  const [cashSessions, setCashSessions] = useState<any[]>([]);
  const [ncfStats, setNcfStats] = useState<any>(null);
  const [ncfUsageData, setNcfUsageData] = useState<any[]>([]);
  const [expiringBatches, setExpiringBatches] = useState<any[]>([]);

  // Estado para preferencias de usuario
  const [showNcfAlerts, setShowNcfAlerts] = useState<boolean>(false);

  // Cargar todos los datos
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // Calcular fechas (últimos 30 días para tener datos)
      const today = new Date();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      const startOfPeriod = new Date(today);
      startOfPeriod.setDate(startOfPeriod.getDate() - 30);
      startOfPeriod.setHours(0, 0, 0, 0);

      // Preparar array de promesas solo para los datos que el usuario puede ver
      const promises: Promise<any>[] = [];
      let statsIndex = -1;
      let trendIndex = -1;
      let growthIndex = -1;
      let inventoryIndex = -1;
      let lowStockIndex = -1;
      let sessionsIndex = -1;
      let ncfStatsIndex = -1;
      let ncfUsageIndex = -1;
      let batchesIndex = -1;

      // Solo cargar datos de ventas si tiene permiso de ver facturas
      if (canViewInvoices) {
        statsIndex = promises.length;
        promises.push(
          DashboardService.getSalesStats({
            branchId: activeBranchId || undefined,
            startDate: startOfPeriod.toISOString().split('T')[0],
            endDate: endOfDay.toISOString().split('T')[0],
          })
        );

        trendIndex = promises.length;
        promises.push(DashboardService.getSalesTrend(30, activeBranchId || undefined));

        growthIndex = promises.length;
        promises.push(
          DashboardService.getGrowthRate({
            branchId: activeBranchId || undefined,
            startDate: startOfPeriod.toISOString().split('T')[0],
            endDate: endOfDay.toISOString().split('T')[0],
          })
        );
      }

      // Solo cargar datos de inventario si tiene permiso
      if (canViewInventory) {
        inventoryIndex = promises.length;
        promises.push(DashboardService.getStockValuation());

        lowStockIndex = promises.length;
        promises.push(DashboardService.getLowStockReport());

        batchesIndex = promises.length;
        promises.push(BatchService.getExpiringBatches(30).catch(() => []));
      }

      // Solo cargar sesiones de caja si tiene permiso
      if (canViewCashSessions) {
        sessionsIndex = promises.length;
        promises.push(
          CashSessionService.getSessions({
            branchId: activeBranchId || undefined,
            startDate: startOfPeriod.toISOString().split('T')[0],
            endDate: endOfDay.toISOString().split('T')[0],
          })
        );
      }

      // Solo cargar datos de NCF si tiene permiso
      if (canViewNcf) {
        ncfStatsIndex = promises.length;
        promises.push(ncfService.getDashboardStats().catch(() => null));

        ncfUsageIndex = promises.length;
        promises.push(ncfService.getNcfUsageByMonth(6).catch(() => []));
      }

      // Ejecutar todas las promesas en paralelo
      const results = await Promise.all(promises);

      // Asignar resultados solo si se cargaron
      if (statsIndex !== -1) {
        setSalesStats(results[statsIndex]);
      }
      if (trendIndex !== -1) setSalesTrend(results[trendIndex]);
      if (growthIndex !== -1) setGrowthData(results[growthIndex]);
      if (inventoryIndex !== -1) setInventoryData(results[inventoryIndex]);
      if (lowStockIndex !== -1) setLowStockData(results[lowStockIndex]);
      if (batchesIndex !== -1) setExpiringBatches(results[batchesIndex]);
      if (sessionsIndex !== -1) setCashSessions(results[sessionsIndex]);
      if (ncfStatsIndex !== -1) setNcfStats(results[ncfStatsIndex]);
      if (ncfUsageIndex !== -1) setNcfUsageData(results[ncfUsageIndex]);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar datos cuando estamos en el dashboard
  useEffect(() => {
    console.log('✅ Dashboard page active - Loading data...', { lastPath, pathname });
    loadDashboardData();
  }, [activeBranchId, canViewInvoices, canViewInventory, canViewCashSessions, canViewNcf]);


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
  const totalCollected = cashSessions.reduce((sum, s) => {
    const cash = s.totalCash ? parseFloat(s.totalCash) : 0;
    const card = s.totalCard ? parseFloat(s.totalCard) : 0;
    const transfer = s.totalTransfer ? parseFloat(s.totalTransfer) : 0;
    return sum + cash + card + transfer;
  }, 0);
  const totalDifference = cashSessions.reduce((sum, s) => {
    const diff = s.difference ? parseFloat(s.difference) : 0;
    const diffVouchers = s.differenceVouchers ? parseFloat(s.differenceVouchers) : 0;
    return sum + diff + diffVouchers;
  }, 0);

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
    <ProtectedPage screenCode="DASHBOARD" requiredPermission="VIEW">
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

        {/* KPIs Principales - Solo si tiene permiso de ver facturas */}
        {canViewInvoices && (
          <KPICards
            totalSales={totalSales}
            transactionCount={transactionCount}
            avgTicket={avgTicket}
            growthRate={growthRate}
          />
        )}

        {/* Gráficos de Ventas - Solo si tiene permiso de ver facturas */}
        {canViewInvoices && (
          <div className="grid gap-4 md:grid-cols-3">
            <SalesTrendChart data={salesTrend} />
            <PaymentMethodChart data={salesStats?.invoicesByPaymentMethod || []} />
          </div>
        )}

        {/* Sección de Inventario - Solo si tiene permiso de ver inventario */}
        {canViewInventory && (
          <>
            <InventorySection
              totalValue={inventoryData?.summary?.totalValue || 0}
              lowStockCount={lowStockData?.count || 0}
              totalProducts={inventoryData?.summary?.totalItems || 0}
              lowStockItems={lowStockData?.items || []}
            />

            {/* Widget de Lotes por Vencer */}
            {
              <BatchExpirationWidget expiringBatches={expiringBatches} />
            }
          </>
        )}

        {/* Sesiones de Caja y Top Clientes */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Widget de Sesiones de Caja - Solo si tiene permiso */}
          {canViewCashSessions && (
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
          )}

          {/* Widget de Top Clientes - Solo si tiene permiso */}
          {canViewCustomers && <TopCustomersWidget />}
        </div>

        {/* Sección de NCF / Cumplimiento Fiscal - Solo si tiene permiso */}
        {canViewNcf && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <NcfUsageChart data={ncfUsageData || []} />
              <NcfComplianceWidget
                totalActiveSequences={ncfStats?.totalActiveSequences || 0}
                expiringCount={ncfStats?.expiringCount || 0}
                criticalCount={ncfStats?.criticalCount || 0}
                totalNcfUsed={ncfUsageData?.reduce((sum, item) => sum + (item.total || 0), 0) || 0}
              />
            </div>

            {showNcfAlerts && (ncfStats?.expiringSequences?.length > 0 || ncfStats?.criticalSequences?.length > 0) && (
              <NcfAlertsWidget
                expiringSequences={ncfStats?.expiringSequences || []}
                criticalSequences={ncfStats?.criticalSequences || []}
                expiringCount={ncfStats?.expiringCount || 0}
                criticalCount={ncfStats?.criticalCount || 0}
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
    </ProtectedPage>
  );
}
