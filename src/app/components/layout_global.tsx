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
          main: "#900C3F", // Nuevo color base burdeos
          dark: "#581845",
          light: "#C70039",
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#C70039",
          dark: "#900C3F",
          light: "#FF5733",
          contrastText: "#ffffff",
        },
        background: {
          default: "#FFF5F7", // Color de fondo general actualizado para burdeos
          paper: "#ffffff", // Fondo de tarjetas y elementos
        },
        text: {
          primary: "#2d3436",
          secondary: "#636e72",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#900C3F", // Mismo color base en modo oscuro
          dark: "#581845",
          light: "#C70039",
          contrastText: "#ffffff",
        },
        secondary: {
          main: "#C70039",
          dark: "#900C3F",
          light: "#FF5733",
          contrastText: "#ffffff",
        },
        background: {
          default: "#2C0A1A", // Color de fondo oscuro con tinte burdeos
          paper: "#3B0B2E", // Fondo del sidebar y navbar
        },
        text: {
          primary: "#F9FAFB",
          secondary: "#D1D5DB",
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
  
  // Solo renderizamos el componente completo en el cliente
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Renderizamos un esqueleto básico en el servidor para evitar errores de hidratación
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center">
        <div className="text-[#900C3F] font-medium">Cargando...</div>
      </div>
    );
  }
  
  // Solo renderizamos los componentes de MUI en el cliente
  return (
    <AppProvider navigation={NAVIGATION} theme={demoTheme}>
      <DashboardLayout
        branding={{ 
          title: "Xotica", 
          logo: <Image width="48" height="48" alt='Logo' src="/img/logo.png" priority /> 
        }}
        defaultSidebarCollapsed={true}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: '#900C3F',
            color: '#ffffff',
            '& .MuiListItemButton-root': {
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            },
            '& .Mui-selected': {
              backgroundColor: 'rgba(255, 255, 255, 0.12) !important',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.16) !important',
              },
            },
          },
          '& .MuiAppBar-root': {
            backgroundColor: '#900C3F',
            color: '#ffffff',
          },
        }}
      >
        <PageContainer className="bg-[#FFF5F7]">
          {children}
        </PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
