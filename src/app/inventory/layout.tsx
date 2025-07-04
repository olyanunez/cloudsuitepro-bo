"use client";

import { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Tag, 
  ShoppingBag, 
  Building, 
  Package, 
  ArrowLeftRight, 
  BarChart3 
} from 'lucide-react';
import Link from 'next/link';

const { Sider, Content } = Layout;

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState('');

  useEffect(() => {
    const path = pathname.split('/');
    const currentSection = path[path.length - 1];
    setSelectedKey(currentSection);
  }, [pathname]);

  const menuItems = [
    {
      key: 'categories',
      icon: <Tag size={18} />,
      label: <Link href="/inventory/categories">Categorías</Link>,
    },
    {
      key: 'products',
      icon: <ShoppingBag size={18} />,
      label: <Link href="/inventory/products">Productos</Link>,
    },
    {
      key: 'warehouses',
      icon: <Building size={18} />,
      label: <Link href="/inventory/warehouses">Almacenes</Link>,
    },
    {
      key: 'items',
      icon: <Package size={18} />,
      label: <Link href="/inventory/items">Inventario</Link>,
    },
    {
      key: 'movements',
      icon: <ArrowLeftRight size={18} />,
      label: <Link href="/inventory/movements">Movimientos</Link>,
    },
    {
      key: 'reports',
      icon: <BarChart3 size={18} />,
      label: <Link href="/inventory/reports">Reportes</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Sider width={200} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Content style={{ padding: '0', backgroundColor: '#fff' }}>{children}</Content>
    </Layout>
  );
}
