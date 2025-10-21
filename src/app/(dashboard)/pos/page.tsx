'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBranch } from '@/lib/contexts/BranchContext';
import { PosService, ProductStock, InvoiceItem } from '@/lib/services/posService';
import { BranchService } from '@/lib/services/branchService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeWarehouseId, setActiveWarehouseId] = useState<number | null>(null);
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);

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
          console.log('✅ Warehouse loaded:', warehouse.id, warehouse.name);
        } else {
          console.warn('⚠️ No active warehouse found for branch');
          setActiveWarehouseId(null);
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
  };

  // Calcular totales
  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.cartQuantity,
    0
  );
  const tax = 0; // Puedes agregar lógica de impuestos aquí
  const discount = 0; // Puedes agregar lógica de descuentos aquí
  const total = subtotal + tax - discount;

  // Procesar pago
  const processPayment = async () => {
    if (!activeBranchId || !activeWarehouseId) {
      toast.error('Debe seleccionar una sucursal');
      return;
    }

    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setProcessingPayment(true);
    try {
      const items: InvoiceItem[] = cart.map((item) => ({
        productId: item.id,
        quantity: item.cartQuantity,
        unitPrice: parseFloat(item.price),
      }));

      const invoice = await PosService.createInvoice({
        branchId: activeBranchId,
        warehouseId: activeWarehouseId,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        items,
      });

      toast.success(`Factura ${invoice.invoiceNumber} creada exitosamente`);
      clearCart();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error?.message || 'Error al procesar el pago');
    } finally {
      setProcessingPayment(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Punto de Venta</h1>
          <p className="text-muted-foreground">
            Sucursal:{' '}
            {userBranches.find((ub) => ub.branch.id === activeBranchId)?.branch.name}
          </p>
        </div>
      </div>

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
              {searchResults.length > 0 && (
                <div className="mt-4 border rounded-lg divide-y max-h-96 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
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
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ${parseFloat(product.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                              ${parseFloat(item.price).toFixed(2)} c/u
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
                            $
                            {(
                              parseFloat(item.price) * item.cartQuantity
                            ).toFixed(2)}
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
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Impuesto:</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Descuento:</span>
                        <span className="text-destructive">
                          -${discount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Método de pago */}
                  <div className="space-y-2">
                    <Label>Método de Pago</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value: any) => setPaymentMethod(value)}
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

                  {/* Botón de pagar */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={processPayment}
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
                        Procesar Pago (${total.toFixed(2)})
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
