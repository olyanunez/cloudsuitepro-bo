'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiGet, apiDelete, apiPatch } from '@/lib/services/apiService';
import { Plus, Search, Edit, Trash2, Eye, UserCheck, UserX, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: number;
  code: string;
  name: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
  _count?: {
    invoices: number;
  };
}

interface CustomerResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await apiGet<CustomerResponse>(`/customers?${params}`);
      setCustomers(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error: any) {
      toast.error('Error al cargar clientes', {
        description: error.message || 'No se pudieron cargar los clientes',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const handleDelete = async (id: number, customerName: string) => {
    if (!confirm(`¿Está seguro de eliminar el cliente "${customerName}"?`)) {
      return;
    }

    try {
      await apiDelete(`/customers/${id}`);
      toast.success('Cliente eliminado exitosamente');
      fetchCustomers();
    } catch (error: any) {
      toast.error('Error al eliminar cliente', {
        description: error.message || 'No se pudo eliminar el cliente',
      });
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await apiPatch(`/customers/${id}/toggle-active`, {});
      toast.success(
        `Cliente ${currentStatus ? 'desactivado' : 'activado'} exitosamente`
      );
      fetchCustomers();
    } catch (error: any) {
      toast.error('Error al cambiar estado del cliente', {
        description: error.message,
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la información de tus clientes
          </p>
        </div>
        <Link href="/customers/create">
          <Button className="bg-primary hover:bg-primary-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por código, nombre, email, teléfono o RNC/Cédula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button type="submit">Buscar</Button>
        </form>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold">
                {customers.filter((c) => c.isActive).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Inactivos</p>
              <p className="text-2xl font-bold">
                {customers.filter((c) => !c.isActive).length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RNC/Cédula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facturas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    Cargando...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {customer.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {customer.name} {customer.lastName || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-1" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {customer.taxId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium">
                        {customer._count?.invoices || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleToggleActive(customer.id, customer.isActive)
                        }
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {customer.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/customers/${customer.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/customers/edit/${customer.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDelete(
                              customer.id,
                              `${customer.name} ${customer.lastName || ''}`
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Página {page} de {totalPages} ({total} clientes en total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
