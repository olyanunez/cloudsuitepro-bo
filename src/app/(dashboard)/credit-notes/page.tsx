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
import { Search, Plus, FileText, Download, Calendar, DollarSign, TrendingDown } from 'lucide-react';
import { creditNoteService, CreditNote, QueryCreditNotesDto, CreditNoteStats } from '@/lib/services/creditNoteService';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notas de Crédito / Devoluciones</h1>
          <p className="text-muted-foreground">
            Gestión de devoluciones y notas de crédito fiscales
          </p>
        </div>
        <Button asChild>
          <Link href="/credit-notes/create">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Devolución
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Devoluciones</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReturns}</div>
              <p className="text-xs text-muted-foreground">
                Notas de crédito procesadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Total devuelto
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con NCF B04</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fiscalReturns}</div>
              <p className="text-xs text-muted-foreground">
                Devoluciones fiscales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sin NCF</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.internalReturns}</div>
              <p className="text-xs text-muted-foreground">
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
        <CardHeader>
          <CardTitle>Listado de Notas de Crédito</CardTitle>
          <CardDescription>
            {total} {total === 1 ? 'registro' : 'registros'} encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : creditNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron notas de crédito
            </div>
          ) : (
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
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/credit-notes/${cn.id}`}>
                          Ver Detalle
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
