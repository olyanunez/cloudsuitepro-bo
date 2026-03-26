'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiGet } from '@/lib/services/apiService';
import { Calendar, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [exportingPDF, setExportingPDF] = useState(false);
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
      pdf.text('BALANCE GENERAL', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 8;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Estado de Situación Financiera al ${new Date(data.reportDate).toLocaleDateString('es-DO')}`,
        pageWidth / 2,
        yPosition,
        { align: 'center' }
      );

      yPosition += 15;

      // Función recursiva para agregar cuentas
      const addAccountRows = (accounts: BalanceSheetAccount[], rows: any[], indent: number = 0) => {
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

      // ACTIVOS
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235); // blue-600
      pdf.text('ACTIVOS', 14, yPosition);
      yPosition += 8;
      pdf.setTextColor(0, 0, 0);

      // Activos Corrientes
      if (data.assets.current.length > 0) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Activos Corrientes', 14, yPosition);
        yPosition += 5;

        const currentAssetRows: any[] = [];
        addAccountRows(data.assets.current, currentAssetRows);

        autoTable(pdf, {
          startY: yPosition,
          body: currentAssetRows,
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

      // Activos No Corrientes
      if (data.assets.nonCurrent.length > 0) {
        yPosition += 5;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Activos No Corrientes', 14, yPosition);
        yPosition += 5;

        const nonCurrentAssetRows: any[] = [];
        addAccountRows(data.assets.nonCurrent, nonCurrentAssetRows);

        autoTable(pdf, {
          startY: yPosition,
          body: nonCurrentAssetRows,
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

      // Total Activos
      yPosition += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('TOTAL ACTIVOS', 14, yPosition);
      pdf.text(formatAmount(data.assets.total), pageWidth - 14, yPosition, { align: 'right' });
      pdf.setDrawColor(37, 99, 235);
      pdf.line(14, yPosition + 1, pageWidth - 14, yPosition + 1);

      yPosition += 15;

      // PASIVOS
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(220, 38, 38); // red-600
      pdf.text('PASIVOS', 14, yPosition);
      yPosition += 8;
      pdf.setTextColor(0, 0, 0);

      // Pasivos Corrientes
      if (data.liabilities.current.length > 0) {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Pasivos Corrientes', 14, yPosition);
        yPosition += 5;

        const currentLiabRows: any[] = [];
        addAccountRows(data.liabilities.current, currentLiabRows);

        autoTable(pdf, {
          startY: yPosition,
          body: currentLiabRows,
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

      // Pasivos No Corrientes
      if (data.liabilities.nonCurrent.length > 0) {
        yPosition += 5;
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Pasivos No Corrientes', 14, yPosition);
        yPosition += 5;

        const nonCurrentLiabRows: any[] = [];
        addAccountRows(data.liabilities.nonCurrent, nonCurrentLiabRows);

        autoTable(pdf, {
          startY: yPosition,
          body: nonCurrentLiabRows,
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

      // Total Pasivos
      yPosition += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('TOTAL PASIVOS', 14, yPosition);
      pdf.text(formatAmount(data.liabilities.total), pageWidth - 14, yPosition, { align: 'right' });
      pdf.setDrawColor(220, 38, 38);
      pdf.line(14, yPosition + 1, pageWidth - 14, yPosition + 1);

      yPosition += 15;

      // PATRIMONIO
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(147, 51, 234); // purple-600
      pdf.text('PATRIMONIO', 14, yPosition);
      yPosition += 8;
      pdf.setTextColor(0, 0, 0);

      const equityRows: any[] = [];
      addAccountRows(data.equity.accounts, equityRows);

      autoTable(pdf, {
        startY: yPosition,
        body: equityRows,
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

      // Total Patrimonio
      yPosition += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('TOTAL PATRIMONIO', 14, yPosition);
      pdf.text(formatAmount(data.equity.total), pageWidth - 14, yPosition, { align: 'right' });
      pdf.setDrawColor(147, 51, 234);
      pdf.line(14, yPosition + 1, pageWidth - 14, yPosition + 1);

      yPosition += 10;

      // Total Pasivos + Patrimonio
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setDrawColor(0, 0, 0);
      pdf.line(14, yPosition - 2, pageWidth - 14, yPosition - 2);
      pdf.text('TOTAL PASIVOS + PATRIMONIO', 14, yPosition);
      pdf.text(formatAmount(data.liabilities.total + data.equity.total), pageWidth - 14, yPosition, { align: 'right' });

      yPosition += 15;

      // Ecuación Contable
      pdf.setFontSize(11);
      pdf.text('Ecuación Contable:', 14, yPosition);
      yPosition += 6;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const isBalanced = Math.abs(data.assets.total - (data.liabilities.total + data.equity.total)) < 0.01;
      if (isBalanced) {
        pdf.setTextColor(22, 163, 74); // green
        pdf.text('✓ Balance Cuadrado', 14, yPosition);
      } else {
        pdf.setTextColor(220, 38, 38); // red
        const diff = Math.abs(data.assets.total - (data.liabilities.total + data.equity.total)).toFixed(2);
        pdf.text(`⚠ Diferencia: RD$${diff}`, 14, yPosition);
      }

      // Generar archivo
      const filename = `Balance_General_${new Date(data.reportDate).toISOString().split('T')[0]}.pdf`;
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

  const renderAccount = (account: BalanceSheetAccount, depth: number = 0) => {
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
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Balance General</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Estado de Situación Financiera al{' '}
              {new Date(data.reportDate).toLocaleDateString('es-DO')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            disabled={!data || exportingPDF}
            className="self-end sm:self-auto"
          >
            <Download className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">{exportingPDF ? 'Generando...' : 'Exportar PDF'}</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 items-end">
          <div>
            <Label className="text-xs sm:text-sm">Fecha Inicio</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs sm:text-sm">Fecha Fin</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Button onClick={fetchBalanceSheet} className="w-full" size="sm">
              <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Generar Reporte</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Card className="p-3 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Activos</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600 truncate">
                RD${data.assets.total.toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Pasivos</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 truncate">
                RD${data.liabilities.total.toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-red-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Patrimonio</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600 truncate">
                RD${data.equity.total.toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex-shrink-0">
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Balance Sheet Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Assets */}
        <Card className="p-4 sm:p-6">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-blue-600">ACTIVOS</h2>
          </div>

          {/* Current Assets */}
          {data.assets.current.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg mb-2">Activos Corrientes</h3>
              {data.assets.current.map((account) => renderAccount(account))}
            </div>
          )}

          {/* Non-Current Assets */}
          {data.assets.nonCurrent.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg mb-2">Activos No Corrientes</h3>
              {data.assets.nonCurrent.map((account) => renderAccount(account))}
            </div>
          )}

          {/* Other Assets */}
          {data.assets.other.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="font-bold text-base sm:text-lg mb-2">Otros Activos</h3>
              {data.assets.other.map((account) => renderAccount(account))}
            </div>
          )}

          {/* Total Assets */}
          <div className="pt-3 sm:pt-4 border-t-2 border-blue-600">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm sm:text-lg">TOTAL ACTIVOS</span>
              <span className="font-bold text-base sm:text-xl text-blue-600">
                RD${data.assets.total.toLocaleString('es-DO', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </Card>

        {/* Liabilities & Equity */}
        <div className="space-y-4 sm:space-y-6">
          {/* Liabilities */}
          <Card className="p-4 sm:p-6">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-red-600">PASIVOS</h2>
            </div>

            {/* Current Liabilities */}
            {data.liabilities.current.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="font-bold text-base sm:text-lg mb-2">Pasivos Corrientes</h3>
                {data.liabilities.current.map((account) => renderAccount(account))}
              </div>
            )}

            {/* Non-Current Liabilities */}
            {data.liabilities.nonCurrent.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="font-bold text-base sm:text-lg mb-2">Pasivos No Corrientes</h3>
                {data.liabilities.nonCurrent.map((account) => renderAccount(account))}
              </div>
            )}

            {/* Other Liabilities */}
            {data.liabilities.other.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="font-bold text-base sm:text-lg mb-2">Otros Pasivos</h3>
                {data.liabilities.other.map((account) => renderAccount(account))}
              </div>
            )}

            {/* Total Liabilities */}
            <div className="pt-3 sm:pt-4 border-t-2 border-red-600">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm sm:text-lg">TOTAL PASIVOS</span>
                <span className="font-bold text-base sm:text-xl text-red-600">
                  RD${data.liabilities.total.toLocaleString('es-DO', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </Card>

          {/* Equity */}
          <Card className="p-4 sm:p-6">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-purple-600">PATRIMONIO</h2>
            </div>

            {data.equity.accounts.map((account) => renderAccount(account))}

            {/* Total Equity */}
            <div className="pt-3 sm:pt-4 border-t-2 border-purple-600">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm sm:text-lg">TOTAL PATRIMONIO</span>
                <span className="font-bold text-base sm:text-xl text-purple-600">
                  RD${data.equity.total.toLocaleString('es-DO', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Total Liabilities + Equity */}
            <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t-2 border-gray-800">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm sm:text-lg">TOTAL PASIVOS + PATRIMONIO</span>
                <span className="font-bold text-base sm:text-xl">
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
      <Card className="p-4 sm:p-6 mt-4 sm:mt-6">
        <div className="text-center">
          <h3 className="font-bold text-base sm:text-lg mb-2">Ecuación Contable</h3>
          <div className="text-sm sm:text-xl flex flex-col sm:flex-row sm:justify-center sm:items-center gap-1 sm:gap-0">
            <span className="font-bold text-blue-600">
              Activos (RD${data.assets.total.toLocaleString('es-DO')})
            </span>
            <span className="hidden sm:inline">{' = '}</span>
            <span className="sm:hidden text-gray-500">=</span>
            <span className="font-bold text-red-600">
              Pasivos (RD${data.liabilities.total.toLocaleString('es-DO')})
            </span>
            <span className="hidden sm:inline">{' + '}</span>
            <span className="sm:hidden text-gray-500">+</span>
            <span className="font-bold text-purple-600">
              Patrimonio (RD${data.equity.total.toLocaleString('es-DO')})
            </span>
          </div>
          <div className="mt-2">
            {Math.abs(data.assets.total - (data.liabilities.total + data.equity.total)) < 0.01 ? (
              <span className="text-green-600 font-bold text-sm sm:text-base">✓ Balance Cuadrado</span>
            ) : (
              <span className="text-red-600 font-bold text-sm sm:text-base">
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
