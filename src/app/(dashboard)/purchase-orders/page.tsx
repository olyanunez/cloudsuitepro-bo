'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiGet, apiDelete, apiPost } from '@/lib/services/apiService';
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, EyeIcon, Send, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '@/components/ProtectedPage';
import { usePermissions } from '@/lib/hooks/usePermissions';
import PageHeader from '@/components/layout/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PurchaseOrder, PurchaseOrderStatus } from '@/lib/types/purchase-order';

interface PurchaseOrderResponse {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface Supplier {
  id: number;
  name: string;
  code: string;
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { canCreate, canUpdate, canDelete } = usePermissions('PURCHASE_ORDERS');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const limit = itemsPerPage;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<{ id: number; orderNumber: string } | null>(null);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(supplierFilter !== 'all' && { supplierId: supplierFilter }),
      });

      const response = await apiGet<PurchaseOrderResponse>(`/purchase-orders?${params}`);
      setPurchaseOrders(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error: any) {
      toast.error('Error al cargar órdenes de compra', {
        description: error.message || 'No se pudieron cargar las órdenes de compra',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await apiGet<Supplier[]>('/suppliers/active');
      setSuppliers(response);
    } catch (error: any) {
      console.error('Error loading suppliers:', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [page, search, itemsPerPage, statusFilter, supplierFilter]);

  const confirmDelete = (id: number, orderNumber: string) => {
    setOrderToDelete({ id, orderNumber });
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;

    try {
      await apiDelete(`/purchase-orders/${orderToDelete.id}`);
      toast.success('Orden de compra eliminada exitosamente');
      fetchPurchaseOrders();
    } catch (error: any) {
      toast.error('Error al eliminar orden de compra', {
        description: error.message || 'No se pudo eliminar la orden de compra',
      });
    } finally {
      setOrderToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSendToSupplier = async (id: number) => {
    try {
      await apiPost(`/purchase-orders/${id}/send`, {});
      toast.success('Orden de compra enviada al proveedor exitosamente');
      fetchPurchaseOrders();
    } catch (error: any) {
      toast.error('Error al enviar orden de compra', {
        description: error.message,
      });
    }
  };

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    const statusConfig: Record<PurchaseOrderStatus, { label: string; className: string }> = {
      [PurchaseOrderStatus.DRAFT]: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
      [PurchaseOrderStatus.SENT]: { label: 'Enviada', className: 'bg-blue-100 text-blue-800' },
      [PurchaseOrderStatus.CONFIRMED]: { label: 'Confirmada', className: 'bg-purple-100 text-purple-800' },
      [PurchaseOrderStatus.RECEIVED]: { label: 'Recibida', className: 'bg-green-100 text-green-800' },
      [PurchaseOrderStatus.PARTIAL]: { label: 'Parcial', className: 'bg-yellow-100 text-yellow-800' },
      [PurchaseOrderStatus.CANCELLED]: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <ProtectedPage screenCode="PURCHASE_ORDERS" requiredPermission="VIEW">
      <div className="container mx-auto py-8">
        <PageHeader
          title="Órdenes de Compra"
          description="Gestiona las órdenes de compra a proveedores"
          icon="file-text"
        >
          {canCreate && (
            <Link href="/purchase-orders/create">
              <Button className="bg-primary hover:bg-primary-600">
                <PlusIcon className="h-4 w-4 mr-2" />
                Nueva Orden
              </Button>
            </Link>
          )}
        </PageHeader>

        {/* Search and filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por número o proveedor..."
              className="pl-10 w-full"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="DRAFT">Borrador</SelectItem>
              <SelectItem value="SENT">Enviada</SelectItem>
              <SelectItem value="CONFIRMED">Confirmada</SelectItem>
              <SelectItem value="RECEIVED">Recibida</SelectItem>
              <SelectItem value="PARTIAL">Parcial</SelectItem>
              <SelectItem value="CANCELLED">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={supplierFilter}
            onValueChange={(value) => {
              setSupplierFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proveedores</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </SelectItem>
              ))}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Órdenes</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Borradores</p>
                <p className="text-2xl font-bold">
                  {purchaseOrders.filter((po) => po.status === PurchaseOrderStatus.DRAFT).length}
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900/20 p-3 rounded-full">
                <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enviadas</p>
                <p className="text-2xl font-bold">
                  {purchaseOrders.filter((po) => po.status === PurchaseOrderStatus.SENT).length}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recibidas</p>
                <p className="text-2xl font-bold">
                  {purchaseOrders.filter((po) => po.status === PurchaseOrderStatus.RECEIVED).length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Número
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
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
                    <td colSpan={7} className="px-6 py-4 text-center">
                      Cargando...
                    </td>
                  </tr>
                ) : purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                      No se encontraron órdenes de compra
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {order.supplier?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.supplier?.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order._count?.items || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {order.status === PurchaseOrderStatus.DRAFT && canUpdate && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-2 py-1"
                              onClick={() => handleSendToSupplier(order.id)}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Link href={`/purchase-orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="px-2 py-1">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Link>
                          {canUpdate && order.status === PurchaseOrderStatus.DRAFT && (
                            <Link href={`/purchase-orders/edit/${order.id}`}>
                              <Button variant="outline" size="sm" className="px-2 py-1">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          {canDelete && (order.status === PurchaseOrderStatus.DRAFT || order.status === PurchaseOrderStatus.SENT) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-2 py-1 border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                              onClick={() => confirmDelete(order.id, order.orderNumber)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total} órdenes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

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
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente la orden de compra
                &quot;{orderToDelete?.orderNumber}&quot; del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="!bg-red-500 hover:!bg-red-600 !text-white"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedPage>
  );
}
