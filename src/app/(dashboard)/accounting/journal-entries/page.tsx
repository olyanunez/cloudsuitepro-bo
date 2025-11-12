'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiGet, apiPost } from '@/lib/services/apiService';
import {
  Plus,
  Search,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface JournalEntry {
  id: number;
  entryNumber: string;
  entryDate: string;
  fiscalPeriod: string;
  fiscalYear: number;
  entryType: string;
  description: string;
  reference?: string;
  status: 'DRAFT' | 'POSTED' | 'VOID';
  totalDebit: number;
  totalCredit: number;
  postedAt?: string;
  createdAt: string;
  lines: {
    id: number;
    account: {
      code: string;
      name: string;
    };
    debitAmount: number;
    creditAmount: number;
  }[];
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  POSTED: 'Contabilizado',
  VOID: 'Anulado',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  POSTED: 'bg-green-100 text-green-800',
  VOID: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, any> = {
  DRAFT: Clock,
  POSTED: CheckCircle,
  VOID: XCircle,
};

const entryTypeLabels: Record<string, string> = {
  MANUAL: 'Manual',
  SALE: 'Venta',
  PURCHASE: 'Compra',
  ADJUSTMENT: 'Ajuste',
  CLOSING: 'Cierre',
  OPENING: 'Apertura',
};

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchEntries();
  }, [statusFilter, startDate, endDate]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const data = await apiGet<JournalEntry[]>(
        `/accounting/journal-entries?${params}`
      );
      setEntries(data);
    } catch (error: any) {
      toast.error('Error al cargar asientos', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (id: number, entryNumber: string) => {
    if (
      !confirm(`¿Está seguro de contabilizar el asiento "${entryNumber}"? Esta acción no se puede deshacer.`)
    ) {
      return;
    }

    try {
      await apiPost(`/accounting/journal-entries/${id}/post`, {});
      toast.success('Asiento contabilizado exitosamente');
      fetchEntries();
    } catch (error: any) {
      toast.error('Error al contabilizar asiento', {
        description: error.message,
      });
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();
    return (
      entry.entryNumber.toLowerCase().includes(searchLower) ||
      entry.description.toLowerCase().includes(searchLower) ||
      entry.reference?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate stats
  const stats = {
    total: entries.length,
    draft: entries.filter((e) => e.status === 'DRAFT').length,
    posted: entries.filter((e) => e.status === 'POSTED').length,
    void: entries.filter((e) => e.status === 'VOID').length,
    totalDebit: entries
      .filter((e) => e.status === 'POSTED')
      .reduce((sum, e) => sum + Number(e.totalDebit), 0),
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Asientos Contables</h1>
          <p className="text-gray-600 mt-1">
            Registro y gestión de asientos contables
          </p>
        </div>
        <Link href="/accounting/journal-entries/create">
          <Button className="bg-primary hover:bg-primary-600">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Asiento
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Asientos</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Borradores</p>
              <p className="text-2xl font-bold">{stats.draft}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contabilizados</p>
              <p className="text-2xl font-bold">{stats.posted}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monto Total</p>
              <p className="text-xl font-bold">
                RD${stats.totalDebit.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por número, descripción o referencia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="ALL">Todos los estados</option>
              <option value="DRAFT">Borradores</option>
              <option value="POSTED">Contabilizados</option>
              <option value="VOID">Anulados</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Fecha inicio"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Fecha fin"
            />
          </div>
          <div className="md:col-span-1">
            <Button onClick={fetchEntries} className="w-full">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descripción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Cargando asientos...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron asientos
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const StatusIcon = statusIcons[entry.status];
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{entry.entryNumber}</div>
                        {entry.reference && (
                          <div className="text-xs text-gray-500">Ref: {entry.reference}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(entry.entryDate).toLocaleDateString('es-DO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {entryTypeLabels[entry.entryType]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{entry.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {entry.lines.length} línea(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-blue-600">
                          RD${Number(entry.totalDebit).toLocaleString('es-DO', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[entry.status]}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusLabels[entry.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <Link href={`/accounting/journal-entries/${entry.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {entry.status === 'DRAFT' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePost(entry.id, entry.entryNumber)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
