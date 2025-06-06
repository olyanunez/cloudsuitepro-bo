"use client";
import * as React from "react";
import { extendTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupIcon from "@mui/icons-material/Group";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAVIGATION = [
  {
    segment: "home",
    title: "Home",
    icon: <DashboardIcon />,
  },
  // {
  //   kind: "divider",
  // },
  {
    segment: "auth",
    title: "Autorización",
    icon: <AdminPanelSettingsIcon />,
    children: [
      {
        segment: "users_profiles",
        title: "Usuarios y Perfiles",
        icon: <GroupIcon />,
      },
    ],
  },
  {
    segment: "stock",
    title: "Almacén",
    icon: <InventoryIcon />,
    children: [
      {
        segment: "products",
        title: "Productos",
        icon: <CategoryIcon />,
      },
    ],
  },
];

const demoTheme = extendTheme({
  colorSchemes: {
    light:  {
      palette: {
        primary: {
          main: "#1E40AF", // Azul oscuro
        },
        background: {
          default: "#F8F9FD", // Color de fondo general
          paper: "#FFFFFF", // Fondo del sidebar y navbar
        },
        text: {
          primary: "#1E293B", // Texto principal
          secondary: "#64748B", // Texto secundario
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#2563EB", // Azul más claro en modo oscuro
        },
        background: {
          default: "#1E293B", // Color de fondo oscuro
          paper: "#111827", // Sidebar y navbar oscuros
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#CBD5E1",
        },
      },
    },
  },
  // components: {
  //   MuiPaper: {
  //     styleOverrides: {
  //       root: {
  //         boxShadow: "none", // 🔥 Elimina sombras
  //         border: "none", // 🔥 Elimina bordes
  //       },
  //     },
  //   },
  // },
  colorSchemeSelector: "class",
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      // lg: 1200,
      lg: 1370,
      xl: 1536,
    },
  },
});

export default function LayoutGlobal({ children }: { children: React.ReactNode }) {
  // Usamos usePathname de Next.js para obtener la ruta actual
  const pathname = usePathname();
  
  // Solo renderizamos el componente en el cliente
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Si no está montado (renderizado en el servidor), mostramos un placeholder
  if (!isMounted) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }
  
  return (
    <AppProvider navigation={NAVIGATION} theme={demoTheme}>
      <DashboardLayout
        branding={{ title: "Xotica", logo: <Image width="48" height="48" alt='Logo' src="/img/logo.png" /> }}
        defaultSidebarCollapsed={true}
      >
        <PageContainer
          className="bg-[#F8F9FD]"
        >
          {children}
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
