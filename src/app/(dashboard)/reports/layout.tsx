import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reportes | CloudSuite Pro',
  description: 'Reportes y análisis de ventas',
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="space-y-6">{children}</div>;
}
