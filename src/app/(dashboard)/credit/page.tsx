'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  CreditCard,
  DollarSign,
  Users,
  Banknote,
  ArrowDownToLine,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Check,
  X,
  Pencil,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '@/components/ProtectedPage';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useBranch } from '@/lib/contexts/BranchContext';
import {
  CreditService,
  CustomerWithPendingBalance,
  PendingInvoice,
  CustomerCreditSummary,
  CreditPaymentMethod,
  CustomerCreditListItem,
} from '@/lib/services/creditService';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
  }).format(amount);
};

export default function CreditPage() {
  const { hasPermission } = usePermissions('CREDIT');
  const canReceivePayment = hasPermission('CAN_RECEIVE_PAYMENT');
  const canManageCreditLimit = hasPermission('CAN_MANAGE_CREDIT_LIMIT');
  const { activeBranchId, activeBranchName } = useBranch();

  const [activeTab, setActiveTab] = useState('collections');

  // ============================================
  // Estado para Cuentas por Cobrar (Collections)
  // ============================================
  const [customers, setCustomers] = useState<CustomerWithPendingBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithPendingBalance | null>(null);
  const [customerSummary, setCustomerSummary] = useState<CustomerCreditSummary | null>(null);
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([]);
  const [loadingCustomerData, setLoadingCustomerData] = useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<CreditPaymentMethod>(CreditPaymentMethod.CASH);
  const [paymentReference, setPaymentReference] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Statistics
  const [totalPendingBalance, setTotalPendingBalance] = useState(0);
  const [totalCustomersWithBalance, setTotalCustomersWithBalance] = useState(0);

  // ============================================
  // Estado para Gestión de Límites de Crédito
  // ============================================
  const [allCustomers, setAllCustomers] = useState<CustomerCreditListItem[]>([]);
  const [loadingAllCustomers, setLoadingAllCustomers] = useState(false);
  const [managementSearch, setManagementSearch] = useState('');
  const [managementPage, setManagementPage] = useState(1);

  // Credit limit dialog state
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerCreditListItem | null>(null);
  const [editAllowCredit, setEditAllowCredit] = useState(false);
  const [editCreditLimit, setEditCreditLimit] = useState('');
  const [savingCredit, setSavingCredit] = useState(false);

  // ============================================
  // Funciones para Cuentas por Cobrar
  // ============================================
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CreditService.getCustomersWithPendingBalance();
      setCustomers(data);

      // Calculate stats
      const total = data.reduce((sum, c) => sum + Number(c.currentBalance), 0);
      setTotalPendingBalance(total);
      setTotalCustomersWithBalance(data.length);
    } catch (error: any) {
      toast.error('Error al cargar clientes', {
        description: error.message || 'No se pudieron cargar los clientes con saldo pendiente',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // Funciones para Gestión de Límites
  // ============================================
  const fetchAllCustomers = useCallback(async () => {
    if (!canManageCreditLimit) return;

    try {
      setLoadingAllCustomers(true);
      const data = await CreditService.getAllCustomersForCreditManagement();
      setAllCustomers(data);
    } catch (error: any) {
      toast.error('Error al cargar clientes', {
        description: error.message || 'No se pudieron cargar los clientes',
      });
    } finally {
      setLoadingAllCustomers(false);
    }
  }, [canManageCreditLimit]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (activeTab === 'management' && allCustomers.length === 0) {
      fetchAllCustomers();
    }
  }, [activeTab, allCustomers.length, fetchAllCustomers]);

  const openPaymentDialog = async (customer: CustomerWithPendingBalance) => {
    setSelectedCustomer(customer);
    setIsPaymentDialogOpen(true);
    setLoadingCustomerData(true);

    try {
      const [summary, invoices] = await Promise.all([
        CreditService.getCustomerCreditSummary(customer.id),
        CreditService.getCustomerPendingInvoices(customer.id),
      ]);
      setCustomerSummary(summary);
      setPendingInvoices(invoices);
    } catch (error: any) {
      toast.error('Error al cargar datos del cliente', {
        description: error.message,
      });
    } finally {
      setLoadingCustomerData(false);
    }
  };

  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedCustomer(null);
    setCustomerSummary(null);
    setPendingInvoices([]);
    setPaymentAmount('');
    setPaymentMethod(CreditPaymentMethod.CASH);
    setPaymentReference('');
    setSelectedInvoiceId(null);
    setPaymentNotes('');
  };

  const handleSubmitPayment = async () => {
    if (!selectedCustomer || !activeBranchId) {
      if (!activeBranchId) {
        toast.error('No hay sucursal activa', {
          description: 'Seleccione una sucursal en el menú superior',
        });
      }
      return;
    }

    if (!selectedInvoiceId) {
      toast.error('Seleccione una factura', {
        description: 'Debe seleccionar una factura para aplicar el pago',
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }

    // Validar referencia para tarjeta y transferencia
    if ((paymentMethod === CreditPaymentMethod.CARD || paymentMethod === CreditPaymentMethod.TRANSFER) && !paymentReference.trim()) {
      toast.error('La referencia es obligatoria', {
        description: `Debe ingresar una referencia para pagos con ${paymentMethod === CreditPaymentMethod.CARD ? 'tarjeta' : 'transferencia'}`,
      });
      return;
    }

    if (amount > Number(selectedCustomer.currentBalance)) {
      toast.error('El monto excede el saldo pendiente del cliente');
      return;
    }

    setSubmittingPayment(true);
    try {
      await CreditService.createPayment({
        customerId: selectedCustomer.id,
        invoiceId: selectedInvoiceId,
        amount,
        paymentMethod,
        paymentReference: paymentReference || undefined,
        branchId: activeBranchId,
        notes: paymentNotes || undefined,
      });

      toast.success('Pago registrado exitosamente');
      closePaymentDialog();
      fetchCustomers();
    } catch (error: any) {
      toast.error('Error al registrar pago', {
        description: error.message,
      });
    } finally {
      setSubmittingPayment(false);
    }
  };

  // ============================================
  // Funciones para Gestión de Límites de Crédito
  // ============================================
  const openCreditDialog = (customer: CustomerCreditListItem) => {
    setEditingCustomer(customer);
    setEditAllowCredit(customer.allowCredit);
    setEditCreditLimit(customer.creditLimit.toString());
    setIsCreditDialogOpen(true);
  };

  const closeCreditDialog = () => {
    setIsCreditDialogOpen(false);
    setEditingCustomer(null);
    setEditAllowCredit(false);
    setEditCreditLimit('');
  };

  const handleSaveCredit = async () => {
    if (!editingCustomer) return;

    const creditLimit = parseFloat(editCreditLimit);
    if (editAllowCredit && (isNaN(creditLimit) || creditLimit < 0)) {
      toast.error('Ingrese un límite de crédito válido');
      return;
    }

    // Validate that limit is not less than current balance
    if (editAllowCredit && creditLimit < editingCustomer.currentBalance) {
      toast.error('El límite no puede ser menor al saldo pendiente', {
        description: `El cliente tiene un saldo de ${formatCurrency(editingCustomer.currentBalance)}`,
      });
      return;
    }

    setSavingCredit(true);
    try {
      const result = await CreditService.updateCustomerCredit(editingCustomer.id, {
        allowCredit: editAllowCredit,
        creditLimit: editAllowCredit ? creditLimit : 0,
      });

      toast.success(result.message);
      closeCreditDialog();
      fetchAllCustomers();
      // Also refresh the collections if there's a change
      fetchCustomers();
    } catch (error: any) {
      toast.error('Error al actualizar crédito', {
        description: error.message,
      });
    } finally {
      setSavingCredit(false);
    }
  };

  const handleQuickToggleCredit = async (customer: CustomerCreditListItem) => {
    if (customer.allowCredit) {
      // Disable credit
      if (customer.currentBalance > 0) {
        toast.error('No se puede deshabilitar', {
          description: `El cliente tiene un saldo pendiente de ${formatCurrency(customer.currentBalance)}`,
        });
        return;
      }

      try {
        const result = await CreditService.disableCustomerCredit(customer.id);
        toast.success(result.message);
        fetchAllCustomers();
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'No se pudo deshabilitar el crédito';
        toast.error('Error al deshabilitar crédito', {
          description: errorMessage,
        });
      }
    } else {
      // Open dialog to enable with limit
      openCreditDialog(customer);
    }
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = search.toLowerCase();
    return (
      customer.code.toLowerCase().includes(searchLower) ||
      customer.name.toLowerCase().includes(searchLower) ||
      (customer.lastName?.toLowerCase().includes(searchLower) ?? false) ||
      (customer.email?.toLowerCase().includes(searchLower) ?? false) ||
      (customer.phone?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  // Filter all customers for management
  const filteredAllCustomers = allCustomers.filter((customer) => {
    const searchLower = managementSearch.toLowerCase();
    return (
      customer.code.toLowerCase().includes(searchLower) ||
      customer.name.toLowerCase().includes(searchLower) ||
      (customer.lastName?.toLowerCase().includes(searchLower) ?? false) ||
      (customer.email?.toLowerCase().includes(searchLower) ?? false) ||
      (customer.phone?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  // Pagination for collections
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Pagination for management
  const managementTotalPages = Math.ceil(filteredAllCustomers.length / itemsPerPage);
  const paginatedAllCustomers = filteredAllCustomers.slice(
    (managementPage - 1) * itemsPerPage,
    managementPage * itemsPerPage
  );

  // Stats for management
  const customersWithCredit = allCustomers.filter((c) => c.allowCredit).length;
  const totalCreditLimit = allCustomers.reduce((sum, c) => sum + c.creditLimit, 0);

  return (
    <ProtectedPage screenCode="CREDIT" requiredPermission="VIEW">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Créditos</h1>
            <p className="text-muted-foreground mt-1">
              Administra los créditos, cobros y límites de tus clientes
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cuentas por Cobrar
            </TabsTrigger>
            {canManageCreditLimit && (
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Límites de Crédito
              </TabsTrigger>
            )}
          </TabsList>

          {/* ============================================ */}
          {/* TAB: Cuentas por Cobrar */}
          {/* ============================================ */}
          <TabsContent value="collections" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Total Pendiente</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(totalPendingBalance)}
                      </p>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Clientes con Saldo</p>
                      <p className="text-2xl font-bold">{totalCustomersWithBalance}</p>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-full">
                      <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Facturas Pendientes</p>
                      <p className="text-2xl font-bold">
                        {customers.reduce((sum, c) => sum + c.pendingInvoicesCount, 0)}
                      </p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Promedio por Cliente</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          totalCustomersWithBalance > 0
                            ? totalPendingBalance / totalCustomersWithBalance
                            : 0
                        )}
                      </p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por código, nombre, email o teléfono..."
                  className="pl-10 w-full"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

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

            {/* Customers Table */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Límite de Crédito
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Saldo Pendiente
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Disponible
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Facturas
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">
                          Cargando...
                        </td>
                      </tr>
                    ) : paginatedCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                          No se encontraron clientes con saldo pendiente
                        </td>
                      </tr>
                    ) : (
                      paginatedCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {customer.name} {customer.lastName || ''}
                              </div>
                              <div className="text-sm text-muted-foreground">{customer.code}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              {customer.email && <div>{customer.email}</div>}
                              {customer.phone && <div>{customer.phone}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-medium">
                              {formatCurrency(customer.creditLimit)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-red-600">
                              {formatCurrency(customer.currentBalance)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`font-medium ${customer.availableCredit > 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                            >
                              {formatCurrency(customer.availableCredit)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant="secondary">{customer.pendingInvoicesCount}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              {canReceivePayment && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => openPaymentDialog(customer)}
                                  className="!bg-green-600 hover:!bg-green-700 !text-white"
                                >
                                  <ArrowDownToLine className="h-4 w-4 mr-1" />
                                  Recibir Pago
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Mostrando {(page - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(page * itemsPerPage, filteredCustomers.length)} de{' '}
                  {filteredCustomers.length} clientes
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
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
                        variant={page === pageNum ? 'default' : 'outline'}
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
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ============================================ */}
          {/* TAB: Gestión de Límites de Crédito */}
          {/* ============================================ */}
          {canManageCreditLimit && (
            <TabsContent value="management" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Clientes</p>
                        <p className="text-2xl font-bold">{allCustomers.length}</p>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Con Crédito Habilitado</p>
                        <p className="text-2xl font-bold text-green-600">{customersWithCredit}</p>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                        <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Crédito Total Otorgado</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalCreditLimit)}</p>
                      </div>
                      <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                        <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar cliente por código, nombre, email o teléfono..."
                    className="pl-10 w-full"
                    value={managementSearch}
                    onChange={(e) => {
                      setManagementSearch(e.target.value);
                      setManagementPage(1);
                    }}
                  />
                </div>

                <Button variant="outline" onClick={fetchAllCustomers} disabled={loadingAllCustomers}>
                  {loadingAllCustomers ? 'Actualizando...' : 'Actualizar Lista'}
                </Button>
              </div>

              {/* Management Table */}
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Crédito Habilitado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Límite de Crédito
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Saldo Actual
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Disponible
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {loadingAllCustomers ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center">
                            Cargando...
                          </td>
                        </tr>
                      ) : paginatedAllCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                            No se encontraron clientes
                          </td>
                        </tr>
                      ) : (
                        paginatedAllCustomers.map((customer) => (
                          <tr
                            key={customer.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {customer.name} {customer.lastName || ''}
                                </div>
                                <div className="text-sm text-muted-foreground">{customer.code}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                {customer.email && <div>{customer.email}</div>}
                                {customer.phone && <div>{customer.phone}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center">
                                <Switch
                                  checked={customer.allowCredit}
                                  onCheckedChange={() => handleQuickToggleCredit(customer)}
                                  disabled={customer.allowCredit && customer.currentBalance > 0}
                                />
                                {customer.allowCredit ? (
                                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    <Check className="h-3 w-3 mr-1" />
                                    Sí
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="ml-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    No
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-medium">
                                {customer.allowCredit
                                  ? formatCurrency(customer.creditLimit)
                                  : '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                className={`font-medium ${customer.currentBalance > 0 ? 'text-red-600' : ''
                                  }`}
                              >
                                {formatCurrency(customer.currentBalance)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                className={`font-medium ${customer.availableCredit > 0
                                  ? 'text-green-600'
                                  : customer.availableCredit < 0
                                    ? 'text-red-600'
                                    : ''
                                  }`}
                              >
                                {customer.allowCredit
                                  ? formatCurrency(customer.availableCredit)
                                  : '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openCreditDialog(customer)}
                                >
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {managementTotalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Mostrando {(managementPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(managementPage * itemsPerPage, filteredAllCustomers.length)} de{' '}
                    {filteredAllCustomers.length} clientes
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setManagementPage((prev) => Math.max(prev - 1, 1))}
                      disabled={managementPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: Math.min(5, managementTotalPages) }, (_, i) => {
                      let pageNum;
                      if (managementTotalPages <= 5) {
                        pageNum = i + 1;
                      } else if (managementPage <= 3) {
                        pageNum = i + 1;
                      } else if (managementPage >= managementTotalPages - 2) {
                        pageNum = managementTotalPages - 4 + i;
                      } else {
                        pageNum = managementPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={managementPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setManagementPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setManagementPage((prev) => Math.min(prev + 1, managementTotalPages))
                      }
                      disabled={managementPage === managementTotalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* ============================================ */}
        {/* Payment Dialog */}
        {/* ============================================ */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={closePaymentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Recibir Pago de Crédito</DialogTitle>
              <DialogDescription>
                Registrar un pago para el cliente{' '}
                <strong>
                  {selectedCustomer?.name} {selectedCustomer?.lastName || ''}
                </strong>
              </DialogDescription>
            </DialogHeader>

            {loadingCustomerData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Customer Summary */}
                {customerSummary && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Límite de Crédito</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(customerSummary.creditLimit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(customerSummary.currentBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Crédito Disponible</p>
                      <p
                        className={`text-lg font-semibold ${customerSummary.availableCredit > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                      >
                        {formatCurrency(customerSummary.availableCredit)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Pending Invoices */}
                {pendingInvoices.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Facturas Pendientes * <span className="text-muted-foreground font-normal">(seleccione una factura para aplicar el pago)</span>
                    </Label>
                    <div className="max-h-40 overflow-y-auto border rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Factura
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              Total
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                              Pendiente
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {pendingInvoices.map((invoice) => (
                            <tr
                              key={invoice.id}
                              className={`${selectedInvoiceId === invoice.id
                                ? 'bg-primary/10'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                              <td className="px-3 py-2 text-sm">
                                <div>{invoice.invoiceNumber}</div>
                                {invoice.ncf && (
                                  <div className="text-xs text-muted-foreground">{invoice.ncf}</div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-sm text-right">
                                {formatCurrency(invoice.total)}
                              </td>
                              <td className="px-3 py-2 text-sm text-right font-medium text-red-600">
                                {formatCurrency(invoice.pendingAmount)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <Button
                                  size="sm"
                                  variant={selectedInvoiceId === invoice.id ? 'default' : 'outline'}
                                  onClick={() => {
                                    if (selectedInvoiceId === invoice.id) {
                                      setSelectedInvoiceId(null);
                                    } else {
                                      setSelectedInvoiceId(invoice.id);
                                      setPaymentAmount(invoice.pendingAmount.toString());
                                    }
                                  }}
                                >
                                  {selectedInvoiceId === invoice.id ? 'Quitar' : 'Seleccionar'}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payment Form */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Monto del Pago *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={selectedCustomer?.currentBalance}
                        placeholder="0.00"
                        className="pl-10"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Método de Pago *</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as CreditPaymentMethod)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CreditPaymentMethod.CASH}>
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Efectivo
                          </div>
                        </SelectItem>
                        <SelectItem value={CreditPaymentMethod.CARD}>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Tarjeta
                          </div>
                        </SelectItem>
                        <SelectItem value={CreditPaymentMethod.TRANSFER}>
                          <div className="flex items-center gap-2">
                            <ArrowDownToLine className="h-4 w-4" />
                            Transferencia
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Sucursal</Label>
                    <div className="flex items-center gap-2 h-9 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {activeBranchName || 'Sin sucursal activa'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reference">
                      Referencia {(paymentMethod === CreditPaymentMethod.CARD || paymentMethod === CreditPaymentMethod.TRANSFER) ? '*' : '(opcional)'}
                    </Label>
                    <Input
                      id="reference"
                      placeholder="No. voucher, transferencia, etc."
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observaciones sobre el pago..."
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={closePaymentDialog}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitPayment}
                disabled={
                  submittingPayment ||
                  !paymentAmount ||
                  !activeBranchId ||
                  !selectedInvoiceId ||
                  ((paymentMethod === CreditPaymentMethod.CARD || paymentMethod === CreditPaymentMethod.TRANSFER) && !paymentReference.trim())
                }
                className="!bg-green-600 hover:!bg-green-700 !text-white"
              >
                {submittingPayment ? 'Procesando...' : 'Registrar Pago'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================ */}
        {/* Credit Limit Edit Dialog */}
        {/* ============================================ */}
        <Dialog open={isCreditDialogOpen} onOpenChange={closeCreditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configurar Límite de Crédito</DialogTitle>
              <DialogDescription>
                Configurar crédito para{' '}
                <strong>
                  {editingCustomer?.name} {editingCustomer?.lastName || ''}
                </strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Current Status */}
              {editingCustomer && editingCustomer.currentBalance > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Este cliente tiene un saldo pendiente de{' '}
                    <strong>{formatCurrency(editingCustomer.currentBalance)}</strong>. El límite de
                    crédito no puede ser menor a este monto.
                  </p>
                </div>
              )}

              {/* Enable/Disable Credit */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowCredit" className="text-base font-medium">
                    Habilitar Crédito
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permite al cliente realizar compras a crédito
                  </p>
                </div>
                <Switch
                  id="allowCredit"
                  checked={editAllowCredit}
                  onCheckedChange={setEditAllowCredit}
                  disabled={editingCustomer?.currentBalance ? editingCustomer.currentBalance > 0 && !editAllowCredit : false}
                />
              </div>

              {/* Credit Limit */}
              {editAllowCredit && (
                <div>
                  <Label htmlFor="creditLimit">Límite de Crédito *</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="creditLimit"
                      type="number"
                      step="0.01"
                      min={editingCustomer?.currentBalance || 0}
                      placeholder="0.00"
                      className="pl-10"
                      value={editCreditLimit}
                      onChange={(e) => setEditCreditLimit(e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monto máximo que el cliente puede deber
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeCreditDialog}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveCredit}
                disabled={savingCredit || (editAllowCredit && !editCreditLimit)}
              >
                {savingCredit ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedPage>
  );
}
