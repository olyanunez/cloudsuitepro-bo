'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiGet } from '@/lib/services/apiService';
import {
  ArrowLeft,
  Edit,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

interface JournalEntryLine {
  id: number;
  lineNumber: number;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  createdAt: string;
  journalEntry: {
    id: number;
    entryNumber: string;
    entryDate: string;
    description: string;
    status: string;
  };
}

interface Account {
  id: number;
  code: string;
  name: string;
  description?: string;
  accountType: string;
  accountSubtype?: string;
  nature: string;
  parentId?: number;
  level: number;
  isGroup: boolean;
  acceptsEntries: boolean;
  isActive: boolean;
  isSystem: boolean;
  debitBalance: number;
  creditBalance: number;
  balance: number;
  parent?: {
    id: number;
    code: string;
    name: string;
  };
  children?: Account[];
}

const accountTypeLabels: Record<string, string> = {
  ASSET: 'Activo',
  LIABILITY: 'Pasivo',
  EQUITY: 'Patrimonio',
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
};

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [movements, setMovements] = useState<JournalEntryLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (accountId) {
      fetchAccountDetail();
      fetchGeneralLedger();
    }
  }, [accountId]);

  const fetchAccountDetail = async () => {
    try {
      const data = await apiGet<Account>(`/accounting/accounts/${accountId}`);
      setAccount(data);
    } catch (error: any) {
      toast.error('Error al cargar cuenta', {
        description: error.message,
      });
    }
  };

  const fetchGeneralLedger = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiGet<{ account: Account; lines: JournalEntryLine[] }>(
        `/accounting/reports/general-ledger/${accountId}?${params}`
      );
      setMovements(response.lines);
    } catch (error: any) {
      toast.error('Error al cargar movimientos', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchGeneralLedger();
  };

  if (!account) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // Calculate running balance
  let runningBalance = 0;
  const movementsWithBalance = movements.map((line) => {
    runningBalance += Number(line.debitAmount) - Number(line.creditAmount);
    return {
      ...line,
      runningBalance,
    };
  });

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
              <h1 className="text-3xl font-bold">{account.code}</h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  account.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {account.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <h2 className="text-xl text-gray-600 mt-1">{account.name}</h2>
            {account.description && (
              <p className="text-sm text-gray-500 mt-1">{account.description}</p>
            )}
          </div>
        </div>
        {!account.isSystem && (
          <Link href={`/accounting/accounts/edit/${account.id}`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        )}
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tipo de Cuenta</p>
              <p className="text-lg font-bold">{accountTypeLabels[account.accountType]}</p>
              {account.accountSubtype && (
                <p className="text-xs text-gray-500">{account.accountSubtype}</p>
              )}
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Débito</p>
              <p className="text-lg font-bold text-blue-600">
                RD${Number(account.debitBalance).toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Crédito</p>
              <p className="text-lg font-bold text-green-600">
                RD${Number(account.creditBalance).toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saldo Final</p>
              <p
                className={`text-lg font-bold ${
                  Number(account.balance) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                RD${Number(account.balance).toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Account Properties */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-bold mb-4">Propiedades de la Cuenta</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Naturaleza</p>
            <p className="font-medium">
              {account.nature === 'DEBIT' ? 'Deudora' : 'Acreedora'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Nivel</p>
            <p className="font-medium">Nivel {account.level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tipo</p>
            <p className="font-medium">
              {account.isGroup ? 'Cuenta de Agrupación' : 'Cuenta de Detalle'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Acepta Asientos</p>
            <p className="font-medium">{account.acceptsEntries ? 'Sí' : 'No'}</p>
          </div>
          {account.parent && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Cuenta Padre</p>
              <Link
                href={`/accounting/accounts/${account.parent.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {account.parent.code} - {account.parent.name}
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* General Ledger (Mayor General) */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Mayor General</h3>
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
              placeholder="Fecha inicio"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
              placeholder="Fecha fin"
            />
            <Button onClick={handleFilter}>
              <Calendar className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Asiento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descripción
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Débito
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Crédito
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Cargando movimientos...
                  </td>
                </tr>
              ) : movementsWithBalance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay movimientos registrados
                  </td>
                </tr>
              ) : (
                movementsWithBalance.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {new Date(line.journalEntry.entryDate).toLocaleDateString('es-DO')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/accounting/journal-entries/${line.journalEntry.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {line.journalEntry.entryNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>{line.journalEntry.description}</div>
                      {line.description && (
                        <div className="text-xs text-gray-500">{line.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-blue-600">
                      {Number(line.debitAmount) > 0
                        ? `RD$${Number(line.debitAmount).toLocaleString('es-DO', {
                            minimumFractionDigits: 2,
                          })}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                      {Number(line.creditAmount) > 0
                        ? `RD$${Number(line.creditAmount).toLocaleString('es-DO', {
                            minimumFractionDigits: 2,
                          })}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold">
                      RD${line.runningBalance.toLocaleString('es-DO', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {movementsWithBalance.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2">
                <tr className="font-bold">
                  <td colSpan={3} className="px-4 py-3 text-right">
                    TOTALES:
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600">
                    RD${movements
                      .reduce((sum, line) => sum + Number(line.debitAmount), 0)
                      .toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">
                    RD${movements
                      .reduce((sum, line) => sum + Number(line.creditAmount), 0)
                      .toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    RD${Number(account.balance).toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
}
