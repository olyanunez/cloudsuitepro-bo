'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiGet } from '@/lib/services/apiService';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface IncomeStatementAccount {
  code: string;
  name: string;
  balance: number;
  level: number;
  isGroup: boolean;
  children?: IncomeStatementAccount[];
}

interface IncomeStatementData {
  startDate: string;
  endDate: string;
  income: {
    operating: IncomeStatementAccount[];
    nonOperating: IncomeStatementAccount[];
    other: IncomeStatementAccount[];
    total: number;
  };
  expenses: {
    operating: IncomeStatementAccount[];
    nonOperating: IncomeStatementAccount[];
    other: IncomeStatementAccount[];
    total: number;
  };
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
}

export default function IncomeStatementPage() {
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [loading, setLoading] = useState(false);

  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(lastDay.toISOString().split('T')[0]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchIncomeStatement();
    }
  }, []);

  const fetchIncomeStatement = async () => {
    if (!startDate || !endDate) {
      toast.error('Las fechas de inicio y fin son requeridas');
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await apiGet<IncomeStatementData>(
        `/accounting/reports/income-statement?${params}`
      );
      setData(response);
    } catch (error: any) {
      toast.error('Error al cargar estado de resultados', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderAccount = (account: IncomeStatementAccount, depth: number = 0) => {
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Estado de Resultados</h1>
            {data && (
              <p className="text-gray-600 mt-1">
                Del {new Date(data.startDate).toLocaleDateString('es-DO')} al{' '}
                {new Date(data.endDate).toLocaleDateString('es-DO')}
              </p>
            )}
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
            <Label>
              Fecha Inicio <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>
              Fecha Fin <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Button onClick={fetchIncomeStatement} className="w-full" disabled={loading}>
              <Calendar className="h-4 w-4 mr-2" />
              {loading ? 'Cargando...' : 'Generar Reporte'}
            </Button>
          </div>
        </div>
      </Card>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Ingresos</p>
                  <p className="text-2xl font-bold text-green-600">
                    RD${data.income.total.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Gastos</p>
                  <p className="text-2xl font-bold text-red-600">
                    RD${data.expenses.total.toLocaleString('es-DO', {
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
                  <p className="text-sm text-gray-600 mb-1">Resultado Operativo</p>
                  <p className={`text-2xl font-bold ${data.operatingIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    RD${data.operatingIncome.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className={`${data.operatingIncome >= 0 ? 'bg-blue-100' : 'bg-red-100'} p-3 rounded-full`}>
                  <DollarSign className={`h-6 w-6 ${data.operatingIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Utilidad Neta</p>
                  <p className={`text-2xl font-bold ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    RD${data.netIncome.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className={`${data.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-full`}>
                  <DollarSign className={`h-6 w-6 ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </Card>
          </div>

          {/* Income Statement Report */}
          <Card className="p-6">
            {/* Income Section */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-green-600">INGRESOS</h2>
              </div>

              {/* Operating Income */}
              {data.income.operating.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2">Ingresos Operacionales</h3>
                  {data.income.operating.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Non-Operating Income */}
              {data.income.nonOperating.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2">Ingresos No Operacionales</h3>
                  {data.income.nonOperating.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Other Income */}
              {data.income.other.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2">Otros Ingresos</h3>
                  {data.income.other.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Total Income */}
              <div className="pt-4 border-t-2 border-green-600">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">TOTAL INGRESOS</span>
                  <span className="font-bold text-xl text-green-600">
                    RD${data.income.total.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-red-600">GASTOS</h2>
              </div>

              {/* Operating Expenses */}
              {data.expenses.operating.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2">Gastos Operacionales</h3>
                  {data.expenses.operating.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Non-Operating Expenses */}
              {data.expenses.nonOperating.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2">Gastos No Operacionales</h3>
                  {data.expenses.nonOperating.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Other Expenses */}
              {data.expenses.other.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-2">Otros Gastos</h3>
                  {data.expenses.other.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Total Expenses */}
              <div className="pt-4 border-t-2 border-red-600">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">TOTAL GASTOS</span>
                  <span className="font-bold text-xl text-red-600">
                    RD${data.expenses.total.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className="pt-6 border-t-4 border-gray-800">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Utilidad Bruta</span>
                  <span className="font-bold text-xl">
                    RD${data.grossProfit.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Resultado Operativo</span>
                  <span className={`font-bold text-xl ${data.operatingIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    RD${data.operatingIncome.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2">
                  <span className="font-bold text-2xl">UTILIDAD NETA</span>
                  <span className={`font-bold text-2xl ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    RD${data.netIncome.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Margin Analysis */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold mb-2">Análisis de Márgenes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Margen Bruto</p>
                  <p className="font-bold">
                    {data.income.total > 0
                      ? ((data.grossProfit / data.income.total) * 100).toFixed(2)
                      : 0}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Margen Neto</p>
                  <p className="font-bold">
                    {data.income.total > 0
                      ? ((data.netIncome / data.income.total) * 100).toFixed(2)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {!data && !loading && (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Seleccione un rango de fechas y haga clic en "Generar Reporte"</p>
          </div>
        </Card>
      )}
    </div>
  );
}
