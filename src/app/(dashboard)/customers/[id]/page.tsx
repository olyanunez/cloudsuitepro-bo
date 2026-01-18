'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiGet } from '@/lib/services/apiService';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Calendar,
  User,
  Hash,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: number;
  invoiceNumber: string;
  total: number;
  status: string;
  createdAt: string;
}

interface Customer {
  id: number;
  code: string;
  name: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  taxRegime?: 'NORMAL' | 'RUI' | 'SPECIAL_REGIME';
  isActive: boolean;
  createdAt: string;
  invoices: Invoice[];
  stats: {
    totalInvoices: number;
    totalSpent: number;
  };
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const data = await apiGet<Customer>(`/customers/${id}`);
        setCustomer(data);
      } catch (error: any) {
        toast.error('Error al cargar cliente', {
          description: error.message || 'No se pudo cargar el cliente',
        });
        router.push('/customers');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <p className="text-center">Cargando...</p>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/customers">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Clientes
          </Button>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {customer.name} {customer.lastName || ''}
            </h1>
            <p className="text-gray-600 mt-1">Código: {customer.code}</p>
          </div>
          <Link href={`/customers/edit/${customer.id}`}>
            <Button className="bg-yellow-500 hover:bg-yellow-600">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Información del Cliente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nombre Completo</p>
                  <p className="font-medium">
                    {customer.name} {customer.lastName || ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Código</p>
                  <p className="font-medium">{customer.code}</p>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                </div>
              )}

              {customer.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                </div>
              )}

              {customer.taxId && (
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">RNC / Cédula</p>
                    <p className="font-medium">{customer.taxId}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                {customer.taxRegime === 'RUI' ? (
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                ) : customer.taxRegime === 'SPECIAL_REGIME' ? (
                  <CheckCircle className="h-5 w-5 text-purple-500 mt-0.5" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-gray-600">Régimen Fiscal</p>
                  <p className="font-medium">
                    {customer.taxRegime === 'RUI' && 'Régimen Simplificado (RUI) - Requiere NCF B12'}
                    {customer.taxRegime === 'SPECIAL_REGIME' && 'Regímenes Especiales - Requiere NCF B14'}
                    {(!customer.taxRegime || customer.taxRegime === 'NORMAL') && 'Normal - NCF B01'}
                  </p>
                </div>
              </div>

              {customer.address && (
                <div className="flex items-start space-x-3 md:col-span-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="font-medium">{customer.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                {customer.isActive ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-medium">
                    {customer.isActive ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Cliente Desde</p>
                  <p className="font-medium">{formatDate(customer.createdAt)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Invoices */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Últimas Facturas</h2>
            {customer.invoices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No hay facturas registradas
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                        Factura
                      </th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                        Fecha
                      </th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">
                        Total
                      </th>
                      <th className="text-center py-2 px-4 text-sm font-medium text-gray-600">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customer.invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(invoice.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(invoice.total)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${invoice.status === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : invoice.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {invoice.status === 'PAID'
                              ? 'Pagada'
                              : invoice.status === 'PENDING'
                                ? 'Pendiente'
                                : 'Cancelada'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Facturas</p>
                    <p className="text-2xl font-bold">
                      {customer.stats.totalInvoices}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Gastado</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(customer.stats.totalSpent)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {customer.stats.totalInvoices > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Promedio por Factura</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(
                          customer.stats.totalSpent / customer.stats.totalInvoices
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
