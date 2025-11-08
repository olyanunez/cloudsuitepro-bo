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
import ncfService, {
  NcfSequence,
  ncfTypeLabels,
  NcfType,
} from '@/lib/services/ncfService';
import { toast } from 'sonner';

export default function NcfSequencesPage() {
  const router = useRouter();
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
    const used = sequence.currentNumber - sequence.rangeStart;
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Secuencias NCF</h1>
          <p className="text-muted-foreground">
            Gestión de Números de Comprobante Fiscal
          </p>
        </div>
        <Button onClick={() => router.push('/ncf/sequences/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Secuencia
        </Button>
      </div>

      {/* Alertas de secuencias próximas a vencer */}
      {expiringSequences.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tienes {expiringSequences.length} secuencia(s) próxima(s) a vencer o
            agotarse. Revisa el listado y crea nuevas secuencias.
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Secuencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sequences.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sequences.filter((s) => s.isActive && !s.isExpired).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sequences.filter((s) => s.isExpired).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {expiringSequences.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[250px]">
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
        <Button variant="outline" size="icon" onClick={loadSequences}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabla de secuencias */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo NCF</TableHead>
                <TableHead>Serie</TableHead>
                <TableHead>Rango</TableHead>
                <TableHead>Actual</TableHead>
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
                  <TableCell colSpan={9} className="text-center py-8">
                    Cargando secuencias...
                  </TableCell>
                </TableRow>
              ) : filteredSequences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
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
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {sequence.prefix}
                          {sequence.series}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm">
                        {sequence.rangeStart.toString().padStart(8, '0')} -{' '}
                        {sequence.rangeEnd.toString().padStart(8, '0')}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">
                          {sequence.currentNumber.toString().padStart(8, '0')}
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
                        {formatDate(sequence.validFrom)} -{' '}
                        {formatDate(sequence.validUntil)}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/ncf/sequences/${sequence.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
