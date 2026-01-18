'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBranch } from '@/lib/contexts/BranchContext';
import { PosService, ProductStock, InvoiceItem, Invoice } from '@/lib/services/posService';
import { BranchService } from '@/lib/services/branchService';
import { CashSessionService, CashSession } from '@/lib/services/cashSessionService';
import { CustomerService, Customer } from '@/lib/services/customerService';
import ncfService, { NcfConfiguration, ncfTypeLabels, NcfType } from '@/lib/services/ncfService';
import { TenantService, Tenant } from '@/lib/services/tenantService';
import TenantSettingsService, { TenantSettings } from '@/lib/services/tenantSettingsService';
import { printInvoice } from '@/lib/utils/invoicePrint';
import {
  playSuccessBeepIfEnabled,
  playErrorBeepIfEnabled,
  initAudioContext,
  isSoundEnabled,
  setSoundEnabled
} from '@/lib/utils/sounds';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/layout/PageHeader';
import ProtectedPage from '@/components/ProtectedPage';
import { usePermissions } from '@/lib/hooks/usePermissions';
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
import CashExpenseModal from '@/components/cash-session/CashExpenseModal';
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
  Volume2,
  VolumeX,
  Receipt,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CartItem extends ProductStock {
  cartQuantity: number;
}

export default function PosPage() {
  const router = useRouter();
  const { activeBranchId, userBranches } = useBranch();
  const { canView, hasPermission } = usePermissions('POS');
  const canCashExpense = hasPermission('CAN_CASH_EXPENSE');
  const canSellCredit = hasPermission('CAN_SELL_CREDIT');

  // Estados
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductStock[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT'>('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeWarehouseId, setActiveWarehouseId] = useState<number | null>(null);
  const [activeWarehouseName, setActiveWarehouseName] = useState<string | null>(null);
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);

  // Estados para detección de escáner de código de barras
  const [scanBuffer, setScanBuffer] = useState('');
  const [scanTimestamp, setScanTimestamp] = useState<number>(0);
  const [isScannerDetected, setIsScannerDetected] = useState(false);

  // Estado para control de sonidos
  const [soundEnabled, setSoundEnabledState] = useState(isSoundEnabled());

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
  const [showExpenseModal, setShowExpenseModal] = useState(false);
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

  // Estados para NCF
  const [ncfConfig, setNcfConfig] = useState<NcfConfiguration | null>(null);
  const [manualNcf, setManualNcf] = useState('');
  const [manualCustomerRnc, setManualCustomerRnc] = useState('');
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [sellAsFinalConsumer, setSellAsFinalConsumer] = useState(false);

  // Estados para envío de email
  const [sendEmail, setSendEmail] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');

  // Estado para información de la empresa (tenant)
  const [tenantInfo, setTenantInfo] = useState<Tenant | null>(null);

  // Estado para configuración del tenant
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(null);

  // Log inicial para debug e inicializar audio
  useEffect(() => {
    console.log('🎯 POS Page Mounted');
    console.log('🎯 Active Branch ID:', activeBranchId);
    console.log('🎯 User Branches:', userBranches);

    // Inicializar contexto de audio después de interacción del usuario
    // Esto es necesario por la política de autoplay de los navegadores
    initAudioContext();
  }, []);

  // Cargar configuración NCF
  useEffect(() => {
    const loadNcfConfig = async () => {
      try {
        const config = await ncfService.getConfiguration();
        setNcfConfig(config);
        console.log('📄 NCF Configuration loaded:', config);
      } catch (error) {
        console.error('Error loading NCF configuration:', error);
        // Si no hay configuración, es opcional, no mostrar error
      }
    };

    loadNcfConfig();
  }, []);

  // Cargar información de la empresa (tenant) y configuraciones
  useEffect(() => {
    const loadTenantInfo = async () => {
      try {
        const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;
        if (tenantId) {
          const tenant = await TenantService.getTenantById(tenantId);
          setTenantInfo(tenant);
          console.log('🏢 Tenant Information loaded:', tenant);
        }
      } catch (error) {
        console.error('Error loading tenant information:', error);
      }
    };

    const loadTenantSettings = async () => {
      try {
        const settings = await TenantSettingsService.getSettings();
        setTenantSettings(settings);
        console.log('⚙️ Tenant Settings loaded:', settings);

        // Sincronizar la preferencia de sonidos con localStorage
        setSoundEnabled(settings.enableSounds);
        setSoundEnabledState(settings.enableSounds);

        // Establecer el método de pago predeterminado
        if (settings.defaultPaymentMethod) {
          setPaymentMethod(settings.defaultPaymentMethod as 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT');
        }
      } catch (error) {
        console.error('Error loading tenant settings:', error);
      }
    };

    loadTenantInfo();
    loadTenantSettings();
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

        // 🔥 DETECCIÓN DE ESCÁNER: Si solo hay 1 resultado y la búsqueda parece ser un código de barras
        // (8-13 caracteres numéricos), agregar automáticamente al carrito
        if (results.length === 1 && searchQuery.length >= 8 && /^[0-9]+$/.test(searchQuery)) {
          console.log('🎯 Código de barras detectado - Agregando al carrito automáticamente');
          setIsScannerDetected(true);

          const product = results[0];
          addToCart(product);

          // 🔊 Reproducir beep de éxito
          playSuccessBeepIfEnabled();

          // Limpiar búsqueda y resultados
          setSearchQuery('');
          setSearchResults([]);

          // Mostrar feedback visual
          toast.success(`✓ ${product.name} agregado al carrito`, {
            duration: 2000,
          });

          // Reset scanner detection después de un momento
          setTimeout(() => setIsScannerDetected(false), 1000);
        } else if (results.length === 0 && searchQuery.length >= 8 && /^[0-9]+$/.test(searchQuery)) {
          // 🔊 Beep de error si parece código de barras pero no se encontró
          playErrorBeepIfEnabled();
        }
      } catch (error) {
        console.error('❌ Error searching products:', error);
        toast.error('Error al buscar productos');
        setSearchResults([]);

        // 🔊 Beep de error en caso de fallo
        playErrorBeepIfEnabled();
      } finally {
        setLoading(false);
      }
    };

    // Usar debounce más corto para códigos de barras (parecen numéricos y largos)
    const isBarcodePattern = searchQuery.length >= 8 && /^[0-9]+$/.test(searchQuery);
    const debounceTime = isBarcodePattern ? 100 : 300; // Más rápido para códigos de barras

    const handler = setTimeout(() => {
      console.log("BUSCARRRRRR")
      searchProducts();
    }, debounceTime);

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

  // Prellenar email del cliente cuando se selecciona uno
  useEffect(() => {
    if (selectedCustomer?.email) {
      setCustomerEmail(selectedCustomer.email);
    } else {
      setCustomerEmail('');
    }
  }, [selectedCustomer]);

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
    // Resetear al método de pago predeterminado de la configuración
    setPaymentMethod((tenantSettings?.defaultPaymentMethod as 'CASH' | 'CARD' | 'TRANSFER' | 'CREDIT') || 'CASH');
    setPaymentReference('');
    setManualNcf('');
    setManualCustomerRnc('');
    setManualCustomerName('');
    setSelectedCustomer(null);
    setSellAsFinalConsumer(false);
    setSendEmail(false);
    setCustomerEmail('');
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

    // Validar que se haya seleccionado un cliente si la configuración lo requiere
    if (tenantSettings?.askForCustomer && !selectedCustomer && !sellAsFinalConsumer && !manualCustomerName.trim()) {
      toast.error('Debe seleccionar un cliente o marcar como consumidor final');
      return;
    }

    // Validar que se haya ingresado un email si se marcó enviar por correo
    if (sendEmail && !customerEmail.trim()) {
      toast.error('Debe ingresar un correo electrónico para enviar la factura');
      return;
    }

    // Validar formato de email si se ingresó uno
    if (sendEmail && customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail.trim())) {
        toast.error('El formato del correo electrónico no es válido');
        return;
      }
    }

    // Validaciones para venta a crédito
    if (paymentMethod === 'CREDIT') {
      if (!selectedCustomer) {
        toast.error('Debe seleccionar un cliente para ventas a crédito');
        return;
      }

      if (!selectedCustomer.allowCredit) {
        toast.error('El cliente seleccionado no tiene crédito habilitado');
        return;
      }

      // Verificar límite de crédito
      const availableCredit = selectedCustomer.creditLimit > 0
        ? selectedCustomer.creditLimit - selectedCustomer.currentBalance
        : Infinity;

      if (selectedCustomer.creditLimit > 0 && total > availableCredit) {
        toast.error(
          `El monto excede el crédito disponible del cliente. ` +
          `Disponible: ${formatCurrency(availableCredit)}`
        );
        return;
      }
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
        variantId: item.id,
        quantity: item.cartQuantity,
        unitPrice: parseFloat(item.price),
      }));

      const invoice = await PosService.createInvoice({
        // Si está marcado como consumidor final, NO enviar el customerId para evitar conflictos con clientes RUI
        customerId: sellAsFinalConsumer ? undefined : selectedCustomer?.id,
        branchId: activeBranchId,
        warehouseId: activeWarehouseId,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        manualNcf: manualNcf.trim() || undefined,
        // Si está marcado como consumidor final, NO enviar RNC (para generar B02 en lugar de B01)
        customerRnc: sellAsFinalConsumer
          ? undefined
          : (selectedCustomer?.taxId || (manualCustomerRnc.trim() || undefined)),
        customerName: sellAsFinalConsumer
          ? undefined
          : (selectedCustomer
            ? `${selectedCustomer.name}${selectedCustomer.lastName ? ` ${selectedCustomer.lastName}` : ''}`
            : (manualCustomerName.trim() || undefined)),
        items,
        cashSessionId: currentSession.id,
        sendEmail,
        customerEmail: customerEmail.trim() || undefined,
      });

      // Mostrar modal de factura
      setCompletedInvoice(invoice);
      setShowInvoiceModal(true);

      // Mostrar mensaje de éxito con información de email
      if (sendEmail) {
        toast.success(
          `Factura creada exitosamente${customerEmail ? ` y enviada a ${customerEmail}` : ''}`
        );
      }

      clearCart();

      // Auto-imprimir recibo si está configurado
      console.log('🖨️ Checking auto-print settings:', {
        tenantSettings,
        autoPrintReceipts: tenantSettings?.autoPrintReceipts,
      });

      if (tenantSettings?.autoPrintReceipts) {
        try {
          console.log('🖨️ Auto-printing receipt (autoPrintReceipts is enabled)');
          printInvoice({
            invoice,
            tenantInfo,
            itbisRate: ncfConfig?.itbisRate || 18,
            includeLogo: tenantSettings?.includeLogo ?? true,
            invoiceFooter: tenantSettings?.invoiceFooter || undefined,
            termsAndConditions: tenantSettings?.termsAndConditions || undefined,
          });
        } catch (error) {
          console.error('Error auto-printing receipt:', error);
          // No mostramos toast de error para no interrumpir el flujo
        }
      } else {
        console.log('🖨️ Auto-print is disabled, skipping automatic print');
      }
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

  // Función para toggle de sonidos
  const handleToggleSound = async () => {
    const newState = !soundEnabled;
    setSoundEnabledState(newState);
    setSoundEnabled(newState);

    // Guardar en la base de datos también
    try {
      await TenantSettingsService.updateSettings({
        enableSounds: newState,
      });

      // Actualizar el estado local de tenantSettings
      if (tenantSettings) {
        setTenantSettings({ ...tenantSettings, enableSounds: newState });
      }

      toast.success(
        newState ? '🔊 Sonidos activados' : '🔇 Sonidos silenciados',
        { duration: 1500 }
      );
    } catch (error) {
      console.error('Error updating sound preference:', error);
      // Revertir el cambio si falla
      setSoundEnabledState(!newState);
      setSoundEnabled(!newState);
      toast.error('Error al guardar la preferencia de sonidos');
    }
  };

  // Función para imprimir la factura
  const handlePrintInvoice = () => {
    if (!completedInvoice || !ncfConfig) return;

    try {
      // Convertir itbisRate de porcentaje a decimal si es necesario
      const itbisRate = ncfConfig.itbisRate > 1 ? ncfConfig.itbisRate / 100 : ncfConfig.itbisRate;

      printInvoice({
        invoice: completedInvoice,
        tenantInfo,
        itbisRate,
        includeLogo: tenantSettings?.includeLogo ?? true,
        invoiceFooter: tenantSettings?.invoiceFooter || undefined,
        termsAndConditions: tenantSettings?.termsAndConditions || undefined,
      });
    } catch (error: any) {
      toast.error(error.message || 'Error al imprimir la factura');
    }
  };

  // Función temporal para mantener el código antiguo (borrar después)
  const handlePrintInvoice_OLD = () => {
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

    // Convertir itbisRate de porcentaje a decimal si es necesario
    const itbisRateRaw = ncfConfig?.itbisRate ?? 18;
    const itbisRate = itbisRateRaw > 1 ? itbisRateRaw / 100 : itbisRateRaw;

    const printContent_OLD = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura ${completedInvoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              padding: 20px;
              font-size: 11pt;
              line-height: 1.4;
            }
            .invoice-container { max-width: 210mm; margin: 0 auto; }

            /* Header - Información de la empresa */
            .company-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
            }
            .company-header h1 {
              font-size: 24pt;
              margin-bottom: 8px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .company-header .company-info {
              font-size: 10pt;
              margin: 3px 0;
              color: #333;
            }
            .company-header .rnc {
              font-weight: 600;
              font-size: 11pt;
              margin-top: 5px;
            }

            /* Sección de información fiscal (NCF) */
            .fiscal-section {
              background-color: #f8f8f8;
              border: 2px solid #000;
              padding: 15px;
              margin-bottom: 20px;
            }
            .fiscal-section .ncf-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
              padding: 5px 0;
            }
            .fiscal-section .ncf-row:last-child {
              margin-bottom: 0;
            }
            .fiscal-section .ncf-label {
              font-weight: 600;
              font-size: 11pt;
            }
            .fiscal-section .ncf-value {
              font-family: 'Courier New', monospace;
              font-size: 13pt;
              font-weight: bold;
              letter-spacing: 1px;
            }
            .fiscal-section .ncf-type {
              font-size: 10pt;
              color: #555;
              font-style: italic;
            }
            .fiscal-section .ncf-validity {
              font-size: 9pt;
              color: #666;
            }

            /* Información de la factura */
            .invoice-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-bottom: 20px;
              font-size: 10pt;
            }
            .invoice-info .info-group {
              padding: 10px;
              background-color: #fafafa;
              border-radius: 4px;
            }
            .invoice-info .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              padding: 2px 0;
            }
            .invoice-info .row:last-child {
              margin-bottom: 0;
            }
            .invoice-info .row .label {
              font-weight: 600;
              color: #555;
            }
            .invoice-info .row .value {
              font-weight: 500;
            }

            /* Tabla de productos */
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items-table th {
              text-align: left;
              border-bottom: 2px solid #000;
              padding: 10px 6px;
              font-size: 10pt;
              font-weight: bold;
              background-color: #e8e8e8;
            }
            .items-table td {
              padding: 8px 6px;
              font-size: 10pt;
              border-bottom: 1px solid #ddd;
            }
            .items-table .product-name {
              font-weight: 600;
              margin-bottom: 2px;
            }
            .items-table .product-code {
              font-size: 9pt;
              color: #666;
            }
            .items-table .text-right {
              text-align: right;
            }
            .items-table .text-center {
              text-align: center;
            }

            /* Sección de totales */
            .totals {
              margin-top: 20px;
              border-top: 2px solid #000;
              padding-top: 15px;
            }
            .totals .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 11pt;
              padding: 3px 0;
            }
            .totals .row .label {
              font-weight: 500;
            }
            .totals .row .value {
              font-weight: 600;
              min-width: 120px;
              text-align: right;
            }
            .totals .itbis-row {
              background-color: #f0f0f0;
              padding: 8px;
              margin: 5px 0;
              border-radius: 4px;
            }
            .totals .total-row {
              font-weight: bold;
              font-size: 16pt;
              margin-top: 12px;
              padding-top: 12px;
              border-top: 2px solid #000;
              background-color: #f5f5f5;
              padding: 12px 8px;
            }
            .totals .total-row .label {
              font-size: 14pt;
            }
            .totals .total-row .value {
              font-size: 18pt;
            }

            /* Footer */
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10pt;
              border-top: 1px solid #000;
              padding-top: 15px;
            }
            .footer p {
              margin: 5px 0;
            }
            .footer .legal {
              font-size: 8pt;
              color: #666;
              margin-top: 10px;
            }

            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header con información de la empresa -->
            <div class="company-header">
              <h1>${tenantInfo?.name || 'CloudSuite Pro'}</h1>
              ${tenantInfo?.address ? `<p class="company-info">${tenantInfo.address}</p>` : ''}
              ${tenantInfo?.phone ? `<p class="company-info">Tel: ${tenantInfo.phone}</p>` : ''}
              ${tenantInfo?.email ? `<p class="company-info">Email: ${tenantInfo.email}</p>` : ''}
              ${tenantInfo?.taxId ? `<p class="rnc">RNC: ${tenantInfo.taxId}</p>` : ''}
            </div>

            <!-- Sección de información fiscal (NCF) -->
            ${completedInvoice.ncf ? `
            <div class="fiscal-section">
              <div class="ncf-row">
                <span class="ncf-label">Comprobante Fiscal (NCF):</span>
                <span class="ncf-value">${completedInvoice.ncf}</span>
              </div>
              ${ncfTypeLabel ? `
              <div class="ncf-row">
                <span class="ncf-label">Tipo:</span>
                <span class="ncf-type">${ncfTypeLabel}</span>
              </div>
              ` : ''}
              ${completedInvoice.ncfValidUntil ? `
              <div class="ncf-row">
                <span class="ncf-label">NCF Válido hasta:</span>
                <span class="ncf-validity">${new Date(completedInvoice.ncfValidUntil).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}

            <!-- Información de la factura -->
            <div class="invoice-info">
              <div class="info-group">
                <div class="row">
                  <span class="label">Factura No:</span>
                  <span class="value">${completedInvoice.invoiceNumber}</span>
                </div>
                <div class="row">
                  <span class="label">Fecha:</span>
                  <span class="value">${new Date(completedInvoice.createdAt).toLocaleString('es-DO', {
      dateStyle: 'short',
      timeStyle: 'short'
    })}</span>
                </div>
                <div class="row">
                  <span class="label">Sucursal:</span>
                  <span class="value">${completedInvoice.branch?.name || 'N/A'}</span>
                </div>
                <div class="row">
                  <span class="label">Cajero:</span>
                  <span class="value">${completedInvoice.user?.name || 'N/A'}</span>
                </div>
              </div>

              <div class="info-group">
                ${completedInvoice.customerName || completedInvoice.customerRnc ? `
                <div class="row">
                  <span class="label">Cliente:</span>
                  <span class="value">${completedInvoice.customerName || 'N/A'}</span>
                </div>
                ${completedInvoice.customerRnc ? `
                <div class="row">
                  <span class="label">RNC/Cédula:</span>
                  <span class="value">${completedInvoice.customerRnc}</span>
                </div>
                ` : ''}
                ` : `
                <div class="row">
                  <span class="label">Cliente:</span>
                  <span class="value">Consumidor Final</span>
                </div>
                `}
                <div class="row">
                  <span class="label">Pago:</span>
                  <span class="value">${paymentMethodLabels[completedInvoice.paymentMethod] || completedInvoice.paymentMethod}</span>
                </div>
                ${completedInvoice.paymentReference ? `
                <div class="row">
                  <span class="label">Ref. Pago:</span>
                  <span class="value">${completedInvoice.paymentReference}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Tabla de productos -->
            <table class="items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="text-center">Cant.</th>
                  <th class="text-right">Precio</th>
                  <th class="text-right">ITBIS</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${completedInvoice.items.map(item => {
      // Calcular ITBIS por item (precio incluye ITBIS)
      const totalWithItbis = parseFloat(item.total.toString());
      const itbisAmount = totalWithItbis * (itbisRate / (1 + itbisRate));
      const subtotalItem = totalWithItbis - itbisAmount;

      return `
                  <tr>
                    <td>
                      <div class="product-name">${item.variant.product.name}${item.variant.name ? ` - ${item.variant.name}` : ''}</div>
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                    <td class="text-right">${formatCurrency(itbisAmount)}</td>
                    <td class="text-right">${formatCurrency(item.total)}</td>
                  </tr>
                  `;
    }).join('')}
              </tbody>
            </table>

            <!-- Totales con desglose de ITBIS -->
            <div class="totals">
              ${(() => {
        // Calcular totales con ITBIS
        const totalWithItbis = parseFloat(completedInvoice.total.toString());
        const totalItbis = totalWithItbis * (itbisRate / (1 + itbisRate));
        const subtotalWithoutItbis = totalWithItbis - totalItbis;

        return `
                  <div class="row">
                    <span class="label">Subtotal (sin ITBIS):</span>
                    <span class="value">${formatCurrency(subtotalWithoutItbis)}</span>
                  </div>
                  <div class="row itbis-row">
                    <span class="label">ITBIS (${(itbisRate * 100).toFixed(0)}%):</span>
                    <span class="value">${formatCurrency(totalItbis)}</span>
                  </div>
                  ${parseFloat(completedInvoice.discount) > 0 ? `
                  <div class="row">
                    <span class="label">Descuento:</span>
                    <span class="value">-${formatCurrency(completedInvoice.discount).replace('RD$', 'RD$ ')}</span>
                  </div>
                  ` : ''}
                  <div class="row total-row">
                    <span class="label">TOTAL A PAGAR:</span>
                    <span class="value">${formatCurrency(completedInvoice.total)}</span>
                  </div>
                `;
      })()}
            </div>

            <!-- Footer -->
            <div class="footer">
              <p><strong>¡Gracias por su preferencia!</strong></p>
              <p>Conserve este comprobante para fines fiscales</p>
              ${completedInvoice.ncf ? `
              <p class="legal">
                Este documento es válido como comprobante fiscal según la Norma 06-18 de la DGII
              </p>
              ` : ''}
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
    <ProtectedPage screenCode="POS" requiredPermission="VIEW">
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
              {/* Botón de toggle de sonidos */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleSound}
                className="shadow-sm"
                title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>

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
                <>
                  {canCashExpense && (
                    <Button
                      variant="outline"
                      onClick={() => setShowExpenseModal(true)}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Gastos
                    </Button>
                  )}
                  <Button
                    onClick={handleCloseSession}
                  // className="bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Caja
                  </Button>
                </>
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
                    placeholder="Buscar o escanear código de barras..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full ${isScannerDetected ? 'ring-2 ring-green-500' : ''}`}
                    autoFocus
                  />
                  {loading && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                  {isScannerDetected && (
                    <div className="absolute right-3 top-3">
                      <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="h-3 w-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
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

                    {/* Buscador de clientes */}
                    <div className="space-y-2">
                      <Label>Cliente {tenantSettings?.askForCustomer ? '(Requerido)' : '(Opcional)'}</Label>
                      {selectedCustomer ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">
                                  {selectedCustomer.name}{selectedCustomer.lastName ? ` ${selectedCustomer.lastName}` : ''}
                                </p>
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
                                setSellAsFinalConsumer(false);
                              }}
                              className="h-7 w-7 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {selectedCustomer.isRuiContributor && (
                            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                              <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                                  Contribuyente RUI
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  Requiere NCF B12
                                </p>
                              </div>
                            </div>
                          )}
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
                                    <p className="font-medium text-sm truncate">
                                      {customer.name}{customer.lastName ? ` ${customer.lastName}` : ''}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{customer.code}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Checkbox para vender como consumidor final */}
                    {selectedCustomer && selectedCustomer.taxId && (
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <input
                          type="checkbox"
                          id="sellAsFinalConsumer"
                          checked={sellAsFinalConsumer}
                          onChange={(e) => setSellAsFinalConsumer(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="sellAsFinalConsumer" className="cursor-pointer text-sm font-medium">
                          Vender como consumidor final (sin NCF {selectedCustomer?.isRuiContributor ? 'B12' : 'B01'})
                        </Label>
                      </div>
                    )}

                    {/* Información de crédito del cliente */}
                    {selectedCustomer && selectedCustomer.allowCredit && canSellCredit && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Crédito Habilitado
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Límite:</span>
                            <span className="ml-1 font-medium">
                              {selectedCustomer.creditLimit > 0
                                ? formatCurrency(selectedCustomer.creditLimit)
                                : 'Sin límite'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Saldo:</span>
                            <span className="ml-1 font-medium text-orange-600">
                              {formatCurrency(selectedCustomer.currentBalance)}
                            </span>
                          </div>
                          {selectedCustomer.creditLimit > 0 && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Disponible:</span>
                              <span className="ml-1 font-medium text-green-600">
                                {formatCurrency(selectedCustomer.creditLimit - selectedCustomer.currentBalance)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Campos para cliente no registrado (solo si no hay cliente seleccionado) */}
                    {!selectedCustomer && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="manualCustomerRnc">
                            RNC / Cédula (Opcional)
                          </Label>
                          <Input
                            id="manualCustomerRnc"
                            placeholder="Ej: 131793916 o 00112345678"
                            value={manualCustomerRnc}
                            onChange={(e) => setManualCustomerRnc(e.target.value)}
                            maxLength={11}
                          />
                          <p className="text-xs text-muted-foreground">
                            Ingrese RNC (9 dígitos) o Cédula (11 dígitos) para generar NCF tipo B01
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="manualCustomerName">
                            Nombre del Cliente {tenantSettings?.askForCustomer ? '(Requerido)' : '(Opcional)'}
                          </Label>
                          <Input
                            id="manualCustomerName"
                            placeholder="Ej: Juan Pérez"
                            value={manualCustomerName}
                            onChange={(e) => setManualCustomerName(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Nombre para incluir en el comprobante fiscal
                          </p>
                        </div>
                      </>
                    )}

                    {/* Campo de NCF manual (solo si está permitido) */}
                    {ncfConfig?.allowManualNcf && (
                      <div className="space-y-2">
                        <Label htmlFor="manualNcf">
                          NCF Manual {ncfConfig?.requireNcfForInvoice && !ncfConfig?.autoAssignNcf ? '*' : '(Opcional)'}
                        </Label>
                        <Input
                          id="manualNcf"
                          placeholder="Ej: E01000000123"
                          value={manualNcf}
                          onChange={(e) => setManualNcf(e.target.value.toUpperCase())}
                          className="font-mono"
                          maxLength={13}
                        />
                        <p className="text-xs text-muted-foreground">
                          Formato: E + 2 dígitos de tipo + 8 dígitos de secuencia
                        </p>
                      </div>
                    )}

                    {/* Checkbox para enviar factura por email */}
                    <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <input
                        type="checkbox"
                        id="sendEmail"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="sendEmail" className="cursor-pointer text-sm font-medium">
                        Enviar factura por correo electrónico
                      </Label>
                    </div>

                    {/* Campo de email (solo si checkbox está marcado) */}
                    {sendEmail && (
                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">
                          Correo Electrónico {!selectedCustomer?.email ? '*' : '(Opcional)'}
                        </Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          placeholder="Ej: cliente@ejemplo.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          {selectedCustomer?.email
                            ? 'Email del cliente pre-llenado. Puede modificarlo si el cliente lo desea.'
                            : 'Ingrese el correo electrónico donde se enviará la factura.'}
                        </p>
                      </div>
                    )}

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
                          {canSellCredit && selectedCustomer?.allowCredit && (
                            <SelectItem value="CREDIT">
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                Crédito
                              </div>
                            </SelectItem>
                          )}
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
                  ) : paymentMethod === 'TRANSFER' ? (
                    <>
                      <DollarSign className="h-4 w-4 mr-1" />
                      Transferencia
                    </>
                  ) : (
                    <>
                      <UserIcon className="h-4 w-4 mr-1" />
                      Crédito
                    </>
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

        {/* Modal de gastos de caja */}
        <CashExpenseModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
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
                  {completedInvoice.ncf && (
                    <>
                      <div className="flex justify-between items-center bg-yellow-50 dark:bg-yellow-900/20 -mx-4 px-4 py-2">
                        <span className="text-sm font-semibold">NCF:</span>
                        <span className="font-bold text-lg font-mono tracking-wider">{completedInvoice.ncf}</span>
                      </div>
                      {completedInvoice.ncfType && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Tipo de NCF:</span>
                          <span className="font-medium text-sm">{ncfTypeLabels[completedInvoice.ncfType as NcfType]}</span>
                        </div>
                      )}
                      {completedInvoice.ncfValidUntil && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">NCF Válido hasta:</span>
                          <span className="font-medium text-sm">
                            {new Date(completedInvoice.ncfValidUntil).toLocaleDateString('es-DO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {completedInvoice.customerName && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cliente:</span>
                      <span className="font-medium">{completedInvoice.customerName}</span>
                    </div>
                  )}
                  {completedInvoice.customerRnc && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">RNC/Cédula:</span>
                      <span className="font-medium font-mono">{completedInvoice.customerRnc}</span>
                    </div>
                  )}
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
                      ) : completedInvoice.paymentMethod === 'TRANSFER' ? (
                        <>
                          <DollarSign className="h-3 w-3 mr-1" />
                          Transferencia
                        </>
                      ) : (
                        <>
                          <UserIcon className="h-3 w-3 mr-1" />
                          Crédito
                        </>
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
                          <p className="font-medium">
                            {item.variant.product.name}
                            {item.variant.name && ` - ${item.variant.name}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.variant.sku} | Código: {item.variant.product.code}
                          </p>
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
    </ProtectedPage>
  );
}
