"use client";
import * as React from "react";
import { BrowserRouter as Router} from "react-router-dom";
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
  return (
    <Router>
      <AppProvider navigation={NAVIGATION} theme={demoTheme}>
        <DashboardLayout
          branding={{ title: "Xotica", logo: <Image width="48" height="48" alt='Logo' src="/img/logo.png" /> }}
          defaultSidebarCollapsed={true}
        >
          <PageContainer
            className="bg-[#F8F9FD]"
          >
            {/* <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/auth/users_profiles" element={<UsersProfiles />} />
              <Route path="/stock/products" element={<Products />} />
              <Route path="*" element={<h2>Página no encontrada</h2>} />
            </Routes> */}
            {/* {children} */}
          </PageContainer>
        </DashboardLayout>
      </AppProvider>
    </Router>
  );
}
