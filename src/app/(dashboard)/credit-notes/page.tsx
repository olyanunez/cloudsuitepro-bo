'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, FileText, Download, Calendar, DollarSign, TrendingDown, Eye } from 'lucide-react';
import { creditNoteService, CreditNote, QueryCreditNotesDto, CreditNoteStats } from '@/lib/services/creditNoteService';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ExportButton } from '@/components/ui/export-button';
import { toast } from 'sonner';

export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [stats, setStats] = useState<CreditNoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filtros
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fiscalTypeFilter, setFiscalTypeFilter] = useState<'FISCAL' | 'INTERNAL' | ''>('');

  useEffect(() => {
    loadCreditNotes();
    loadStats();
  }, [search, startDate, endDate, fiscalTypeFilter]);

  const loadCreditNotes = async () => {
    try {
      setLoading(true);
      const query: QueryCreditNotesDto = {
        limit: 50,
        offset: 0,
      };

      if (search) {
        if (search.startsWith('NC-')) {
          query.creditNoteNumber = search;
        } else if (search.startsWith('E') && search.length > 2) {
          query.ncf = search;
        } else {
          query.originalInvoiceNumber = search;
        }
      }

      if (startDate) query.startDate = startDate;
      if (endDate) query.endDate = endDate;
      if (fiscalTypeFilter) query.fiscalType = fiscalTypeFilter;

      const response = await creditNoteService.getAll(query);
      setCreditNotes(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading credit notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await creditNoteService.getStats(
        undefined,
        startDate || undefined,
        endDate || undefined
      );
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getFiscalTypeBadge = (fiscalType: string) => {
    if (fiscalType === 'FISCAL') {
      return <Badge variant="default">Con NCF B04</Badge>;
    }
    return <Badge variant="secondary">Sin NCF</Badge>;
  };

  const getRefundMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      TRANSFER: 'Transferencia',
      STORE_CREDIT: 'Crédito en Tienda',
    };
    return labels[method] || method;
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
        `${process.env.NEXT_PUBLIC_API_URL}/credit-notes/export?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notas-credito-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Notas de Crédito / Devoluciones</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Gestión de devoluciones y notas de crédito fiscales
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end self-end sm:self-auto">
          <ExportButton screenCode="CREDIT_NOTE" onExport={handleExport} size="sm" />
          <Button asChild size="sm">
            <Link href="/credit-notes/create">
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Nueva Devolución</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Devoluciones</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.totalReturns}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Notas de crédito procesadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Monto Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Total devuelto
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Con NCF B04</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.fiscalReturns}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Devoluciones fiscales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Sin NCF</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-lg sm:text-2xl font-bold">{stats.internalReturns}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Devoluciones internas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="NC-00001, NCF, Factura..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscalType">Tipo Fiscal</Label>
              <select
                id="fiscalType"
                value={fiscalTypeFilter}
                onChange={(e) => setFiscalTypeFilter(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">Todos</option>
                <option value="FISCAL">Con NCF B04</option>
                <option value="INTERNAL">Sin NCF</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Listado de Notas de Crédito</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {total} {total === 1 ? 'registro' : 'registros'} encontrados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {loading ? (
            <div className="text-center py-8 text-sm">Cargando...</div>
          ) : creditNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No se encontraron notas de crédito
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y">
                {creditNotes.map((cn) => (
                  <div key={cn.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{cn.creditNoteNumber}</span>
                          {getFiscalTypeBadge(cn.fiscalType)}
                        </div>
                        {cn.ncf && (
                          <div className="text-xs text-muted-foreground font-mono mt-1">
                            NCF: {cn.ncf}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          Factura: {cn.originalInvoiceNumber}
                        </div>
                        {cn.customer && (
                          <div className="text-xs mt-1">
                            {cn.customer.name} {cn.customer.lastName}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-medium text-primary">
                            {formatCurrency(cn.total)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(cn.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Link href={`/credit-notes/${cn.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número NC</TableHead>
                      <TableHead>NCF B04</TableHead>
                      <TableHead>Factura Original</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Método Reembolso</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditNotes.map((cn) => (
                      <TableRow key={cn.id}>
                        <TableCell className="font-medium">{cn.creditNoteNumber}</TableCell>
                        <TableCell>
                          {cn.ncf ? (
                            <span className="text-sm font-mono">{cn.ncf}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{cn.originalInvoiceNumber}</div>
                            {cn.originalNcf && (
                              <div className="text-xs text-muted-foreground font-mono">
                                {cn.originalNcf}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {cn.customer ? (
                            <div>
                              <div>{cn.customer.name} {cn.customer.lastName}</div>
                              {cn.customer.taxId && (
                                <div className="text-xs text-muted-foreground">
                                  RNC: {cn.customer.taxId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getFiscalTypeBadge(cn.fiscalType)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getRefundMethodLabel(cn.refundMethod)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(cn.total)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(cn.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Link href={`/credit-notes/${cn.id}`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
