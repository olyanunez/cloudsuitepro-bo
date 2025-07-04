"use client";

import { useState, useEffect } from 'react';
import { Button, Card, Input, Modal, Table, Form, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Warehouse, CreateWarehouseDto, UpdateWarehouseDto } from '@/types/inventory';
import { WarehouseService } from '@/lib/services/inventory-service';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [form] = Form.useForm();

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const data = await WarehouseService.getAll();
      setWarehouses(data);
    } catch (error) {
      message.error('Error al cargar los almacenes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenModal = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      form.setFieldsValue({
        name: warehouse.name,
        description: warehouse.description || '',
        address: warehouse.address || '',
      });
    } else {
      setEditingWarehouse(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingWarehouse) {
        await WarehouseService.update(editingWarehouse.id, values);
        message.success('Almacén actualizado correctamente');
      } else {
        await WarehouseService.create(values as CreateWarehouseDto);
        message.success('Almacén creado correctamente');
      }

      setModalVisible(false);
      fetchWarehouses();
    } catch (error) {
      if (error.errorFields) {
        // Validation error
        return;
      }
      message.error('Error al guardar el almacén');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar este almacén?',
      content: 'Esta acción no se puede deshacer. Si el almacén tiene inventario asociado, no se podrá eliminar.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await WarehouseService.delete(id);
          message.success('Almacén eliminado correctamente');
          fetchWarehouses();
        } catch (error) {
          message.error('Error al eliminar el almacén. Puede que tenga inventario asociado.');
          console.error(error);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
      render: (text: string) => text || '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_: any, record: Warehouse) => (
        <div className="flex space-x-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenModal(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Almacenes</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          Nuevo Almacén
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={warehouses}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingWarehouse ? 'Editar Almacén' : 'Nuevo Almacén'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingWarehouse ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input placeholder="Nombre del almacén" />
          </Form.Item>

          <Form.Item name="description" label="Descripción">
            <Input.TextArea placeholder="Descripción del almacén (opcional)" rows={2} />
          </Form.Item>

          <Form.Item name="address" label="Dirección">
            <Input.TextArea placeholder="Dirección del almacén (opcional)" rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
