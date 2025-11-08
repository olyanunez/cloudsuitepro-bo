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
    const used = sequence.currentNumber - sequence.rangeStart;
    return Math.round((used / total) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Cargando dashboard NCF...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard NCF</h1>
        <p className="text-muted-foreground">
          Sistema de Números de Comprobante Fiscal - República Dominicana
        </p>
      </div>

      {/* Alertas críticas */}
      {stats.expiring > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>¡Atención!</strong> Tienes {stats.expiring} secuencia(s)
            próxima(s) a vencer o agotarse. Debes solicitar nuevas secuencias a
            la DGII.
          </AlertDescription>
        </Alert>
      )}

      {stats.expired > 0 && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Tienes {stats.expired} secuencia(s) vencida(s). Estas secuencias no
            se pueden utilizar para nuevas facturas.
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Secuencias
            </CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Secuencias registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Secuencias Activas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponibles para uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.expiring}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.expired}
            </div>
            <p className="text-xs text-muted-foreground">No disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/ncf/sequences')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Gestionar Secuencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Ver, crear y editar secuencias de NCF autorizadas por la DGII
            </p>
            <Button variant="outline" className="w-full" onClick={() => router.push('/ncf/sequences')}>
              Ir a Secuencias
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/ncf/reports')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reportes DGII
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generar reportes 606 y 607 para presentación mensual a la DGII
            </p>
            <Button variant="outline" className="w-full" onClick={() => router.push('/ncf/reports')}>
              Generar Reportes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/ncf/config')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configurar opciones del sistema NCF y parámetros fiscales
            </p>
            <Button variant="outline" className="w-full" onClick={() => router.push('/ncf/config')}>
              Configurar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Secuencias que requieren atención */}
      {expiringSequences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Secuencias que Requieren Atención
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiringSequences.map((sequence) => {
                const usage = getUsagePercentage(sequence);
                const daysUntilExpiration = Math.ceil(
                  (new Date(sequence.validUntil).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={sequence.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/ncf/sequences/${sequence.id}`)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Tipo {sequence.ncfType}
                        </span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {sequence.prefix}
                          {sequence.series}
                        </code>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
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
                    <div className="flex items-center gap-2">
                      {usage >= 90 && (
                        <Badge variant="destructive">Casi agotada</Badge>
                      )}
                      {daysUntilExpiration <= 30 && daysUntilExpiration > 0 && (
                        <Badge variant="destructive">Por vencer</Badge>
                      )}
                      {daysUntilExpiration <= 0 && (
                        <Badge variant="destructive">Vencida</Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/ncf/sequences/create')}
              >
                Crear Nueva Secuencia
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información y recordatorios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recordatorios Fiscales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
              <div>
                <p className="font-medium">Presentación de Reportes DGII</p>
                <p className="text-muted-foreground">
                  Los reportes 606 y 607 deben presentarse mensualmente según el
                  calendario establecido por la DGII
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
              <div>
                <p className="font-medium">Renovación de Secuencias NCF</p>
                <p className="text-muted-foreground">
                  Solicita nuevas secuencias con anticipación para evitar
                  interrupciones en la facturación
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
              <div>
                <p className="font-medium">Validación de NCF</p>
                <p className="text-muted-foreground">
                  Todas las facturas con valor fiscal deben incluir un NCF válido
                  y vigente
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de secuencias activas */}
      {stats.active > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Uso de Secuencias Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sequences
                .filter((s) => s.isActive && !s.isExpired)
                .slice(0, 5)
                .map((sequence) => {
                  const usage = getUsagePercentage(sequence);
                  return (
                    <div
                      key={sequence.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {sequence.ncfType}
                        </code>
                        <span className="text-sm">
                          {sequence.prefix}
                          {sequence.series}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              usage >= 90
                                ? 'bg-red-600'
                                : usage >= 70
                                ? 'bg-orange-600'
                                : 'bg-green-600'
                            }`}
                            style={{ width: `${usage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {usage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
