"use client";

import { useState, useEffect } from 'react';
import { Button, Card, Input, Modal, Table, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProductCategory, CreateProductCategoryDto, UpdateProductCategoryDto } from '@/types/inventory';
import { ProductCategoryService } from '@/lib/services/inventory-service';

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [form, setForm] = useState<CreateProductCategoryDto | UpdateProductCategoryDto>({
    name: '',
    description: '',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await ProductCategoryService.getAll();
      setCategories(data);
    } catch (error) {
      message.error('Error al cargar las categorías');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: ProductCategory) => {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setForm({ name: '', description: '' });
    }
    setModalVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (!form.name.trim()) {
        message.error('El nombre es obligatorio');
        return;
      }

      if (editingCategory) {
        await ProductCategoryService.update(editingCategory.id, form);
        message.success('Categoría actualizada correctamente');
      } else {
        await ProductCategoryService.create(form as CreateProductCategoryDto);
        message.success('Categoría creada correctamente');
      }

      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error('Error al guardar la categoría');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar esta categoría?',
      content: 'Esta acción no se puede deshacer. Los productos asociados a esta categoría quedarán sin categoría.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await ProductCategoryService.delete(id);
          message.success('Categoría eliminada correctamente');
          fetchCategories();
        } catch (error) {
          message.error('Error al eliminar la categoría. Puede que tenga productos asociados.');
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
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: ProductCategory) => (
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
        <h1 className="text-2xl font-bold">Categorías de Productos</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          Nueva Categoría
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingCategory ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-1">Nombre *</label>
            <Input
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Nombre de la categoría"
            />
          </div>
          <div>
            <label className="block mb-1">Descripción</label>
            <Input
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Descripción (opcional)"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
