'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { apiGet, apiPost } from '@/lib/services/apiService';
import { ArrowLeft, Save, Plus, Trash2, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  id: number;
  code: string;
  name: string;
  acceptsEntries: boolean;
}

interface JournalEntryLine {
  lineNumber: number;
  accountId: number | null;
  description: string;
  debitAmount: number;
  creditAmount: number;
}

export default function CreateJournalEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [entryType, setEntryType] = useState('MANUAL');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<JournalEntryLine[]>([
    {
      lineNumber: 1,
      accountId: null,
      description: '',
      debitAmount: 0,
      creditAmount: 0,
    },
    {
      lineNumber: 2,
      accountId: null,
      description: '',
      debitAmount: 0,
      creditAmount: 0,
    },
  ]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await apiGet<Account[]>('/accounting/accounts');
      // Solo mostrar cuentas que aceptan asientos
      setAccounts(data.filter((a) => a.acceptsEntries));
    } catch (error: any) {
      toast.error('Error al cargar cuentas', {
        description: error.message,
      });
    }
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        lineNumber: lines.length + 1,
        accountId: null,
        description: '',
        debitAmount: 0,
        creditAmount: 0,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) {
      toast.error('Debe tener al menos 2 líneas (débito y crédito)');
      return;
    }
    const newLines = lines.filter((_, i) => i !== index);
    // Renumerar las líneas
    newLines.forEach((line, i) => {
      line.lineNumber = i + 1;
    });
    setLines(newLines);
  };

  const updateLine = (
    index: number,
    field: keyof JournalEntryLine,
    value: any
  ) => {
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      [field]: value,
    };
    setLines(newLines);
  };

  const calculateTotals = () => {
    const totalDebit = lines.reduce((sum, line) => sum + line.debitAmount, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.creditAmount, 0);
    const difference = totalDebit - totalCredit;

    return { totalDebit, totalCredit, difference };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!description.trim()) {
      toast.error('La descripción es requerida');
      return;
    }

    if (lines.length < 2) {
      toast.error('Debe tener al menos 2 líneas');
      return;
    }

    // Validar que todas las líneas tengan cuenta seleccionada
    const missingAccounts = lines.filter((line) => !line.accountId);
    if (missingAccounts.length > 0) {
      toast.error('Todas las líneas deben tener una cuenta seleccionada');
      return;
    }

    // Validar que cada línea tenga solo débito O crédito
    const invalidLines = lines.filter(
      (line) =>
        (line.debitAmount > 0 && line.creditAmount > 0) ||
        (line.debitAmount === 0 && line.creditAmount === 0)
    );
    if (invalidLines.length > 0) {
      toast.error(
        'Cada línea debe tener monto en el débito O en el crédito, no ambos ni ninguno'
      );
      return;
    }

    // Validar que el asiento esté cuadrado
    const { difference } = calculateTotals();
    if (Math.abs(difference) > 0.01) {
      toast.error(
        `El asiento no está cuadrado. Diferencia: RD$${difference.toFixed(2)}`
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        entryDate,
        entryType,
        description,
        reference: reference || undefined,
        lines: lines.map((line) => ({
          accountId: line.accountId!,
          lineNumber: line.lineNumber,
          description: line.description || undefined,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
        })),
      };

      await apiPost('/accounting/journal-entries', payload);

      toast.success('Asiento creado exitosamente');
      router.push('/accounting/journal-entries');
    } catch (error: any) {
      toast.error('Error al crear asiento', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const { totalDebit, totalCredit, difference } = calculateTotals();
  const isBalanced = Math.abs(difference) < 0.01;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Asiento Contable</h1>
          <p className="text-gray-600 mt-1">Registra un nuevo asiento contable</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Header Info */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Información del Asiento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="entryDate">
                Fecha <span className="text-red-500">*</span>
              </Label>
              <Input
                id="entryDate"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="entryType">
                Tipo de Asiento <span className="text-red-500">*</span>
              </Label>
              <select
                id="entryType"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="MANUAL">Manual</option>
                <option value="SALE">Venta</option>
                <option value="PURCHASE">Compra</option>
                <option value="ADJUSTMENT">Ajuste</option>
                <option value="CLOSING">Cierre</option>
                <option value="OPENING">Apertura</option>
              </select>
            </div>

            <div>
              <Label htmlFor="reference">Referencia</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="INV-00001"
              />
            </div>

            <div className="md:col-span-3">
              <Label htmlFor="description">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
                placeholder="Descripción del asiento contable..."
                required
              />
            </div>
          </div>
        </Card>

        {/* Lines */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Líneas del Asiento</h3>
            <Button type="button" onClick={addLine} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Línea
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Cuenta <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Descripción
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Débito
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Crédito
                  </th>
                  <th className="px-4 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lines.map((line, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-500">
                      {line.lineNumber}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={line.accountId || ''}
                        onChange={(e) =>
                          updateLine(
                            index,
                            'accountId',
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                        required
                      >
                        <option value="">Seleccionar cuenta...</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={line.description}
                        onChange={(e) =>
                          updateLine(index, 'description', e.target.value)
                        }
                        className="text-sm"
                        placeholder="Descripción opcional..."
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.debitAmount || ''}
                        onChange={(e) =>
                          updateLine(index, 'debitAmount', Number(e.target.value))
                        }
                        className="text-sm text-right"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.creditAmount || ''}
                        onChange={(e) =>
                          updateLine(index, 'creditAmount', Number(e.target.value))
                        }
                        className="text-sm text-right"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      {lines.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLine(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2">
                <tr className="font-bold">
                  <td colSpan={3} className="px-4 py-3 text-right">
                    TOTALES:
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600">
                    RD${totalDebit.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">
                    RD${totalCredit.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={6} className="px-4 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        <span className="font-medium">Estado del Asiento:</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                          isBalanced
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <span className="font-bold">
                          {isBalanced ? 'Cuadrado ✓' : `Diferencia: RD$${difference.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || !isBalanced}>
            {loading ? (
              'Guardando...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Asiento
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
