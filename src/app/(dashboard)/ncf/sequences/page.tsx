'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertTriangle, Edit, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import ncfService, {
  NcfSequence,
  ncfTypeLabels,
  NcfType,
} from '@/lib/services/ncfService';
import { toast } from 'sonner';
import { PermissionService } from '@/lib/services/permissionService';
import { ExportButton } from '@/components/ui/export-button';
import { formatDateWithoutTimezone } from '@/lib/utils/dateUtils';

export default function NcfSequencesPage() {
  const router = useRouter();
  const canCreateSequence = PermissionService.hasPermission('NCF', 'CREATE_SEQUENCE');
  const canUpdateSequence = PermissionService.hasPermission('NCF', 'UPDATE_SEQUENCE');
  const [sequences, setSequences] = useState<NcfSequence[]>([]);
  const [expiringSequences, setExpiringSequences] = useState<NcfSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  const loadSequences = async () => {
    try {
      setLoading(true);
      const [allSequences, expiring] = await Promise.all([
        ncfService.getAllSequences(),
        ncfService.checkExpiringSequences(),
      ]);
      setSequences(allSequences);
      setExpiringSequences(expiring);
    } catch (error) {
      console.error('Error cargando secuencias:', error);
      toast.error('Error al cargar las secuencias NCF');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSequences();
  }, []);

  const filteredSequences = sequences.filter((seq) => {
    if (filterType === 'all') return true;
    if (filterType === 'active') return seq.isActive && !seq.isExpired;
    if (filterType === 'expired') return seq.isExpired;
    if (filterType === 'expiring')
      return expiringSequences.some((exp) => exp.id === seq.id);
    return seq.ncfType === filterType;
  });

  const getUsagePercentage = (sequence: NcfSequence): number => {
    const total = sequence.rangeEnd - sequence.rangeStart + 1;
    const used = Math.max(0, sequence.currentNumber - sequence.rangeStart + 1);
    return Math.round((used / total) * 100);
  };

  const getUsageBadgeColor = (percentage: number): string => {
    if (percentage >= 90) return 'destructive';
    if (percentage >= 70) return 'default';
    return 'secondary';
  };

  const isExpiringSoon = (sequence: NcfSequence): boolean => {
    return expiringSequences.some((exp) => exp.id === sequence.id);
  };

  const handleExport = async (format: 'pdf' | 'excel', startDate?: string, endDate?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('No estás autenticado');
        return;
      }

      const params = new URLSearchParams({ format });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ncf/export?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `secuencias-ncf-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Archivo ${format.toUpperCase()} descargado exitosamente`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al exportar datos');
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Secuencias NCF</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Gestión de Números de Comprobante Fiscal
          </p>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <ExportButton screenCode="NCF" onExport={handleExport} size="sm" />
          {canCreateSequence && (
            <Button size="sm" onClick={() => router.push('/ncf/sequences/create')}>
              <Plus className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Nueva Secuencia</span>
            </Button>
          )}
        </div>
      </div>

      {/* Alertas de secuencias próximas a vencer */}
      {expiringSequences.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm">
            Tienes {expiringSequences.length} secuencia(s) próxima(s) a vencer o
            agotarse. Revisa el listado y crea nuevas secuencias.
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Total Secuencias</p>
          <p className="text-lg sm:text-2xl font-bold mt-1">{sequences.length}</p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Activas</p>
          <p className="text-lg sm:text-2xl font-bold mt-1 text-green-600">
            {sequences.filter((s) => s.isActive && !s.isExpired).length}
          </p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Vencidas</p>
          <p className="text-lg sm:text-2xl font-bold mt-1 text-gray-500">
            {sequences.filter((s) => s.isExpired).length}
          </p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Por Vencer</p>
          <p className="text-lg sm:text-2xl font-bold mt-1 text-destructive">
            {expiringSequences.length}
          </p>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 sm:gap-4 items-center">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[250px] text-xs sm:text-sm h-8 sm:h-9">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las secuencias</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="expired">Vencidas</SelectItem>
            <SelectItem value="expiring">Por vencer</SelectItem>
            <SelectItem value={NcfType.B01}>
              {ncfTypeLabels[NcfType.B01]}
            </SelectItem>
            <SelectItem value={NcfType.B02}>
              {ncfTypeLabels[NcfType.B02]}
            </SelectItem>
            <SelectItem value={NcfType.B03}>
              {ncfTypeLabels[NcfType.B03]}
            </SelectItem>
            <SelectItem value={NcfType.B04}>
              {ncfTypeLabels[NcfType.B04]}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={loadSequences} className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabla de secuencias */}
      <Card>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="sm:hidden divide-y">
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Cargando secuencias...
              </div>
            ) : filteredSequences.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No hay secuencias NCF registradas
              </div>
            ) : (
              filteredSequences.map((sequence) => {
                const usagePercentage = getUsagePercentage(sequence);
                const expiring = isExpiringSoon(sequence);

                return (
                  <div key={sequence.id} className="p-3 hover:bg-muted/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {ncfTypeLabels[sequence.ncfType]}
                          </span>
                          <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-semibold">
                            {sequence.prefix}
                          </code>
                          {sequence.isExpired ? (
                            <Badge variant="destructive" className="text-[10px] px-1.5">Vencida</Badge>
                          ) : sequence.isActive ? (
                            <Badge variant="default" className="text-[10px] px-1.5">Activa</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] px-1.5">Inactiva</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Rango: {sequence.rangeStart.toLocaleString()} - {sequence.rangeEnd.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-[10px] bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded font-mono">
                            Próx: {sequence.prefix}{(sequence.currentNumber + 1).toString().padStart(8, '0')}
                          </code>
                          <Badge
                            variant={getUsageBadgeColor(usagePercentage) as any}
                            className="text-[10px] px-1.5"
                          >
                            {usagePercentage}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <span>
                            {formatDateWithoutTimezone(sequence.validFrom)} - {formatDateWithoutTimezone(sequence.validUntil)}
                          </span>
                          {expiring && (
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          )}
                        </div>
                        {sequence.branch?.name && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Sucursal: {sequence.branch.name}
                          </div>
                        )}
                      </div>
                      {canUpdateSequence && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => router.push(`/ncf/sequences/${sequence.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo NCF</TableHead>
                  <TableHead>Prefijo</TableHead>
                  <TableHead>Rango</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Próximo NCF</TableHead>
                  <TableHead>Uso</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Sucursal</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Cargando secuencias...
                    </TableCell>
                  </TableRow>
                ) : filteredSequences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No hay secuencias NCF registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSequences.map((sequence) => {
                    const usagePercentage = getUsagePercentage(sequence);
                    const expiring = isExpiringSoon(sequence);

                    return (
                      <TableRow key={sequence.id}>
                        <TableCell className="font-medium">
                          {ncfTypeLabels[sequence.ncfType]}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded font-semibold">
                            {sequence.prefix}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm">
                          {sequence.rangeStart.toLocaleString()} - {sequence.rangeEnd.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">
                            {sequence.currentNumber.toLocaleString()}
                          </code>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded font-mono">
                            {sequence.prefix}{(sequence.currentNumber + 1).toString().padStart(8, '0')}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getUsageBadgeColor(usagePercentage) as any}
                          >
                            {usagePercentage}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDateWithoutTimezone(sequence.validFrom)} -{' '}
                          {formatDateWithoutTimezone(sequence.validUntil)}
                          {expiring && (
                            <AlertTriangle className="inline-block ml-2 h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell>
                          {sequence.isExpired ? (
                            <Badge variant="destructive">Vencida</Badge>
                          ) : sequence.isActive ? (
                            <Badge variant="default">Activa</Badge>
                          ) : (
                            <Badge variant="secondary">Inactiva</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sequence.branch?.name || 'Todas'}
                        </TableCell>
                        <TableCell className="text-right">
                          {canUpdateSequence && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/ncf/sequences/${sequence.id}`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
