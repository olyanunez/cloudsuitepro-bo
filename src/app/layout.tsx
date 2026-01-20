import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TenantProvider } from "../lib/contexts/TenantContext";
import { BranchProvider } from "../lib/contexts/BranchContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
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
  title: "CloudSuite Pro",
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
              <SonnerToaster
                position="top-right"
                richColors
                toastOptions={{
                  style: {
                    fontFamily: 'var(--font-geist-sans)',
                  },
                  classNames: {
                    title: 'font-semibold',
                    description: 'text-sm opacity-90',
                  },
                }}
              />
            </BranchProvider>
          </TenantProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
