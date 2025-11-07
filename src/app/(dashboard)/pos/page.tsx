'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBranch } from '@/lib/contexts/BranchContext';
import { PosService, ProductStock, InvoiceItem, Invoice } from '@/lib/services/posService';
import { BranchService } from '@/lib/services/branchService';
import { CashSessionService, CashSession } from '@/lib/services/cashSessionService';
import { CustomerService, Customer } from '@/lib/services/customerService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/layout/PageHeader';
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
import { OpenCashSessionModal } from '@/components/cash-session/OpenCashSessionModal';
import { CloseCashSessionModal } from '@/components/cash-session/CloseCashSessionModal';
import { toast } from 'sonner';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  DollarSign,
  CreditCard,
  Banknote,
  XCircle,
  LogIn,
  LogOut,
  Printer,
  CheckCircle,
  ImageIcon,
  User as UserIcon,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CartItem extends ProductStock {
  cartQuantity: number;
}

export default function PosPage() {
  const router = useRouter();
  const { activeBranchId, userBranches } = useBranch();

  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductStock[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeWarehouseId, setActiveWarehouseId] = useState<number | null>(null);
  const [activeWarehouseName, setActiveWarehouseName] = useState<string | null>(null);
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);

  // Estados para cancelar factura
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelInvoiceNumber, setCancelInvoiceNumber] = useState('');
  const [searchingInvoice, setSearchingInvoice] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState<any>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [cancellingInvoice, setCancellingInvoice] = useState(false);

  // Estados para sesión de caja
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [showOpenSessionModal, setShowOpenSessionModal] = useState(false);
  const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  // Estados para modal de factura
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Estado para confirmación de pago
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);

  // Estados para buscador de clientes
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Log inicial para debug
  useEffect(() => {
    console.log('🎯 POS Page Mounted');
    console.log('🎯 Active Branch ID:', activeBranchId);
    console.log('🎯 User Branches:', userBranches);
  }, []);

  // Cargar el warehouse de la sucursal activa
  useEffect(() => {
    const loadWarehouse = async () => {
      console.log('🏢 useEffect triggered - activeBranchId:', activeBranchId);

      if (!activeBranchId) {
        console.log('⚠️ No active branch ID, skipping warehouse load');
        setActiveWarehouseId(null);
        return;
      }

      setLoadingWarehouse(true);
      try {
        console.log('🏢 Loading warehouse for branch:', activeBranchId);
        const branch = await BranchService.getBranch(activeBranchId);
        console.log('📦 Branch data:', branch);

        // Obtener el primer warehouse activo de la sucursal
        const warehouse = (branch as any).warehouses?.find((w: any) => w.isActive);
        if (warehouse) {
          setActiveWarehouseId(warehouse.id);
          setActiveWarehouseName(warehouse.name);
          console.log('✅ Warehouse loaded:', warehouse.id, warehouse.name);
        } else {
          console.warn('⚠️ No active warehouse found for branch');
          setActiveWarehouseId(null);
          setActiveWarehouseName(null);
        }
      } catch (error) {
        console.error('❌ Error loading warehouse:', error);
        setActiveWarehouseId(null);
      } finally {
        setLoadingWarehouse(false);
      }
    };

    loadWarehouse();
  }, [activeBranchId]);

  // Cargar sesión de caja actual (se recarga al cambiar de sucursal)
  useEffect(() => {
    const loadCurrentSession = async () => {
      if (!activeBranchId) {
        console.log('⚠️ No active branch ID, skipping session load');
        setCurrentSession(null);
        return;
      }

      setLoadingSession(true);
      try {
        const session = await CashSessionService.getCurrentSession(activeBranchId);
        setCurrentSession(session);
        if (session) {
          console.log('💰 Sesión de caja activa para sucursal', activeBranchId, ':', session);
        } else {
          console.log('💰 No hay sesión de caja abierta para sucursal', activeBranchId);
        }
      } catch (error) {
        console.error('Error loading cash session:', error);
        setCurrentSession(null);
      } finally {
        setLoadingSession(false);
      }
    };

    loadCurrentSession();
  }, [activeBranchId]); // ✅ Se recarga cuando cambia la sucursal activa

  // Búsqueda de productos con debounce
  useEffect(() => {
    const searchProducts = async () => {
      console.log('🔍 Search triggered - Query:', searchQuery);
      console.log('🔍 Search triggered - Warehouse ID:', activeWarehouseId);
      console.log('🔍 Search triggered - Branch ID:', activeBranchId);

      if (!searchQuery.trim() || !activeWarehouseId) {
        console.log('⚠️ Search cancelled - Missing query or warehouse');
        setSearchResults([]);
        return;
      }

      if (searchQuery.length < 2) {
        console.log('⚠️ Search cancelled - Query too short');
        setSearchResults([]);
        return;
      }

      console.log('✅ Starting search...');
      setLoading(true);
      try {
        const results = await PosService.searchProducts({
          search: searchQuery,
          warehouseId: activeWarehouseId,
          branchId: activeBranchId || undefined,
          limit: 20,
        });
        console.log('✅ Search results:', results);
        setSearchResults(results);
      } catch (error) {
        console.error('❌ Error searching products:', error);
        toast.error('Error al buscar productos');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      console.log("BUSCARRRRRR")
      searchProducts();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, activeWarehouseId, activeBranchId]);

  // Búsqueda de clientes con debounce
  useEffect(() => {
    const searchCustomers = async () => {
      if (!customerSearch.trim() || customerSearch.length < 2) {
        setCustomerSearchResults([]);
        return;
      }

      setLoadingCustomers(true);
      try {
        const results = await CustomerService.searchCustomers(customerSearch);
        setCustomerSearchResults(results);
      } catch (error) {
        console.error('Error searching customers:', error);
        toast.error('Error al buscar clientes');
        setCustomerSearchResults([]);
      } finally {
        setLoadingCustomers(false);
      }
    };

    const handler = setTimeout(() => {
      searchCustomers();
    }, 300);

    return () => clearTimeout(handler);
  }, [customerSearch]);

  // Agregar producto al carrito
  const addToCart = (product: ProductStock) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // Verificar que no exceda el stock
        if (existingItem.cartQuantity >= existingItem.stock.quantity) {
          toast.error('No hay suficiente stock disponible');
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, cartQuantity: 1 }];
      }
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  // Aumentar cantidad
  const increaseQuantity = (productId: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          if (item.cartQuantity >= item.stock.quantity) {
            toast.error('No hay suficiente stock disponible');
            return item;
          }
          return { ...item, cartQuantity: item.cartQuantity + 1 };
        }
        return item;
      })
    );
  };

  // Disminuir cantidad
  const decreaseQuantity = (productId: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.cartQuantity > 1
          ? { ...item, cartQuantity: item.cartQuantity - 1 }
          : item
      )
    );
  };

  // Eliminar del carrito
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Limpiar carrito
  const clearCart = () => {
    setCart([]);
    setPaymentMethod('CASH');
    setPaymentReference('');
  };

  // Calcular totales
  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.cartQuantity,
    0
  );
  const tax = 0; // Puedes agregar lógica de impuestos aquí
  const discount = 0; // Puedes agregar lógica de descuentos aquí
  const total = subtotal + tax - discount;

  // Validar y mostrar confirmación de pago
  const handlePaymentClick = () => {
    if (!activeBranchId || !activeWarehouseId) {
      toast.error('Debe seleccionar una sucursal');
      return;
    }

    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    // Validar que haya una sesión de caja activa
    if (!currentSession) {
      toast.error('Debe abrir una sesión de caja antes de procesar ventas');
      return;
    }

    // Validar que la sesión de caja sea de la sucursal correcta
    if (currentSession.branchId !== activeBranchId) {
      toast.error(
        `La sesión de caja está abierta para otra sucursal (${currentSession.branch?.name}). ` +
        'Por favor, cierre la sesión actual o cambie a la sucursal correcta.'
      );
      return;
    }

    // Validar que se ingrese referencia de pago para tarjetas y transferencias
    if ((paymentMethod === 'CARD' || paymentMethod === 'TRANSFER') && !paymentReference.trim()) {
      toast.error(
        paymentMethod === 'CARD'
          ? 'Debe ingresar el número de voucher de la tarjeta'
          : 'Debe ingresar la referencia de la transferencia'
      );
      return;
    }

    // Si todas las validaciones pasan, mostrar confirmación
    setShowPaymentConfirmation(true);
  };

  // Procesar pago (después de confirmación)
  const processPayment = async () => {
    setShowPaymentConfirmation(false);
    setProcessingPayment(true);
    try {
      const items: InvoiceItem[] = cart.map((item) => ({
        productId: item.id,
        quantity: item.cartQuantity,
        unitPrice: parseFloat(item.price),
      }));

      const invoice = await PosService.createInvoice({
        customerId: selectedCustomer?.id,
        branchId: activeBranchId,
        warehouseId: activeWarehouseId,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        items,
        cashSessionId: currentSession.id,
      });

      // Mostrar modal de factura
      setCompletedInvoice(invoice);
      setShowInvoiceModal(true);
      clearCart();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error?.message || 'Error al procesar el pago');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Buscar factura para cancelar
  const searchInvoiceToCancel = async () => {
    if (!cancelInvoiceNumber.trim()) {
      toast.error('Ingrese un número de factura');
      return;
    }

    setSearchingInvoice(true);
    try {
      // Buscar factura por número usando el servicio de facturas
      const invoices = await PosService.getInvoices();
      const invoice = invoices.find(
        (inv) => inv.invoiceNumber.toUpperCase() === cancelInvoiceNumber.toUpperCase()
      );

      if (!invoice) {
        toast.error('Factura no encontrada');
        setInvoiceToCancel(null);
        setSearchingInvoice(false);
        return;
      }

      // Cargar detalle completo si es necesario
      const fullInvoice = await PosService.getInvoiceById(invoice.id);
      setInvoiceToCancel(fullInvoice);
      setShowCancelDialog(false);
      setShowCancelConfirmation(true);
    } catch (error: any) {
      console.error('Error searching invoice:', error);
      toast.error(error?.message || 'Factura no encontrada');
      setInvoiceToCancel(null);
    } finally {
      setSearchingInvoice(false);
    }
  };

  // Confirmar cancelación de factura
  const confirmCancelInvoice = async () => {
    if (!invoiceToCancel) return;

    setCancellingInvoice(true);
    try {
      await PosService.cancelInvoice(invoiceToCancel.invoiceNumber);
      toast.success(`Factura ${invoiceToCancel.invoiceNumber} cancelada exitosamente`);
      setShowCancelConfirmation(false);
      setInvoiceToCancel(null);
      setCancelInvoiceNumber('');
    } catch (error: any) {
      console.error('Error cancelling invoice:', error);
      toast.error(error?.message || 'Error al cancelar la factura');
    } finally {
      setCancellingInvoice(false);
    }
  };

  // Abrir diálogo de cancelación
  const openCancelDialog = () => {
    setCancelInvoiceNumber('');
    setInvoiceToCancel(null);
    setShowCancelDialog(true);
  };

  // Cerrar diálogos de cancelación
  const closeCancelDialogs = () => {
    setShowCancelDialog(false);
    setShowCancelConfirmation(false);
    setCancelInvoiceNumber('');
    setInvoiceToCancel(null);
  };

  // Manejar apertura de sesión de caja
  const handleOpenSession = () => {
    setShowOpenSessionModal(true);
  };

  const handleSessionOpened = async () => {
    // Recargar la sesión actual para la sucursal activa
    try {
      if (activeBranchId) {
        const session = await CashSessionService.getCurrentSession(activeBranchId);
        setCurrentSession(session);
        console.log('💰 Nueva sesión de caja abierta:', session);
      }
    } catch (error) {
      console.error('Error loading cash session after opening:', error);
    }
  };

  // Manejar cierre de sesión de caja
  const handleCloseSession = () => {
    setShowCloseSessionModal(true);
  };

  const handleSessionClosed = () => {
    // Limpiar la sesión actual
    setCurrentSession(null);
    console.log('💰 Sesión de caja cerrada');
  };

  // Función para imprimir la factura
  const handlePrintInvoice = () => {
    if (!completedInvoice) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes.');
      return;
    }

    const paymentMethodLabels: Record<string, string> = {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      TRANSFER: 'Transferencia',
      CHECK: 'Cheque',
      CREDIT: 'Crédito',
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura ${completedInvoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              padding: 30px;
              font-size: 16pt;
              line-height: 1.6;
            }
            .invoice-container { max-width: 210mm; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 20px; }
            .header h1 { font-size: 32pt; margin-bottom: 10px; font-weight: bold; }
            .header p { font-size: 16pt; margin: 5px 0; }
            .info-section { margin-bottom: 25px; font-size: 14pt; }
            .info-section .row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0; }
            .info-section .row span:first-child { font-weight: 600; }
            .items-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
            .items-table th { text-align: left; border-bottom: 2px solid #000; padding: 12px 8px; font-size: 14pt; font-weight: bold; background-color: #f5f5f5; }
            .items-table td { padding: 12px 8px; font-size: 14pt; }
            .items-table .item-row { border-bottom: 1px solid #ddd; }
            .items-table .item-row:hover { background-color: #f9f9f9; }
            .items-table .product-name { font-weight: 600; margin-bottom: 4px; }
            .items-table .product-code { font-size: 12pt; color: #666; }
            .totals { margin-top: 25px; border-top: 3px solid #000; padding-top: 20px; }
            .totals .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16pt; padding: 5px 0; }
            .totals .total-row { font-weight: bold; font-size: 22pt; margin-top: 15px; padding-top: 15px; border-top: 2px solid #000; }
            .footer { margin-top: 40px; text-align: center; font-size: 14pt; border-top: 2px solid #000; padding-top: 20px; }
            .footer p { margin: 8px 0; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>FACTURA</h1>
              <p>${completedInvoice.branch?.name || 'Xotica'}</p>
              <p>Sucursal: ${completedInvoice.branch?.code || ''}</p>
            </div>

            <div class="info-section">
              <div class="row">
                <span>Factura No:</span>
                <strong>${completedInvoice.invoiceNumber}</strong>
              </div>
              <div class="row">
                <span>Fecha:</span>
                <span>${new Date(completedInvoice.createdAt).toLocaleString('es-ES')}</span>
              </div>
              <div class="row">
                <span>Atendido por:</span>
                <span>${completedInvoice.user?.name || 'N/A'}</span>
              </div>
              <div class="row">
                <span>Método de pago:</span>
                <span>${paymentMethodLabels[completedInvoice.paymentMethod] || completedInvoice.paymentMethod}</span>
              </div>
              ${completedInvoice.paymentReference ? `
              <div class="row">
                <span>Referencia:</span>
                <span>${completedInvoice.paymentReference}</span>
              </div>
              ` : ''}
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align: center;">Cant.</th>
                  <th style="text-align: right;">P. Unit.</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${completedInvoice.items.map(item => `
                  <tr class="item-row">
                    <td>
                      <div class="product-name">${item.product.name}</div>
                      <div class="product-code">${item.product.code}</div>
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
                    <td style="text-align: right;">${formatCurrency(item.total)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <div class="row">
                <span>Subtotal:</span>
                <span>${formatCurrency(completedInvoice.subtotal)}</span>
              </div>
              ${parseFloat(completedInvoice.tax) > 0 ? `
              <div class="row">
                <span>Impuesto:</span>
                <span>${formatCurrency(completedInvoice.tax)}</span>
              </div>
              ` : ''}
              ${parseFloat(completedInvoice.discount) > 0 ? `
              <div class="row">
                <span>Descuento:</span>
                <span>-${formatCurrency(completedInvoice.discount).replace('RD$', '')}</span>
              </div>
              ` : ''}
              <div class="row total-row">
                <span>TOTAL:</span>
                <span>${formatCurrency(completedInvoice.total)}</span>
              </div>
            </div>

            <div class="footer">
              <p>¡Gracias por su compra!</p>
              <p>Conserve este comprobante</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (!activeBranchId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Punto de Venta</CardTitle>
            <CardDescription>
              Por favor seleccione una sucursal para continuar
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Punto de Venta"
        icon="shopping-cart"
        description={`Sucursal: ${userBranches.find((ub) => ub.branch.id === activeBranchId)?.branch.name || 'No seleccionada'}`}
      >
        <div className="flex flex-col items-end gap-2">
          {currentSession && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-md text-sm font-medium">
                Sesión #{currentSession.sessionNumber} - Abierta
              </div>
              <span className="text-xs text-muted-foreground">
                Apertura: {formatCurrency(currentSession.openingAmount)}
              </span>
            </div>
          )}
          <div className="flex gap-2">
          {!currentSession ? (
            <Button
              onClick={handleOpenSession}
              disabled={loadingSession}
            // className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Abrir Caja
            </Button>
          ) : (
            <Button
              onClick={handleCloseSession}
            // className="bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Caja
            </Button>
          )}
          <Button
            variant="outline"
            onClick={openCancelDialog}
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground shadow-sm"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar Factura
          </Button>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de búsqueda y productos */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  placeholder="Buscar por código, nombre o categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                {loading && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
              </div>

              {/* Resultados de búsqueda */}
              {searchQuery.trim() && !loading && searchResults.length === 0 && (
                <div className="mt-4 border rounded-lg p-8 text-center">
                  <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground font-medium">No se encontraron productos</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Intenta con otro término de búsqueda
                  </p>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-4 border rounded-lg divide-y max-h-96 overflow-y-auto">
                  {searchResults.map((product) => {
                    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

                    return (
                      <div
                        key={product.id}
                        className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => addToCart(product)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Imagen del producto */}
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-10 w-10 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{product.name}</p>
                              <Badge variant="outline">{product.code}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="secondary">
                                {product.category.name}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Stock: {product.stock.quantity}
                              </span>
                            </div>
                          </div>

                          {/* Precio */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel del carrito */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito
                </span>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive"
                  >
                    Limpiar
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>El carrito está vacío</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.price)} c/u
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive shrink-0"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => decreaseQuantity(item.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.cartQuantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => increaseQuantity(item.id)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-bold">
                            {formatCurrency(parseFloat(item.price) * item.cartQuantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totales */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Impuesto:</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Descuento:</span>
                        <span className="text-destructive">
                          -{formatCurrency(discount).replace('RD$', '')}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Buscador de clientes (opcional) */}
                  <div className="space-y-2">
                    <Label>Cliente (Opcional)</Label>
                    {selectedCustomer ? (
                      <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{selectedCustomer.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedCustomer.code}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(null);
                            setCustomerSearch('');
                            setCustomerSearchResults([]);
                          }}
                          className="h-7 w-7 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          placeholder="Buscar cliente..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full"
                        />
                        {loadingCustomers && (
                          <div className="absolute right-3 top-3">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        )}
                        {customerSearchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 border rounded-md bg-background shadow-lg max-h-48 overflow-y-auto">
                            {customerSearchResults.map((customer) => (
                              <button
                                key={customer.id}
                                className="w-full px-3 py-2 text-left hover:bg-muted/50 flex items-center gap-2 border-b last:border-b-0"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setCustomerSearch('');
                                  setCustomerSearchResults([]);
                                }}
                              >
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{customer.name}</p>
                                  <p className="text-xs text-muted-foreground">{customer.code}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Método de pago */}
                  <div className="space-y-2">
                    <Label>Método de Pago</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value: any) => {
                        setPaymentMethod(value);
                        // Limpiar referencia al cambiar método de pago
                        if (value === 'CASH') {
                          setPaymentReference('');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Efectivo
                          </div>
                        </SelectItem>
                        <SelectItem value="CARD">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Tarjeta
                          </div>
                        </SelectItem>
                        <SelectItem value="TRANSFER">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Transferencia
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campo de referencia para tarjeta o transferencia */}
                  {(paymentMethod === 'CARD' || paymentMethod === 'TRANSFER') && (
                    <div className="space-y-2">
                      <Label htmlFor="paymentReference">
                        {paymentMethod === 'CARD' ? 'Número de Voucher *' : 'Referencia de Transferencia *'}
                      </Label>
                      <Input
                        id="paymentReference"
                        placeholder={
                          paymentMethod === 'CARD'
                            ? 'Ej: 123456'
                            : 'Ej: TRANS-2024-001'
                        }
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        {paymentMethod === 'CARD'
                          ? 'Ingrese el número del voucher de la transacción con tarjeta'
                          : 'Ingrese la referencia bancaria de la transferencia'}
                      </p>
                    </div>
                  )}

                  {/* Botón de pagar */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePaymentClick}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-5 w-5 mr-2" />
                        Procesar Pago ({formatCurrency(total)})
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo para buscar factura a cancelar */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Factura</DialogTitle>
            <DialogDescription>
              Ingrese el número de factura que desea cancelar. Solo puede cancelar facturas del día actual creadas por usted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Número de Factura</Label>
              <Input
                id="invoiceNumber"
                placeholder="Ej: INV-0001"
                value={cancelInvoiceNumber}
                onChange={(e) => setCancelInvoiceNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !searchingInvoice) {
                    searchInvoiceToCancel();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={searchingInvoice}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={searchInvoiceToCancel}
              disabled={searchingInvoice || !cancelInvoiceNumber.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {searchingInvoice ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de cancelación */}
      <AlertDialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cancelación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará la factura y restaurará el inventario. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {invoiceToCancel && (
            <div className="space-y-3 py-4">
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Factura:</span>
                  <span className="font-medium">{invoiceToCancel.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="font-medium">
                    {formatCurrency(invoiceToCancel.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="font-medium">
                    {invoiceToCancel.customer?.name || 'Sin cliente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fecha:</span>
                  <span className="font-medium">
                    {new Date(invoiceToCancel.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeCancelDialogs}>
              No, mantener factura
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelInvoice}
              disabled={cancellingInvoice}
              className="!bg-destructive !text-white hover:!bg-destructive/90"
            >
              {cancellingInvoice ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Cancelando...
                </>
              ) : (
                'Sí, cancelar factura'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación de pago */}
      <AlertDialog open={showPaymentConfirmation} onOpenChange={setShowPaymentConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="h-6 w-6 text-primary" />
              ¿Confirmar procesamiento del pago?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, revise los detalles antes de confirmar la venta.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Método de pago */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Método de pago:</span>
              <Badge variant="secondary" className="text-base">
                {paymentMethod === 'CASH' ? (
                  <>
                    <Banknote className="h-4 w-4 mr-1" />
                    Efectivo
                  </>
                ) : paymentMethod === 'CARD' ? (
                  <>
                    <CreditCard className="h-4 w-4 mr-1" />
                    Tarjeta
                  </>
                ) : (
                  'Transferencia'
                )}
              </Badge>
            </div>

            {/* Referencia de pago si aplica */}
            {paymentReference && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Referencia:</span>
                <span className="font-mono font-medium">{paymentReference}</span>
              </div>
            )}

            {/* Cantidad de productos */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Productos:</span>
              <span className="font-medium">{cart.length} {cart.length === 1 ? 'artículo' : 'artículos'}</span>
            </div>

            {/* Total a cobrar */}
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <span className="text-lg font-semibold">TOTAL A COBRAR:</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingPayment}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={processPayment}
              disabled={processingPayment}
              className="bg-primary hover:bg-primary/90"
            >
              {processingPayment ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Pago
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modales de sesión de caja */}
      {activeBranchId && (
        <OpenCashSessionModal
          open={showOpenSessionModal}
          onOpenChange={setShowOpenSessionModal}
          onSuccess={handleSessionOpened}
          branchId={activeBranchId}
          branchName={userBranches.find((ub) => ub.branch.id === activeBranchId)?.branch.name || 'Sin nombre'}
          warehouseId={activeWarehouseId || undefined}
          warehouseName={activeWarehouseName || undefined}
        />
      )}

      <CloseCashSessionModal
        open={showCloseSessionModal}
        onOpenChange={setShowCloseSessionModal}
        session={currentSession}
        onSuccess={handleSessionClosed}
      />

      {/* Modal de factura completada */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle className="h-7 w-7 text-green-500" />
              ¡Venta completada exitosamente!
            </DialogTitle>
            <DialogDescription>
              Factura generada correctamente. Puede imprimirla o cerrar esta ventana.
            </DialogDescription>
          </DialogHeader>

          {completedInvoice && (
            <div className="space-y-4">
              {/* Información de la factura */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Número de Factura:</span>
                  <span className="font-bold text-lg">{completedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fecha:</span>
                  <span className="font-medium">
                    {new Date(completedInvoice.createdAt).toLocaleString('es-ES', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sucursal:</span>
                  <span className="font-medium">{completedInvoice.branch?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Atendido por:</span>
                  <span className="font-medium">{completedInvoice.user?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Método de pago:</span>
                  <Badge variant="secondary">
                    {completedInvoice.paymentMethod === 'CASH' ? (
                      <>
                        <Banknote className="h-3 w-3 mr-1" />
                        Efectivo
                      </>
                    ) : completedInvoice.paymentMethod === 'CARD' ? (
                      <>
                        <CreditCard className="h-3 w-3 mr-1" />
                        Tarjeta
                      </>
                    ) : (
                      'Transferencia'
                    )}
                  </Badge>
                </div>
                {completedInvoice.paymentReference && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Referencia:</span>
                    <span className="font-medium font-mono">{completedInvoice.paymentReference}</span>
                  </div>
                )}
              </div>

              {/* Items de la factura */}
              <div>
                <h4 className="font-semibold mb-3">Productos</h4>
                <div className="border rounded-lg divide-y">
                  {completedInvoice.items.map((item) => (
                    <div key={item.id} className="p-3 flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">{item.product.code}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="space-y-2 pt-2">
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(completedInvoice.subtotal)}</span>
                </div>
                {parseFloat(completedInvoice.tax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuesto:</span>
                    <span className="font-medium">{formatCurrency(completedInvoice.tax)}</span>
                  </div>
                )}
                {parseFloat(completedInvoice.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Descuento:</span>
                    <span className="font-medium text-green-600">-{formatCurrency(completedInvoice.discount).replace('RD$', '')}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL:</span>
                  <span className="text-primary">{formatCurrency(completedInvoice.total)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInvoiceModal(false)}
            >
              Cerrar
            </Button>
            <Button
              onClick={handlePrintInvoice}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir Factura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
