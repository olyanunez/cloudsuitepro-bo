'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import ThemeProvider from '@/components/providers/ThemeProvider';

export default function DashboardAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ThemeProvider>
  );
}
