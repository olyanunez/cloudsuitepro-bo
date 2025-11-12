'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiGet } from '@/lib/services/apiService';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface BalanceSheetAccount {
  code: string;
  name: string;
  balance: number;
  level: number;
  isGroup: boolean;
  children?: BalanceSheetAccount[];
}

interface BalanceSheetData {
  reportDate: string;
  assets: {
    current: BalanceSheetAccount[];
    nonCurrent: BalanceSheetAccount[];
    other: BalanceSheetAccount[];
    total: number;
  };
  liabilities: {
    current: BalanceSheetAccount[];
    nonCurrent: BalanceSheetAccount[];
    other: BalanceSheetAccount[];
    total: number;
  };
  equity: {
    accounts: BalanceSheetAccount[];
    total: number;
  };
  totalAssetsLiabilitiesEquity: number;
}

export default function BalanceSheetPage() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchBalanceSheet();
  }, []);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiGet<BalanceSheetData>(
        `/accounting/reports/balance-sheet?${params}`
      );
      setData(response);
    } catch (error: any) {
      toast.error('Error al cargar balance general', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderAccount = (account: BalanceSheetAccount, depth: number = 0) => {
    const indent = depth * 24;
    const isBold = account.isGroup || depth === 0;

    return (
      <div key={account.code}>
        <div
          className={`flex justify-between items-center py-2 ${
            depth > 0 ? 'border-b border-gray-100' : 'border-b-2 border-gray-300'
          }`}
          style={{ paddingLeft: `${indent}px` }}
        >
          <div className={isBold ? 'font-bold' : ''}>
            <span className="text-sm text-gray-600 mr-2">{account.code}</span>
            <span>{account.name}</span>
          </div>
          {!account.isGroup && (
            <div className={`text-right ${isBold ? 'font-bold' : ''}`}>
              RD${Number(account.balance).toLocaleString('es-DO', {
                minimumFractionDigits: 2,
              })}
            </div>
          )}
        </div>
        {account.children?.map((child) => renderAccount(child, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Balance General</h1>
            <p className="text-gray-600 mt-1">
              Estado de Situación Financiera al{' '}
              {new Date(data.reportDate).toLocaleDateString('es-DO')}
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label>Fecha Inicio</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Fecha Fin</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <Button onClick={fetchBalanceSheet} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Activos</p>
              <p className="text-2xl font-bold text-blue-600">
                RD${data.assets.total.toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pasivos</p>
              <p className="text-2xl font-bold text-red-600">
                RD${data.liabilities.total.toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Patrimonio</p>
              <p className="text-2xl font-bold text-purple-600">
                RD${data.equity.total.toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Balance Sheet Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-blue-600">ACTIVOS</h2>
          </div>

          {/* Current Assets */}
          {data.assets.current.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Activos Corrientes</h3>
              {data.assets.current.map((account) => renderAccount(account))}
            </div>
          )}

          {/* Non-Current Assets */}
          {data.assets.nonCurrent.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Activos No Corrientes</h3>
              {data.assets.nonCurrent.map((account) => renderAccount(account))}
            </div>
          )}

          {/* Other Assets */}
          {data.assets.other.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Otros Activos</h3>
              {data.assets.other.map((account) => renderAccount(account))}
            </div>
          )}

          {/* Total Assets */}
          <div className="pt-4 border-t-2 border-blue-600">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">TOTAL ACTIVOS</span>
              <span className="font-bold text-xl text-blue-600">
                RD${data.assets.total.toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </Card>

        {/* Liabilities & Equity */}
        <div className="space-y-6">
          {/* Liabilities */}
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-red-600">PASIVOS</h2>
            </div>

            {/* Current Liabilities */}
            {data.liabilities.current.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Pasivos Corrientes</h3>
                {data.liabilities.current.map((account) => renderAccount(account))}
              </div>
            )}

            {/* Non-Current Liabilities */}
            {data.liabilities.nonCurrent.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Pasivos No Corrientes</h3>
                {data.liabilities.nonCurrent.map((account) => renderAccount(account))}
              </div>
            )}

            {/* Other Liabilities */}
            {data.liabilities.other.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Otros Pasivos</h3>
                {data.liabilities.other.map((account) => renderAccount(account))}
              </div>
            )}

            {/* Total Liabilities */}
            <div className="pt-4 border-t-2 border-red-600">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">TOTAL PASIVOS</span>
                <span className="font-bold text-xl text-red-600">
                  RD${data.liabilities.total.toLocaleString('es-DO', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </Card>

          {/* Equity */}
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-purple-600">PATRIMONIO</h2>
            </div>

            {data.equity.accounts.map((account) => renderAccount(account))}

            {/* Total Equity */}
            <div className="pt-4 border-t-2 border-purple-600">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">TOTAL PATRIMONIO</span>
                <span className="font-bold text-xl text-purple-600">
                  RD${data.equity.total.toLocaleString('es-DO', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Total Liabilities + Equity */}
            <div className="pt-4 mt-4 border-t-2 border-gray-800">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">TOTAL PASIVOS + PATRIMONIO</span>
                <span className="font-bold text-xl">
                  RD${(data.liabilities.total + data.equity.total).toLocaleString('es-DO', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Equation Verification */}
      <Card className="p-6 mt-6">
        <div className="text-center">
          <h3 className="font-bold text-lg mb-2">Ecuación Contable</h3>
          <div className="text-xl">
            <span className="font-bold text-blue-600">
              Activos (RD${data.assets.total.toLocaleString('es-DO')})
            </span>
            {' = '}
            <span className="font-bold text-red-600">
              Pasivos (RD${data.liabilities.total.toLocaleString('es-DO')})
            </span>
            {' + '}
            <span className="font-bold text-purple-600">
              Patrimonio (RD${data.equity.total.toLocaleString('es-DO')})
            </span>
          </div>
          <div className="mt-2">
            {Math.abs(data.assets.total - (data.liabilities.total + data.equity.total)) < 0.01 ? (
              <span className="text-green-600 font-bold">✓ Balance Cuadrado</span>
            ) : (
              <span className="text-red-600 font-bold">
                ⚠ Diferencia: RD$
                {Math.abs(data.assets.total - (data.liabilities.total + data.equity.total)).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
