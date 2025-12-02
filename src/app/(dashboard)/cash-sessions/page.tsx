'use client';

import { useState, useEffect, useMemo } from 'react';
import { CashSession, CashSessionService } from '@/lib/services/cashSessionService';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EyeIcon, SearchIcon, ArrowUpDown, ChevronLeft, ChevronRight, XIcon, Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/layout/PageHeader';
import ProtectedPage from '@/components/ProtectedPage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function CashSessionsPage() {
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'sessionNumber' | 'openedAt' | 'closedAt'>('openedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await CashSessionService.getSessions({
        limit: 100,
        offset: 0,
      });
      setSessions(response);
    } catch (error) {
      console.error('Error loading cash sessions:', error);
      toast.error('Error al cargar las sesiones de caja');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    return sessions
      .filter(session => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch =
          session.sessionNumber.toLowerCase().includes(searchTermLower) ||
          (session.user?.name || '').toLowerCase().includes(searchTermLower) ||
          (session.branch?.name || '').toLowerCase().includes(searchTermLower);

        const matchesStatus = statusFilter === 'ALL' || session.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let fieldA: string | Date;
        let fieldB: string | Date;

        if (sortField === 'openedAt' || sortField === 'closedAt') {
          fieldA = new Date(a[sortField] || 0);
          fieldB = new Date(b[sortField] || 0);
        } else {
          fieldA = (a[sortField] as string).toLowerCase();
          fieldB = (b[sortField] as string).toLowerCase();
        }

        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [sessions, searchTerm, statusFilter, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: 'sessionNumber' | 'openedAt' | 'closedAt') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'ALL';

  // Helper para determinar estado del cuadre
  const getCuadreStatus = (session: CashSession) => {
    if (session.status === 'OPEN') return null;

    const diffCash = parseFloat(session.difference || '0');
    const diffVouchers = parseFloat(session.differenceVouchers || '0');

    if (diffCash < 0 || diffVouchers < 0) {
      return { status: 'shortage', label: 'Faltante', color: 'text-red-600 bg-red-100' };
    }
    if (diffCash > 0 || diffVouchers > 0) {
      return { status: 'surplus', label: 'Sobrante', color: 'text-blue-600 bg-blue-100' };
    }
    return { status: 'exact', label: 'Exacto', color: 'text-green-600 bg-green-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedPage screenCode="CASH_SESSIONS" requiredPermission="VIEW">
      <div className="container mx-auto py-8">
        <PageHeader
          title="Sesiones de Caja"
          description="Historial de sesiones de caja y cuadres"
          icon="calculator"
        />

        {/* Search and filter controls */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por número, cajero, sucursal..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="OPEN">Abierta</SelectItem>
                <SelectItem value="CLOSED">Cerrada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={itemsPerPage.toString()} onValueChange={(value: string) => setItemsPerPage(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Elementos por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="25">25 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
                <SelectItem value="100">100 por página</SelectItem>
              </SelectContent>
            </Select>

            <div></div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-sm"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Limpiar filtros
              </Button>
              <span className="text-sm text-gray-500">
                {filteredSessions.length} resultado(s) encontrado(s)
              </span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('sessionNumber')}
                  >
                    <div className="flex items-center">
                      No. Sesión
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('openedAt')}
                  >
                    <div className="flex items-center">
                      Apertura
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('closedAt')}
                  >
                    <div className="flex items-center">
                      Cierre
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cajero
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sucursal
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Ventas
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cuadre
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedSessions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No se encontraron sesiones de caja
                    </td>
                  </tr>
                ) : (
                  paginatedSessions.map((session) => {
                    const totalVentas =
                      parseFloat(session.totalCash || '0') +
                      parseFloat(session.totalCard || '0') +
                      parseFloat(session.totalTransfer || '0') +
                      parseFloat(session.totalOther || '0');
                    const cuadreStatus = getCuadreStatus(session);

                    return (
                      <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {session.sessionNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            {new Date(session.openedAt).toLocaleDateString('es-DO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            {session.closedAt
                              ? new Date(session.closedAt).toLocaleDateString('es-DO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {session.user?.name || 'Sin cajero'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {session.branch?.name || 'Sin sucursal'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(totalVentas)}
                          </div>
                          <div className="text-xs text-gray-500">
                            <span title="Efectivo">💵 {formatCurrency(parseFloat(session.totalCash || '0'))}</span>
                            {' | '}
                            <span title="Tarjeta">💳 {formatCurrency(parseFloat(session.totalCard || '0'))}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge variant={session.status === 'OPEN' ? 'default' : 'secondary'}>
                            {session.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {cuadreStatus ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cuadreStatus.color}`}>
                              {cuadreStatus.status === 'exact' && <CheckCircle2 className="h-3 w-3" />}
                              {cuadreStatus.status === 'shortage' && <AlertTriangle className="h-3 w-3" />}
                              {cuadreStatus.label}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/cash-sessions/${session.id}`}>
                            <Button variant="outline" size="sm" className="px-2 py-1">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        {filteredSessions.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSessions.length)} de {filteredSessions.length} sesiones
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
