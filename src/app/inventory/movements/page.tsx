"use client";

import { useState, useEffect } from 'react';
import { Button, Card, Table, Select, DatePicker, Modal, Form, Input, InputNumber, Tag, message } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { InventoryMovement, MovementType, Product, Warehouse, CreateInventoryMovementDto } from '@/types/inventory';
import { InventoryService, ProductService, WarehouseService } from '@/lib/services/inventory-service';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function InventoryMovementsPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<MovementType | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [movementType, setMovementType] = useState<MovementType>(MovementType.ENTRADA);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const startDate = dateRange?.[0]?.format('YYYY-MM-DD');
      const endDate = dateRange?.[1]?.format('YYYY-MM-DD');
      const data = await InventoryService.getMovements(
        selectedProduct,
        selectedType,
        startDate,
        endDate
      );
      setMovements(data);
    } catch (error) {
      message.error('Error al cargar los movimientos');
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
    fetchMovements();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [selectedProduct, selectedType, dateRange]);

  const handleOpenModal = () => {
    form.resetFields();
    setMovementType(MovementType.ENTRADA);
    setModalVisible(true);
  };

  const handleMovementTypeChange = (value: MovementType) => {
    setMovementType(value);
    form.setFieldsValue({
      sourceWarehouseId: undefined,
      destinationWarehouseId: undefined,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await InventoryService.createMovement(values as CreateInventoryMovementDto);
      message.success('Movimiento registrado correctamente');
      setModalVisible(false);
      fetchMovements();
    } catch (error) {
      if (error.errorFields) {
        // Validation error
        return;
      }
      message.error('Error al registrar el movimiento');
      console.error(error);
    }
  };

  const handleViewDetail = (movement: InventoryMovement) => {
    setSelectedMovement(movement);
    setDetailModalVisible(true);
  };

  const getMovementTypeColor = (type: MovementType) => {
    switch (type) {
      case MovementType.ENTRADA:
        return 'green';
      case MovementType.SALIDA:
        return 'red';
      case MovementType.TRANSFERENCIA:
        return 'blue';
      case MovementType.AJUSTE:
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: MovementType) => (
        <Tag color={getMovementTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: 'Producto',
      dataIndex: 'product',
      key: 'product',
      render: (_: any, record: InventoryMovement) => (
        <div>
          <div className="font-medium">{record.product?.name}</div>
          <div className="text-xs text-gray-500">{record.product?.code}</div>
        </div>
      ),
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Referencia',
      dataIndex: 'reference',
      key: 'reference',
      render: (text: string) => text || '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 100,
      render: (_: any, record: InventoryMovement) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenModal}
        >
          Nuevo Movimiento
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
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
        
        <Select
          placeholder="Filtrar por tipo"
          style={{ width: 150 }}
          allowClear
          value={selectedType}
          onChange={(value) => setSelectedType(value)}
        >
          {Object.values(MovementType).map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>

        <RangePicker 
          onChange={(dates) => setDateRange(dates)}
          format="DD/MM/YYYY"
        />
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={movements}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal para crear movimiento */}
      <Modal
        title="Nuevo Movimiento de Inventario"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="Registrar"
        cancelText="Cancelar"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="Tipo de Movimiento"
            initialValue={MovementType.ENTRADA}
            rules={[{ required: true, message: 'El tipo de movimiento es obligatorio' }]}
          >
            <Select onChange={handleMovementTypeChange}>
              {Object.values(MovementType).map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>

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

          <div className="grid grid-cols-2 gap-4">
            {(movementType === MovementType.SALIDA || 
              movementType === MovementType.TRANSFERENCIA || 
              movementType === MovementType.AJUSTE) && (
              <Form.Item
                name="sourceWarehouseId"
                label="Almacén Origen"
                rules={[{ required: true, message: 'El almacén origen es obligatorio' }]}
              >
                <Select placeholder="Seleccione un almacén">
                  {warehouses.map((warehouse) => (
                    <Option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {(movementType === MovementType.ENTRADA || 
              movementType === MovementType.TRANSFERENCIA) && (
              <Form.Item
                name="destinationWarehouseId"
                label="Almacén Destino"
                rules={[{ required: true, message: 'El almacén destino es obligatorio' }]}
              >
                <Select placeholder="Seleccione un almacén">
                  {warehouses.map((warehouse) => (
                    <Option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="quantity"
              label="Cantidad"
              rules={[{ required: true, message: 'La cantidad es obligatoria' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="reference"
              label="Referencia"
            >
              <Input placeholder="Ej: Factura #123, Orden #456" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Notas">
            <Input.TextArea rows={3} placeholder="Notas adicionales sobre este movimiento" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para ver detalles */}
      <Modal
        title="Detalles del Movimiento"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={600}
      >
        {selectedMovement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium">{selectedMovement.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium">{dayjs(selectedMovement.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Tipo</p>
              <Tag color={getMovementTypeColor(selectedMovement.type)}>{selectedMovement.type}</Tag>
            </div>

            <div>
              <p className="text-sm text-gray-500">Producto</p>
              <p className="font-medium">{selectedMovement.product?.name} ({selectedMovement.product?.code})</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Cantidad</p>
                <p className="font-medium">{selectedMovement.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Referencia</p>
                <p className="font-medium">{selectedMovement.reference || '-'}</p>
              </div>
            </div>

            {selectedMovement.sourceWarehouseId && (
              <div>
                <p className="text-sm text-gray-500">Almacén Origen</p>
                <p className="font-medium">
                  {warehouses.find(w => w.id === selectedMovement.sourceWarehouseId)?.name || '-'}
                </p>
              </div>
            )}

            {selectedMovement.destinationWarehouseId && (
              <div>
                <p className="text-sm text-gray-500">Almacén Destino</p>
                <p className="font-medium">
                  {warehouses.find(w => w.id === selectedMovement.destinationWarehouseId)?.name || '-'}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Notas</p>
              <p className="font-medium">{selectedMovement.notes || '-'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
