'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BatchService } from '@/lib/services/batchService';
import { Batch, BatchStatus, FilterBatchDto } from '@/lib/types/batch';
import { Plus, Search, Eye, Package, AlertTriangle, Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '@/components/ProtectedPage';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';

export default function BatchesPage() {
  const router = useRouter();
  const { canCreate, canUpdate } = usePermissions('INVENTORY');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<BatchStatus | ''>('');
  const [withStockOnly, setWithStockOnly] = useState(true);
  const limit = 15;

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const filters: FilterBatchDto = {
        page,
        limit,
        ...(search && { batchNumber: search }),
        ...(statusFilter && { status: statusFilter }),
        withStock: withStockOnly,
      };

      const response = await BatchService.getAll(filters);
      setBatches(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error: any) {
      toast.error('Error al cargar lotes', {
        description: error.message || 'No se pudieron cargar los lotes',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [page, statusFilter, withStockOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBatches();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getStatusBadge = (status: BatchStatus) => {
    const variants = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      RESERVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      DEPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      BLOCKED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    };

    const labels = {
      ACTIVE: 'Activo',
      RESERVED: 'Reservado',
      DEPLETED: 'Agotado',
      EXPIRED: 'Vencido',
      BLOCKED: 'Bloqueado',
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${variants[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiration = (expirationDate: string | Date | null | undefined) => {
    if (!expirationDate) return null;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalValue = batches.reduce((sum, b) => sum + (b.currentQuantity * b.unitCost), 0);
  const activeBatches = batches.filter(b => b.status === BatchStatus.ACTIVE).length;
  const expiringBatches = batches.filter(b => {
    const days = getDaysUntilExpiration(b.expirationDate);
    return days !== null && days <= 30 && days > 0;
  }).length;

  return (
    <ProtectedPage screenCode="INVENTORY" requiredPermission="VIEW">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Lotes</h1>
            <p className="text-muted-foreground mt-1">
              Control de trazabilidad y vencimientos
            </p>
          </div>
          {canCreate && (
            <Link href="/inventory/batches/create">
              <Button className="bg-primary hover:bg-primary-600">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Lote
              </Button>
            </Link>
          )}
        </div>

        {/* Search & Filters */}
        <Card className="p-4 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por número de lote..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit">Buscar</Button>
            </div>

            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Estado:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as BatchStatus | '')}
                  className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
                >
                  <option value="">Todos</option>
                  <option value={BatchStatus.ACTIVE}>Activo</option>
                  <option value={BatchStatus.RESERVED}>Reservado</option>
                  <option value={BatchStatus.DEPLETED}>Agotado</option>
                  <option value={BatchStatus.EXPIRED}>Vencido</option>
                  <option value={BatchStatus.BLOCKED}>Bloqueado</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="withStock"
                  checked={withStockOnly}
                  onChange={(e) => setWithStockOnly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="withStock" className="text-sm font-medium">
                  Solo con stock disponible
                </label>
              </div>
            </div>
          </form>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Lotes</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lotes Activos</p>
                <p className="text-2xl font-bold">{activeBatches}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Por Vencer (30d)</p>
                <p className="text-2xl font-bold text-orange-600">{expiringBatches}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                <Archive className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Almacén
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Entrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Costo Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center">
                      Cargando...
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-muted-foreground">
                      No se encontraron lotes
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => {
                    const daysUntilExp = getDaysUntilExpiration(batch.expirationDate);
                    const isExpiringSoon = daysUntilExp !== null && daysUntilExp <= 30 && daysUntilExp > 0;
                    const isExpired = daysUntilExp !== null && daysUntilExp <= 0;

                    return (
                      <tr key={batch.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {batch.batchNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {batch.product?.name || '-'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {batch.product?.code || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {batch.warehouse?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium">{batch.currentQuantity}</div>
                            <div className="text-xs text-gray-500">
                              de {batch.initialQuantity}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(batch.entryDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm">{formatDate(batch.expirationDate)}</div>
                            {isExpiringSoon && (
                              <Badge variant="outline" className="mt-1 text-orange-600 border-orange-600">
                                {daysUntilExp} días
                              </Badge>
                            )}
                            {isExpired && (
                              <Badge variant="destructive" className="mt-1">
                                Vencido
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(batch.unitCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(batch.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/inventory/batches/${batch.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
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
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total} lotes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(page - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
