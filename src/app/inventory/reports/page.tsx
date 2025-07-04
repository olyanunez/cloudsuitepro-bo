"use client";

import { useState, useEffect } from 'react';
import { Card, Table, Select, Tabs, Statistic, Row, Col, Alert } from 'antd';
import { WarningOutlined, DollarOutlined, InboxOutlined } from '@ant-design/icons';
import { StockValuationReport, LowStockReport, Warehouse } from '@/types/inventory';
import { InventoryService, WarehouseService } from '@/lib/services/inventory-service';

const { Option } = Select;
const { TabPane } = Tabs;

export default function InventoryReportsPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(undefined);
  const [valuationReport, setValuationReport] = useState<StockValuationReport | null>(null);
  const [lowStockReport, setLowStockReport] = useState<LowStockReport | null>(null);
  const [loadingValuation, setLoadingValuation] = useState(false);
  const [loadingLowStock, setLoadingLowStock] = useState(false);
  const [activeTab, setActiveTab] = useState('valuation');

  const fetchWarehouses = async () => {
    try {
      const data = await WarehouseService.getAll();
      setWarehouses(data);
    } catch (error) {
      console.error('Error al cargar los almacenes:', error);
    }
  };

  const fetchValuationReport = async () => {
    try {
      setLoadingValuation(true);
      const data = await InventoryService.getStockValuationReport(selectedWarehouse);
      setValuationReport(data);
    } catch (error) {
      console.error('Error al cargar el reporte de valorización:', error);
    } finally {
      setLoadingValuation(false);
    }
  };

  const fetchLowStockReport = async () => {
    try {
      setLoadingLowStock(true);
      const data = await InventoryService.getLowStockReport(selectedWarehouse);
      setLowStockReport(data);
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

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const valuationColumns = [
    {
      title: 'Almacén',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: 'Código',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Costo Unitario',
      dataIndex: 'unitCost',
      key: 'unitCost',
      render: (cost: number) => `$${cost.toFixed(2)}`,
    },
    {
      title: 'Valor Total',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost: number) => `$${cost.toFixed(2)}`,
    },
  ];

  const lowStockColumns = [
    {
      title: 'Almacén',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: 'Código',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: 'Producto',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Cantidad Actual',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Stock Mínimo',
      dataIndex: 'minStock',
      key: 'minStock',
    },
    {
      title: 'Déficit',
      dataIndex: 'deficit',
      key: 'deficit',
      render: (deficit: number) => (
        <span className="text-red-500 font-medium">{deficit}</span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reportes de Inventario</h1>
        <Select
          placeholder="Filtrar por almacén"
          style={{ width: 200 }}
          allowClear
          value={selectedWarehouse}
          onChange={(value) => setSelectedWarehouse(value)}
        >
          {warehouses.map((warehouse) => (
            <Option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </Option>
          ))}
        </Select>
      </div>

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Valorización de Inventario" key="valuation">
          {valuationReport && (
            <>
              <Row gutter={16} className="mb-6">
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total de Productos"
                      value={valuationReport.summary.totalItems}
                      prefix={<InboxOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Cantidad Total de Unidades"
                      value={valuationReport.summary.totalQuantity}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Valor Total del Inventario"
                      value={valuationReport.summary.totalValue}
                      precision={2}
                      prefix={<DollarOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Card>
                <Table
                  columns={valuationColumns}
                  dataSource={valuationReport.items}
                  rowKey="id"
                  loading={loadingValuation}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </>
          )}
        </TabPane>

        <TabPane tab="Productos con Stock Bajo" key="lowStock">
          {lowStockReport && (
            <>
              {lowStockReport.count > 0 ? (
                <>
                  <Alert
                    message={`${lowStockReport.count} productos con stock bajo`}
                    description="Los siguientes productos están por debajo del nivel mínimo de stock establecido."
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    className="mb-6"
                  />
                  <Card>
                    <Table
                      columns={lowStockColumns}
                      dataSource={lowStockReport.items}
                      rowKey="id"
                      loading={loadingLowStock}
                      pagination={{ pageSize: 10 }}
                    />
                  </Card>
                </>
              ) : (
                <Alert
                  message="No hay productos con stock bajo"
                  description="Todos los productos tienen niveles de stock adecuados."
                  type="success"
                  showIcon
                  className="mb-6"
                />
              )}
            </>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}
