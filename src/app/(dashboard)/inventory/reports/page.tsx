'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockValuationReport, LowStockReport, Warehouse } from '@/lib/types/inventory';
import { InventoryService, WarehouseService } from '@/lib/services/inventoryService';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, DollarSign, Package, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

export default function InventoryReportsPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [valuationReport, setValuationReport] = useState<StockValuationReport | null>(null);
  const [lowStockReport, setLowStockReport] = useState<LowStockReport | null>(null);
  const [loadingValuation, setLoadingValuation] = useState(false);
  const [loadingLowStock, setLoadingLowStock] = useState(false);
  const [activeTab, setActiveTab] = useState('valuation');

  // Paginación para valorización
  const [valuationPage, setValuationPage] = useState(1);
  const [valuationItemsPerPage] = useState(10);

  // Paginación para stock bajo
  const [lowStockPage, setLowStockPage] = useState(1);
  const [lowStockItemsPerPage] = useState(10);

  const fetchWarehouses = async () => {
    try {
      const data = await WarehouseService.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Error al cargar los almacenes:', error);
    }
  };

  const fetchValuationReport = async () => {
    try {
      setLoadingValuation(true);
      const warehouseId = selectedWarehouse === 'all' ? undefined : parseInt(selectedWarehouse);
      const data = await InventoryService.getStockValuationReport(warehouseId);
      setValuationReport(data);
      setValuationPage(1); // Reset pagination
    } catch (error) {
      console.error('Error al cargar el reporte de valorización:', error);
    } finally {
      setLoadingValuation(false);
    }
  };

  const fetchLowStockReport = async () => {
    try {
      setLoadingLowStock(true);
      const warehouseId = selectedWarehouse === 'all' ? undefined : parseInt(selectedWarehouse);
      const data = await InventoryService.getLowStockReport(warehouseId);
      setLowStockReport(data);
      setLowStockPage(1); // Reset pagination
    } catch (error) {
      console.error('Error al cargar el reporte de stock bajo:', error);
    } finally {
      setLoadingLowStock(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (activeTab === 'valuation') {
      fetchValuationReport();
    } else if (activeTab === 'lowStock') {
      fetchLowStockReport();
    }
  }, [selectedWarehouse, activeTab]);

  // Calcular items paginados para valorización
  const paginatedValuationItems = valuationReport?.items.slice(
    (valuationPage - 1) * valuationItemsPerPage,
    valuationPage * valuationItemsPerPage
  ) || [];

  const valuationTotalPages = Math.ceil((valuationReport?.items.length || 0) / valuationItemsPerPage);

  // Calcular items paginados para stock bajo
  const paginatedLowStockItems = lowStockReport?.items.slice(
    (lowStockPage - 1) * lowStockItemsPerPage,
    lowStockPage * lowStockItemsPerPage
  ) || [];

  const lowStockTotalPages = Math.ceil((lowStockReport?.items.length || 0) / lowStockItemsPerPage);

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Reportes de Inventario"
        description="Visualiza la valorización y el estado del inventario"
        icon="bar-chart"
      />

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Filtrar por almacén:</label>
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Seleccionar almacén" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los almacenes</SelectItem>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="valuation">Valorización de Inventario</TabsTrigger>
          <TabsTrigger value="lowStock">Stock Bajo</TabsTrigger>
        </TabsList>

        {/* Tab de Valorización */}
        <TabsContent value="valuation" className="space-y-6">
          {loadingValuation ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : valuationReport ? (
            <>
              {/* Tarjetas de resumen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{valuationReport.summary.totalItems}</div>
                    <p className="text-xs text-muted-foreground">Productos únicos en inventario</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cantidad Total</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{valuationReport.summary.totalQuantity}</div>
                    <p className="text-xs text-muted-foreground">Unidades totales</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(valuationReport.summary.totalValue)}</div>
                    <p className="text-xs text-muted-foreground">Valor del inventario</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de valorización */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalle de Valorización</CardTitle>
                  <CardDescription>Listado de productos con su valorización</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Almacén
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Código
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Producto
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Cantidad
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Costo Unitario
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Valor Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedValuationItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {item.warehouseName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {item.productCode}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {item.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                              {formatCurrency(item.unitCost)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(item.totalCost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {valuationTotalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Mostrando {((valuationPage - 1) * valuationItemsPerPage) + 1} - {Math.min(valuationPage * valuationItemsPerPage, valuationReport.items.length)} de {valuationReport.items.length} productos
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setValuationPage(prev => Math.max(prev - 1, 1))}
                          disabled={valuationPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {Array.from({ length: Math.min(5, valuationTotalPages) }, (_, i) => {
                          let pageNum;
                          if (valuationTotalPages <= 5) {
                            pageNum = i + 1;
                          } else if (valuationPage <= 3) {
                            pageNum = i + 1;
                          } else if (valuationPage >= valuationTotalPages - 2) {
                            pageNum = valuationTotalPages - 4 + i;
                          } else {
                            pageNum = valuationPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={valuationPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setValuationPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setValuationPage(prev => Math.min(prev + 1, valuationTotalPages))}
                          disabled={valuationPage === valuationTotalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Tab de Stock Bajo */}
        <TabsContent value="lowStock" className="space-y-6">
          {loadingLowStock ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : lowStockReport ? (
            <>
              {lowStockReport.count > 0 ? (
                <>
                  {/* Alerta de advertencia */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                      <div>
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                          {lowStockReport.count} producto{lowStockReport.count > 1 ? 's' : ''} con stock bajo
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Los siguientes productos están por debajo del nivel mínimo de stock establecido.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tabla de stock bajo */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Productos con Stock Bajo</CardTitle>
                      <CardDescription>Productos que requieren reabastecimiento</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Almacén
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Código
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Producto
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Cantidad Actual
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Stock Mínimo
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Déficit
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedLowStockItems.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {item.warehouseName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {item.productCode}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                  {item.productName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                                  {item.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                                  {item.minStock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600 dark:text-red-400">
                                  {item.deficit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Paginación */}
                      {lowStockTotalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Mostrando {((lowStockPage - 1) * lowStockItemsPerPage) + 1} - {Math.min(lowStockPage * lowStockItemsPerPage, lowStockReport.items.length)} de {lowStockReport.items.length} productos
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLowStockPage(prev => Math.max(prev - 1, 1))}
                              disabled={lowStockPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {Array.from({ length: Math.min(5, lowStockTotalPages) }, (_, i) => {
                              let pageNum;
                              if (lowStockTotalPages <= 5) {
                                pageNum = i + 1;
                              } else if (lowStockPage <= 3) {
                                pageNum = i + 1;
                              } else if (lowStockPage >= lowStockTotalPages - 2) {
                                pageNum = lowStockTotalPages - 4 + i;
                              } else {
                                pageNum = lowStockPage - 2 + i;
                              }

                              return (
                                <Button
                                  key={pageNum}
                                  variant={lowStockPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setLowStockPage(pageNum)}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLowStockPage(prev => Math.min(prev + 1, lowStockTotalPages))}
                              disabled={lowStockPage === lowStockTotalPages}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                  <div className="flex items-start">
                    <Package className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">
                        No hay productos con stock bajo
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Todos los productos tienen niveles de stock adecuados.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}