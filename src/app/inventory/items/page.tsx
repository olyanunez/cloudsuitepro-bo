"use client";

import { useState, useEffect } from 'react';
import { Button, Card, Table, Select, Tag, Modal, Form, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, WarningOutlined } from '@ant-design/icons';
import { InventoryItem, Product, Warehouse, CreateInventoryItemDto, UpdateInventoryItemDto } from '@/types/inventory';
import { InventoryService, ProductService, WarehouseService } from '@/lib/services/inventory-service';

const { Option } = Select;

export default function InventoryItemsPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form] = Form.useForm();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>(undefined);
  const [showLowStock, setShowLowStock] = useState(false);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const data = await InventoryService.getItems(selectedWarehouse, selectedProduct, showLowStock);
      setInventoryItems(data);
    } catch (error) {
      message.error('Error al cargar el inventario');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await ProductService.getAll();
      setProducts(data);
    } catch (error) {
      message.error('Error al cargar los productos');
      console.error(error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await WarehouseService.getAll();
      setWarehouses(data);
    } catch (error) {
      message.error('Error al cargar los almacenes');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    fetchInventoryItems();
  }, [selectedWarehouse, selectedProduct, showLowStock]);

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue({
        quantity: item.quantity,
        minStock: item.minStock,
        maxStock: item.maxStock,
      });
    } else {
      setEditingItem(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingItem) {
        await InventoryService.updateItem(editingItem.id, values);
        message.success('Inventario actualizado correctamente');
      } else {
        await InventoryService.createItem(values as CreateInventoryItemDto);
        message.success('Inventario creado correctamente');
      }

      setModalVisible(false);
      fetchInventoryItems();
    } catch (error) {
      if (error.errorFields) {
        // Validation error
        return;
      }
      message.error('Error al guardar el inventario');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Almacén',
      dataIndex: 'warehouse',
      key: 'warehouse',
      render: (_: any, record: InventoryItem) => record.warehouse?.name,
    },
    {
      title: 'Producto',
      dataIndex: 'product',
      key: 'product',
      render: (_: any, record: InventoryItem) => (
        <div>
          <div className="font-medium">{record.product?.name}</div>
          <div className="text-xs text-gray-500">{record.product?.code}</div>
        </div>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: 'category',
      key: 'category',
      render: (_: any, record: InventoryItem) => record.product?.category?.name || '-',
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: InventoryItem) => {
        const isLow = quantity <= record.minStock;
        return (
          <div className="flex items-center">
            <span className={`font-medium ${isLow ? 'text-red-500' : ''}`}>{quantity}</span>
            {isLow && (
              <WarningOutlined className="ml-2 text-red-500" title="Stock bajo" />
            )}
          </div>
        );
      },
    },
    {
      title: 'Mín/Máx',
      key: 'stockLimits',
      render: (_: any, record: InventoryItem) => (
        <span>
          {record.minStock} / {record.maxStock || '∞'}
        </span>
      ),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_: any, record: InventoryItem) => {
        if (record.quantity <= record.minStock) {
          return <Tag color="red">Stock Bajo</Tag>;
        } else if (record.maxStock && record.quantity >= record.maxStock) {
          return <Tag color="green">Stock Completo</Tag>;
        } else {
          return <Tag color="blue">Normal</Tag>;
        }
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_: any, record: InventoryItem) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          size="small"
          onClick={() => handleOpenModal(record)}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          Nuevo Item
        </Button>
      </div>

      <div className="mb-6 flex items-center space-x-4">
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
        
        <Select
          placeholder="Filtrar por producto"
          style={{ width: 250 }}
          allowClear
          value={selectedProduct}
          onChange={(value) => setSelectedProduct(value)}
          showSearch
          optionFilterProp="children"
        >
          {products.map((product) => (
            <Option key={product.id} value={product.id}>
              {product.name} ({product.code})
            </Option>
          ))}
        </Select>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
            className="mr-2"
          />
          <span>Solo mostrar stock bajo</span>
        </label>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={inventoryItems}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Editar Inventario' : 'Nuevo Item de Inventario'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingItem ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical">
          {!editingItem && (
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="productId"
                label="Producto"
                rules={[{ required: true, message: 'El producto es obligatorio' }]}
              >
                <Select
                  placeholder="Seleccione un producto"
                  showSearch
                  optionFilterProp="children"
                >
                  {products.map((product) => (
                    <Option key={product.id} value={product.id}>
                      {product.name} ({product.code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="warehouseId"
                label="Almacén"
                rules={[{ required: true, message: 'El almacén es obligatorio' }]}
              >
                <Select placeholder="Seleccione un almacén">
                  {warehouses.map((warehouse) => (
                    <Option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="quantity"
              label="Cantidad"
              rules={[{ required: true, message: 'La cantidad es obligatoria' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="minStock"
              label="Stock Mínimo"
              rules={[{ required: true, message: 'El stock mínimo es obligatorio' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="maxStock" label="Stock Máximo">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
