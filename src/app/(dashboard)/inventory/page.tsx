"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Statistic, Button } from 'antd';
import {
  TagsOutlined,
  ShoppingOutlined,
  BankOutlined,
  InboxOutlined,
  SwapOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

export default function InventoryDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la página de inventario
    router.push('/inventory/items');
  }, [router]);

  // Este componente no se mostrará debido a la redirección, pero lo incluimos por completitud
  const modules = [
    {
      title: 'Categorías',
      icon: <TagsOutlined style={{ fontSize: 24 }} />,
      description: 'Gestionar categorías de productos',
      path: '/inventory/categories',
      color: '#1890ff',
    },
    {
      title: 'Productos',
      icon: <ShoppingOutlined style={{ fontSize: 24 }} />,
      description: 'Administrar catálogo de productos',
      path: '/inventory/products',
      color: '#52c41a',
    },
    {
      title: 'Almacenes',
      icon: <BankOutlined style={{ fontSize: 24 }} />,
      description: 'Configurar ubicaciones de almacenamiento',
      path: '/inventory/warehouses',
      color: '#fa8c16',
    },
    {
      title: 'Inventario',
      icon: <InboxOutlined style={{ fontSize: 24 }} />,
      description: 'Ver y gestionar niveles de stock',
      path: '/inventory/items',
      color: '#722ed1',
    },
    {
      title: 'Movimientos',
      icon: <SwapOutlined style={{ fontSize: 24 }} />,
      description: 'Registrar entradas, salidas y transferencias',
      path: '/inventory/movements',
      color: '#eb2f96',
    },
    {
      title: 'Reportes',
      icon: <BarChartOutlined style={{ fontSize: 24 }} />,
      description: 'Analizar valorización y alertas de stock',
      path: '/inventory/reports',
      color: '#13c2c2',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Inventario</h1>
      <Row gutter={[16, 16]}>
        {modules.map((module) => (
          <Col xs={24} sm={12} md={8} key={module.title}>
            <Card
              hoverable
              onClick={() => router.push(module.path)}
              style={{ height: '100%' }}
            >
              <Statistic
                title={module.title}
                value=" "
                prefix={<div style={{ color: module.color }}>{module.icon}</div>}
              />
              <p className="mt-2">{module.description}</p>
              <Button type="link" href={module.path} className="p-0">
                Acceder
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
