'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Hash,
  Settings,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import ncfService, { NcfSequence } from '@/lib/services/ncfService';
import { toast } from 'sonner';

export default function NcfDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sequences, setSequences] = useState<NcfSequence[]>([]);
  const [expiringSequences, setExpiringSequences] = useState<NcfSequence[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    expiring: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allSequences, expiring] = await Promise.all([
        ncfService.getAllSequences(),
        ncfService.checkExpiringSequences(),
      ]);

      setSequences(allSequences);
      setExpiringSequences(expiring);

      // Calcular estadísticas
      setStats({
        total: allSequences.length,
        active: allSequences.filter((s) => s.isActive && !s.isExpired).length,
        expired: allSequences.filter((s) => s.isExpired).length,
        expiring: expiring.length,
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos del dashboard NCF');
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (sequence: NcfSequence): number => {
    const total = sequence.rangeEnd - sequence.rangeStart + 1;
    const used = Math.max(0, sequence.currentNumber - sequence.rangeStart + 1);
    return Math.round((used / total) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <div className="text-center text-sm">Cargando dashboard NCF...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Dashboard NCF</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Sistema de Números de Comprobante Fiscal - República Dominicana
        </p>
      </div>

      {/* Alertas críticas */}
      {stats.expiring > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm">
            <strong>¡Atención!</strong> Tienes {stats.expiring} secuencia(s)
            próxima(s) a vencer o agotarse. Debes solicitar nuevas secuencias a
            la DGII.
          </AlertDescription>
        </Alert>
      )}

      {stats.expired > 0 && (
        <Alert>
          <XCircle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm">
            Tienes {stats.expired} secuencia(s) vencida(s). Estas secuencias no
            se pueden utilizar para nuevas facturas.
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Secuencias</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                Secuencias registradas
              </p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Secuencias Activas</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {stats.active}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                Disponibles para uso
              </p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Por Vencer</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-600">
                {stats.expiring}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                Requieren atención
              </p>
            </div>
            <div className="bg-orange-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Vencidas</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">
                {stats.expired}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                No disponibles
              </p>
            </div>
            <div className="bg-red-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer p-3 sm:p-4" onClick={() => router.push('/ncf/sequences')}>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Gestionar Secuencias</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                Ver, crear y editar secuencias de NCF autorizadas por la DGII
              </p>
              <Button variant="outline" size="sm" className="w-full mt-2 sm:mt-3 h-8 sm:h-9 text-xs sm:text-sm" onClick={(e) => { e.stopPropagation(); router.push('/ncf/sequences'); }}>
                Ir a Secuencias
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer p-3 sm:p-4" onClick={() => router.push('/ncf/reports')}>
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Reportes DGII</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                Generar reportes 606 y 607 para presentación mensual a la DGII
              </p>
              <Button variant="outline" size="sm" className="w-full mt-2 sm:mt-3 h-8 sm:h-9 text-xs sm:text-sm" onClick={(e) => { e.stopPropagation(); router.push('/ncf/reports'); }}>
                Generar Reportes
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer p-3 sm:p-4" onClick={() => router.push('/ncf/config')}>
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm sm:text-base">Configuración</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                Configurar opciones del sistema NCF y parámetros fiscales
              </p>
              <Button variant="outline" size="sm" className="w-full mt-2 sm:mt-3 h-8 sm:h-9 text-xs sm:text-sm" onClick={(e) => { e.stopPropagation(); router.push('/ncf/config'); }}>
                Configurar
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Secuencias que requieren atención */}
      {expiringSequences.length > 0 && (
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
            <h3 className="font-semibold text-sm sm:text-base">Secuencias que Requieren Atención</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {expiringSequences.map((sequence) => {
              const usage = getUsagePercentage(sequence);
              const daysUntilExpiration = Math.ceil(
                (new Date(sequence.validUntil).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={sequence.id}
                  className="flex items-start sm:items-center justify-between p-2 sm:p-3 border rounded-lg hover:bg-muted/50 cursor-pointer gap-2"
                  onClick={() => router.push(`/ncf/sequences/${sequence.id}`)}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        Tipo {sequence.ncfType}
                      </span>
                      <code className="text-[10px] sm:text-xs bg-muted px-1.5 py-0.5 rounded">
                        {sequence.prefix}
                        {sequence.series}
                      </code>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span>Uso: {usage}%</span>
                      {daysUntilExpiration > 0 ? (
                        <span>Vence en {daysUntilExpiration} días</span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          Vencida
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {usage >= 90 && (
                      <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 sm:px-2">Casi agotada</Badge>
                    )}
                    {daysUntilExpiration <= 30 && daysUntilExpiration > 0 && (
                      <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 sm:px-2">Por vencer</Badge>
                    )}
                    {daysUntilExpiration <= 0 && (
                      <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 sm:px-2">Vencida</Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 sm:mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 sm:h-9 text-xs sm:text-sm"
              onClick={() => router.push('/ncf/sequences/create')}
            >
              Crear Nueva Secuencia
            </Button>
          </div>
        </Card>
      )}

      {/* Información y recordatorios */}
      <Card className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <h3 className="font-semibold text-sm sm:text-base">Recordatorios Fiscales</h3>
        </div>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          <div className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs sm:text-sm">Presentación de Reportes DGII</p>
              <p className="text-muted-foreground text-[11px] sm:text-sm">
                Los reportes 606 y 607 deben presentarse mensualmente según el
                calendario establecido por la DGII
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs sm:text-sm">Renovación de Secuencias NCF</p>
              <p className="text-muted-foreground text-[11px] sm:text-sm">
                Solicita nuevas secuencias con anticipación para evitar
                interrupciones en la facturación
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs sm:text-sm">Validación de NCF</p>
              <p className="text-muted-foreground text-[11px] sm:text-sm">
                Todas las facturas con valor fiscal deben incluir un NCF válido
                y vigente
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Estado de secuencias activas */}
      {stats.active > 0 && (
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <h3 className="font-semibold text-sm sm:text-base">Uso de Secuencias Activas</h3>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {sequences
              .filter((s) => s.isActive && !s.isExpired)
              .slice(0, 5)
              .map((sequence) => {
                const usage = getUsagePercentage(sequence);
                return (
                  <div
                    key={sequence.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] sm:text-xs bg-muted px-1.5 py-0.5 rounded">
                        {sequence.ncfType}
                      </code>
                      <span className="text-xs sm:text-sm">
                        {sequence.prefix}
                        {sequence.series}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-full sm:w-32 bg-muted rounded-full h-1.5 sm:h-2">
                        <div
                          className={`h-1.5 sm:h-2 rounded-full ${
                            usage >= 90
                              ? 'bg-red-600'
                              : usage >= 70
                              ? 'bg-orange-600'
                              : 'bg-green-600'
                          }`}
                          style={{ width: `${usage}%` }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-medium w-10 sm:w-12 text-right flex-shrink-0">
                        {usage}%
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
}
