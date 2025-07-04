"use client";

import { useState, useEffect } from 'react';
import { Button, Card, Input, Modal, Table, Select, InputNumber, Form, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Product, ProductCategory, CreateProductDto, UpdateProductDto } from '@/types/inventory';
import { ProductService, ProductCategoryService } from '@/lib/services/inventory-service';

const { Option } = Select;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getAll(selectedCategory, searchText);
      setProducts(data);
    } catch (error) {
      message.error('Error al cargar los productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await ProductCategoryService.getAll();
      setCategories(data);
    } catch (error) {
      message.error('Error al cargar las categorías');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchText, selectedCategory]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.setFieldsValue({
        code: product.code,
        name: product.name,
        description: product.description || '',
        price: product.price,
        cost: product.cost,
        categoryId: product.categoryId,
      });
    } else {
      setEditingProduct(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingProduct) {
        await ProductService.update(editingProduct.id, values);
        message.success('Producto actualizado correctamente');
      } else {
        await ProductService.create(values as CreateProductDto);
        message.success('Producto creado correctamente');
      }

      setModalVisible(false);
      fetchProducts();
    } catch (error) {
      if (error.errorFields) {
        // Validation error
        return;
      }
      message.error('Error al guardar el producto');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar este producto?',
      content: 'Esta acción no se puede deshacer. Si el producto tiene inventario asociado, no se podrá eliminar.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await ProductService.delete(id);
          message.success('Producto eliminado correctamente');
          fetchProducts();
        } catch (error) {
          message.error('Error al eliminar el producto. Puede que tenga inventario asociado.');
          console.error(error);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Código',
      dataIndex: 'code',
      key: 'code',
      width: 120,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Categoría',
      dataIndex: 'category',
      key: 'category',
      render: (_: any, record: Product) => record.category?.name || '-',
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
      width: 120,
    },
    {
      title: 'Costo',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => `$${cost.toFixed(2)}`,
      width: 120,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_: any, record: Product) => (
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
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          Nuevo Producto
        </Button>
      </div>

      <div className="mb-6 flex items-center space-x-4">
        <Input
          placeholder="Buscar por nombre o código"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          placeholder="Filtrar por categoría"
          style={{ width: 200 }}
          allowClear
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value)}
        >
          {categories.map((category) => (
            <Option key={category.id} value={category.id}>
              {category.name}
            </Option>
          ))}
        </Select>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText={editingProduct ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Código"
              rules={[{ required: true, message: 'El código es obligatorio' }]}
            >
              <Input placeholder="Código único del producto" />
            </Form.Item>

            <Form.Item
              name="categoryId"
              label="Categoría"
              rules={[{ required: true, message: 'La categoría es obligatoria' }]}
            >
              <Select placeholder="Seleccione una categoría">
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input placeholder="Nombre del producto" />
          </Form.Item>

          <Form.Item name="description" label="Descripción">
            <Input.TextArea placeholder="Descripción del producto (opcional)" rows={3} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="price"
              label="Precio de Venta"
              rules={[{ required: true, message: 'El precio es obligatorio' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                style={{ width: '100%' }}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>

            <Form.Item
              name="cost"
              label="Costo"
              rules={[{ required: true, message: 'El costo es obligatorio' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                style={{ width: '100%' }}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
