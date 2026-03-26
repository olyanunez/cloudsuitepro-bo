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
import { PlusIcon, SearchIcon, EyeIcon, Package, AlertTriangle, Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '@/components/ProtectedPage';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { formatCurrency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExportButton } from '@/components/ui/export-button';

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
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const limit = itemsPerPage;

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
  }, [page, search, statusFilter, withStockOnly, itemsPerPage]);

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
        `${process.env.NEXT_PUBLIC_API_URL}/batches/export?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lotes-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
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
    <ProtectedPage screenCode="INVENTORY" requiredPermission="VIEW">
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Gestión de Lotes</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Control de trazabilidad y vencimientos
            </p>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <ExportButton screenCode="BATCHES" onExport={handleExport} size="sm" />
            <Link href="/inventory/batches/create">
              <Button size="sm" className="bg-primary hover:bg-primary-600">
                <PlusIcon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Nuevo Lote</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar lotes..."
              className="pl-10 w-full"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? '' : value as BatchStatus);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value={BatchStatus.ACTIVE}>Activo</SelectItem>
              <SelectItem value={BatchStatus.RESERVED}>Reservado</SelectItem>
              <SelectItem value={BatchStatus.DEPLETED}>Agotado</SelectItem>
              <SelectItem value={BatchStatus.EXPIRED}>Vencido</SelectItem>
              <SelectItem value={BatchStatus.BLOCKED}>Bloqueado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={withStockOnly ? "withStock" : "all"}
            onValueChange={(value) => {
              setWithStockOnly(value === "withStock");
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Inventario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los lotes</SelectItem>
              <SelectItem value="withStock">Solo con stock</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Elementos por página" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 por página</SelectItem>
              <SelectItem value="10">10 por página</SelectItem>
              <SelectItem value="25">25 por página</SelectItem>
              <SelectItem value="50">50 por página</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Lotes</p>
                <p className="text-lg sm:text-2xl font-bold">{total}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 sm:p-3 rounded-full">
                <Package className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Lotes Activos</p>
                <p className="text-lg sm:text-2xl font-bold">{activeBatches}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-2 sm:p-3 rounded-full">
                <Package className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Por Vencer (30d)</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">{expiringBatches}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/20 p-2 sm:p-3 rounded-full">
                <AlertTriangle className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Valor Total</p>
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-2 sm:p-3 rounded-full">
                <Archive className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Cargando...</div>
            ) : batches.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No se encontraron lotes</div>
            ) : (
              batches.map((batch) => {
                const daysUntilExp = getDaysUntilExpiration(batch.expirationDate);
                const isExpiringSoon = daysUntilExp !== null && daysUntilExp <= 30 && daysUntilExp > 0;
                const isExpired = daysUntilExp !== null && daysUntilExp <= 0;

                return (
                  <div key={batch.id} className="p-3 hover:bg-muted/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{batch.batchNumber}</span>
                          {getStatusBadge(batch.status)}
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                          {batch.product?.name || '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {batch.warehouse?.name || '-'} • Stock: {batch.currentQuantity}/{batch.initialQuantity}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            Vence: {formatDate(batch.expirationDate)}
                          </span>
                          {isExpiringSoon && (
                            <Badge variant="outline" className="text-[10px] px-1.5 text-orange-600 border-orange-600">
                              {daysUntilExp}d
                            </Badge>
                          )}
                          {isExpired && (
                            <Badge variant="destructive" className="text-[10px] px-1.5">Vencido</Badge>
                          )}
                        </div>
                        <div className="text-xs font-medium mt-1">
                          {formatCurrency(batch.unitCost)}
                        </div>
                      </div>
                      <Link href={`/inventory/batches/${batch.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Lote
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Almacén
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fabricación
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Costo Unit.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center">
                      Cargando...
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-muted-foreground">
                      No se encontraron lotes
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => {
                    const daysUntilExp = getDaysUntilExpiration(batch.expirationDate);
                    const isExpiringSoon = daysUntilExp !== null && daysUntilExp <= 30 && daysUntilExp > 0;
                    const isExpired = daysUntilExp !== null && daysUntilExp <= 0;

                    return (
                      <tr key={batch.id}>
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
                            {batch.reservedQuantity > 0 && (
                              <div className="text-xs text-blue-600 dark:text-blue-400">
                                {batch.reservedQuantity} reservadas
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {batch.supplierName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(batch.manufacturingDate)}
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/inventory/batches/${batch.id}`}>
                              <Button variant="outline" size="sm" className="px-2 py-1">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
            Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total} lotes
          </div>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(Math.max(page - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Mobile: Show current/total */}
            <span className="sm:hidden text-sm px-2">
              {page} / {totalPages || 1}
            </span>

            {/* Desktop: Show page buttons */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
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
