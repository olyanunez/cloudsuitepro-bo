'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiGet, apiPost } from '@/lib/services/apiService';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Calendar,
  AlertTriangle,
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
  postedBy?: number;
  createdAt: string;
  createdBy?: number;
  lines: {
    id: number;
    lineNumber: number;
    description?: string;
    debitAmount: number;
    creditAmount: number;
    account: {
      id: number;
      code: string;
      name: string;
    };
    branch?: {
      id: number;
      name: string;
    };
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

export default function JournalEntryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (entryId) {
      fetchEntry();
    }
  }, [entryId]);

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const data = await apiGet<JournalEntry>(
        `/accounting/journal-entries/${entryId}`
      );
      setEntry(data);
    } catch (error: any) {
      toast.error('Error al cargar asiento', {
        description: error.message,
      });
      router.push('/accounting/journal-entries');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!entry) return;

    try {
      await apiPost(`/accounting/journal-entries/${entry.id}/post`, {});
      toast.success('Asiento contabilizado exitosamente');
      setConfirmDialogOpen(false);
      fetchEntry();
    } catch (error: any) {
      toast.error('Error al contabilizar asiento', {
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Asiento no encontrado</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[entry.status];
  const isBalanced = Math.abs(Number(entry.totalDebit) - Number(entry.totalCredit)) < 0.01;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{entry.entryNumber}</h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${statusColors[entry.status]}`}
              >
                <StatusIcon className="h-4 w-4" />
                {statusLabels[entry.status]}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{entry.description}</p>
          </div>
        </div>
        {entry.status === 'DRAFT' && (
          <Button
            onClick={() => setConfirmDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Contabilizar
          </Button>
        )}
      </div>

      {/* Entry Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fecha</p>
              <p className="text-lg font-bold">
                {new Date(entry.entryDate).toLocaleDateString('es-DO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm text-gray-600">Tipo</p>
            <p className="text-lg font-bold">{entryTypeLabels[entry.entryType]}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm text-gray-600">Período Fiscal</p>
            <p className="text-lg font-bold">{entry.fiscalPeriod}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm text-gray-600">Referencia</p>
            <p className="text-lg font-bold">{entry.reference || '-'}</p>
          </div>
        </Card>
      </div>

      {/* Entry Lines */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Líneas del Asiento</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Cuenta
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Descripción
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Débito
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Crédito
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {entry.lines.map((line) => (
                <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                    {line.lineNumber}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {line.account.code} - {line.account.name}
                    </div>
                    {line.branch && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Sucursal: {line.branch.name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {line.description || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-blue-600">
                    {Number(line.debitAmount) > 0
                      ? `RD$${Number(line.debitAmount).toLocaleString('es-DO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                    {Number(line.creditAmount) > 0
                      ? `RD$${Number(line.creditAmount).toLocaleString('es-DO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700 border-t-2">
              <tr className="font-bold">
                <td colSpan={3} className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                  TOTALES:
                </td>
                <td className="px-4 py-3 text-right text-blue-600">
                  RD${Number(entry.totalDebit).toLocaleString('es-DO', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3 text-right text-green-600">
                  RD${Number(entry.totalCredit).toLocaleString('es-DO', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
              <tr>
                <td colSpan={5} className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                        isBalanced
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      <span className="font-bold">
                        {isBalanced
                          ? 'Asiento Cuadrado ✓'
                          : `Diferencia: RD$${(Number(entry.totalDebit) - Number(entry.totalCredit)).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Metadata */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Información Adicional</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Creado:</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {new Date(entry.createdAt).toLocaleString('es-DO')}
            </p>
          </div>
          {entry.postedAt && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">Contabilizado:</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(entry.postedAt).toLocaleString('es-DO')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Confirmar Contabilización
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de contabilizar el asiento <strong className="text-gray-900">{entry.entryNumber}</strong>?
              <br /><br />
              Esta acción actualizará los saldos de las cuentas y <strong>no se puede deshacer</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePost} className="!bg-green-600 hover:!bg-green-700 !text-white">
              Contabilizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
