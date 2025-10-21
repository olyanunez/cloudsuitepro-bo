import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TenantProvider } from "../lib/contexts/TenantContext";
import { BranchProvider } from "../lib/contexts/BranchContext";
import { Toaster } from "@/components/ui/toaster";
import ReduxProvider from "@/lib/providers/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xotica",
  description: "Gestión de Empresas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <TenantProvider>
            <BranchProvider>
              {children}
              <Toaster />
            </BranchProvider>
          </TenantProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
