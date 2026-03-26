'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiGet } from '@/lib/services/apiService';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [exportingPDF, setExportingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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

  const exportToPDF = () => {
    if (!data) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      setExportingPDF(true);
      toast.info('Generando PDF...');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      // Función para formatear montos
      const formatAmount = (amount: number): string => {
        return `RD$${amount.toLocaleString('es-DO', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      };

      // Título
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ESTADO DE RESULTADOS', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const dateRange = `Del ${new Date(data.startDate).toLocaleDateString('es-DO')} al ${new Date(data.endDate).toLocaleDateString('es-DO')}`;
      pdf.text(dateRange, pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 15;

      // Función recursiva para agregar cuentas
      const addAccountRows = (accounts: IncomeStatementAccount[], rows: any[], indent: number = 0) => {
        accounts.forEach(account => {
          const indentText = '  '.repeat(indent);
          const style = account.isGroup ? 'bold' : 'normal';

          rows.push([
            { content: `${indentText}${account.code}`, styles: { fontStyle: style } },
            { content: `${indentText}${account.name}`, styles: { fontStyle: style } },
            { content: account.isGroup ? '' : formatAmount(account.balance), styles: { fontStyle: style, halign: 'right' } }
          ]);

          if (account.children && account.children.length > 0) {
            addAccountRows(account.children, rows, indent + 1);
          }
        });
      };

      // INGRESOS
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(22, 163, 74); // green-600
      pdf.text('INGRESOS', 14, yPosition);
      yPosition += 8;
      pdf.setTextColor(0, 0, 0);

      // Ingresos Operacionales
      if (data.income.operating.length > 0) {
        const incomeRows: any[] = [];
        addAccountRows(data.income.operating, incomeRows);

        autoTable(pdf, {
          startY: yPosition,
          head: [['Código', 'Cuenta', 'Monto']],
          body: incomeRows,
          theme: 'plain',
          styles: { fontSize: 9, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 100 },
            2: { cellWidth: 50, halign: 'right' }
          },
          didDrawPage: (data) => {
            yPosition = data.cursor?.y || yPosition;
          }
        });
      }

      // Ingresos No Operacionales
      if (data.income.nonOperating.length > 0) {
        yPosition += 5;
        const nonOpIncomeRows: any[] = [];
        addAccountRows(data.income.nonOperating, nonOpIncomeRows);

        autoTable(pdf, {
          startY: yPosition,
          body: nonOpIncomeRows,
          theme: 'plain',
          styles: { fontSize: 9, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 100 },
            2: { cellWidth: 50, halign: 'right' }
          },
          didDrawPage: (data) => {
            yPosition = data.cursor?.y || yPosition;
          }
        });
      }

      // Total Ingresos
      yPosition += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('TOTAL INGRESOS', 14, yPosition);
      pdf.text(formatAmount(data.income.total), pageWidth - 14, yPosition, { align: 'right' });
      pdf.setDrawColor(22, 163, 74);
      pdf.line(14, yPosition + 1, pageWidth - 14, yPosition + 1);

      yPosition += 10;

      // GASTOS
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(220, 38, 38); // red-600
      pdf.text('GASTOS', 14, yPosition);
      yPosition += 8;
      pdf.setTextColor(0, 0, 0);

      // Gastos Operacionales
      if (data.expenses.operating.length > 0) {
        const expenseRows: any[] = [];
        addAccountRows(data.expenses.operating, expenseRows);

        autoTable(pdf, {
          startY: yPosition,
          body: expenseRows,
          theme: 'plain',
          styles: { fontSize: 9, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 100 },
            2: { cellWidth: 50, halign: 'right' }
          },
          didDrawPage: (data) => {
            yPosition = data.cursor?.y || yPosition;
          }
        });
      }

      // Gastos No Operacionales
      if (data.expenses.nonOperating.length > 0) {
        yPosition += 5;
        const nonOpExpenseRows: any[] = [];
        addAccountRows(data.expenses.nonOperating, nonOpExpenseRows);

        autoTable(pdf, {
          startY: yPosition,
          body: nonOpExpenseRows,
          theme: 'plain',
          styles: { fontSize: 9, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 100 },
            2: { cellWidth: 50, halign: 'right' }
          },
          didDrawPage: (data) => {
            yPosition = data.cursor?.y || yPosition;
          }
        });
      }

      // Total Gastos
      yPosition += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('TOTAL GASTOS', 14, yPosition);
      pdf.text(formatAmount(data.expenses.total), pageWidth - 14, yPosition, { align: 'right' });
      pdf.setDrawColor(220, 38, 38);
      pdf.line(14, yPosition + 1, pageWidth - 14, yPosition + 1);

      yPosition += 15;

      // Resultados Finales
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Utilidad Bruta', 14, yPosition);
      pdf.text(formatAmount(data.grossProfit), pageWidth - 14, yPosition, { align: 'right' });

      yPosition += 8;
      pdf.text('Resultado Operativo', 14, yPosition);
      pdf.text(formatAmount(data.operatingIncome), pageWidth - 14, yPosition, { align: 'right' });

      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setDrawColor(0, 0, 0);
      pdf.line(14, yPosition - 2, pageWidth - 14, yPosition - 2);
      pdf.text('UTILIDAD NETA', 14, yPosition);
      const netIncomeColor = data.netIncome >= 0 ? [22, 163, 74] : [220, 38, 38];
      pdf.setTextColor(netIncomeColor[0], netIncomeColor[1], netIncomeColor[2]);
      pdf.text(formatAmount(data.netIncome), pageWidth - 14, yPosition, { align: 'right' });
      pdf.setTextColor(0, 0, 0);

      // Análisis de Márgenes
      yPosition += 15;
      pdf.setFontSize(11);
      pdf.text('Análisis de Márgenes', 14, yPosition);
      yPosition += 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const grossMargin = data.income.total > 0 ? ((data.grossProfit / data.income.total) * 100).toFixed(2) : '0.00';
      const netMargin = data.income.total > 0 ? ((data.netIncome / data.income.total) * 100).toFixed(2) : '0.00';
      pdf.text(`Margen Bruto: ${grossMargin}%`, 14, yPosition);
      pdf.text(`Margen Neto: ${netMargin}%`, 70, yPosition);

      // Generar archivo
      const filename = `Estado_de_Resultados_${startDate}_${endDate}.pdf`;
      pdf.save(filename);

      toast.success('PDF exportado exitosamente');
    } catch (error: any) {
      console.error('Error al exportar PDF:', error);
      toast.error('Error al exportar PDF', {
        description: error.message,
      });
    } finally {
      setExportingPDF(false);
    }
  };

  const renderAccount = (account: IncomeStatementAccount, depth: number = 0) => {
    const indent = depth * 16;
    const isBold = account.isGroup || depth === 0;

    return (
      <div key={account.code}>
        <div
          className={`flex justify-between items-center py-1.5 sm:py-2 ${
            depth > 0 ? 'border-b border-gray-100' : 'border-b-2 border-gray-300'
          }`}
          style={{ paddingLeft: `${indent}px` }}
        >
          <div className={`min-w-0 flex-1 ${isBold ? 'font-bold' : ''}`}>
            <span className="text-xs sm:text-sm text-gray-600 mr-1 sm:mr-2">{account.code}</span>
            <span className="text-sm sm:text-base">{account.name}</span>
          </div>
          {!account.isGroup && (
            <div className={`text-right text-sm sm:text-base flex-shrink-0 ml-2 ${isBold ? 'font-bold' : ''}`}>
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
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Estado de Resultados</h1>
            {data && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Del {new Date(data.startDate).toLocaleDateString('es-DO')} al{' '}
                {new Date(data.endDate).toLocaleDateString('es-DO')}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={exportToPDF}
            disabled={!data || exportingPDF}
            className="h-8 text-xs sm:h-9 sm:text-sm w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {exportingPDF ? 'Generando...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 items-end">
          <div>
            <Label className="text-xs sm:text-sm">
              Fecha Inicio <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="h-8 sm:h-9 text-xs sm:text-sm"
            />
          </div>
          <div>
            <Label className="text-xs sm:text-sm">
              Fecha Fin <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="h-8 sm:h-9 text-xs sm:text-sm"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Button onClick={fetchIncomeStatement} className="w-full h-8 sm:h-9 text-xs sm:text-sm" disabled={loading}>
              <Calendar className="h-4 w-4 mr-2" />
              {loading ? 'Cargando...' : 'Generar Reporte'}
            </Button>
          </div>
        </div>
      </Card>

      {data && (
        <div ref={reportRef} data-pdf-export>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Ingresos</p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-green-600 truncate">
                    RD${data.income.total.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Gastos</p>
                  <p className="text-base sm:text-xl lg:text-2xl font-bold text-red-600 truncate">
                    RD${data.expenses.total.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="bg-red-100 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
                  <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Resultado Operativo</p>
                  <p className={`text-base sm:text-xl lg:text-2xl font-bold truncate ${data.operatingIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    RD${data.operatingIncome.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className={`${data.operatingIncome >= 0 ? 'bg-blue-100' : 'bg-red-100'} p-2 sm:p-3 rounded-full flex-shrink-0 ml-2`}>
                  <DollarSign className={`h-4 w-4 sm:h-6 sm:w-6 ${data.operatingIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Utilidad Neta</p>
                  <p className={`text-base sm:text-xl lg:text-2xl font-bold truncate ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    RD${data.netIncome.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className={`${data.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'} p-2 sm:p-3 rounded-full flex-shrink-0 ml-2`}>
                  <DollarSign className={`h-4 w-4 sm:h-6 sm:w-6 ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </Card>
          </div>

          {/* Income Statement Report */}
          <Card className="p-4 sm:p-6">
            {/* Income Section */}
            <div className="mb-6 sm:mb-8">
              <div className="mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-green-600">INGRESOS</h2>
              </div>

              {/* Operating Income */}
              {data.income.operating.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-bold text-base sm:text-lg mb-2">Ingresos Operacionales</h3>
                  {data.income.operating.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Non-Operating Income */}
              {data.income.nonOperating.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-bold text-base sm:text-lg mb-2">Ingresos No Operacionales</h3>
                  {data.income.nonOperating.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Other Income */}
              {data.income.other.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-bold text-base sm:text-lg mb-2">Otros Ingresos</h3>
                  {data.income.other.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Total Income */}
              <div className="pt-3 sm:pt-4 border-t-2 border-green-600">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm sm:text-lg">TOTAL INGRESOS</span>
                  <span className="font-bold text-base sm:text-xl text-green-600">
                    RD${data.income.total.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div className="mb-6 sm:mb-8">
              <div className="mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-red-600">GASTOS</h2>
              </div>

              {/* Operating Expenses */}
              {data.expenses.operating.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-bold text-base sm:text-lg mb-2">Gastos Operacionales</h3>
                  {data.expenses.operating.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Non-Operating Expenses */}
              {data.expenses.nonOperating.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-bold text-base sm:text-lg mb-2">Gastos No Operacionales</h3>
                  {data.expenses.nonOperating.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Other Expenses */}
              {data.expenses.other.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-bold text-base sm:text-lg mb-2">Otros Gastos</h3>
                  {data.expenses.other.map((account) => renderAccount(account))}
                </div>
              )}

              {/* Total Expenses */}
              <div className="pt-3 sm:pt-4 border-t-2 border-red-600">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm sm:text-lg">TOTAL GASTOS</span>
                  <span className="font-bold text-base sm:text-xl text-red-600">
                    RD${data.expenses.total.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className="pt-4 sm:pt-6 border-t-4 border-gray-800">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm sm:text-lg">Utilidad Bruta</span>
                  <span className="font-bold text-base sm:text-xl">
                    RD${data.grossProfit.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm sm:text-lg">Resultado Operativo</span>
                  <span className={`font-bold text-base sm:text-xl ${data.operatingIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    RD${data.operatingIncome.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t-2">
                  <span className="font-bold text-lg sm:text-2xl">UTILIDAD NETA</span>
                  <span className={`font-bold text-lg sm:text-2xl ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    RD${data.netIncome.toLocaleString('es-DO', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Margin Analysis */}
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-sm sm:text-base mb-2">Análisis de Márgenes</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Margen Bruto</p>
                  <p className="font-bold text-sm sm:text-base">
                    {data.income.total > 0
                      ? ((data.grossProfit / data.income.total) * 100).toFixed(2)
                      : 0}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Margen Neto</p>
                  <p className="font-bold text-sm sm:text-base">
                    {data.income.total > 0
                      ? ((data.netIncome / data.income.total) * 100).toFixed(2)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {!data && !loading && (
        <Card className="p-8 sm:p-12">
          <div className="text-center text-gray-500">
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
            <p className="text-sm sm:text-base">Seleccione un rango de fechas y haga clic en "Generar Reporte"</p>
          </div>
        </Card>
      )}
    </div>
  );
}
