'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CashExpenseService,
  CashExpenseCategoryService,
  CashExpenseCategory,
  CashExpense,
  CreateCashExpenseDto,
} from '@/lib/services/cashExpenseService';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import {
  Loader2,
  Receipt,
  Trash2,
  DollarSign,
  Plus,
  AlertCircle,
} from 'lucide-react';

interface CashExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated?: () => void;
}

export default function CashExpenseModal({
  isOpen,
  onClose,
  onExpenseCreated,
}: CashExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<CashExpense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [categories, setCategories] = useState<CashExpenseCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  // Cargar categorías y gastos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadExpenses();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await CashExpenseCategoryService.getCategories();
      setCategories(data);

      // Si no hay categorías, intentar inicializar las por defecto
      if (data.length === 0) {
        await CashExpenseCategoryService.initializeDefaults();
        const newData = await CashExpenseCategoryService.getCategories();
        setCategories(newData);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error al cargar las categorías');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const data = await CashExpenseService.getMySessionExpenses();
      setExpenses(data);
    } catch {
      // Si no hay sesión abierta, simplemente no mostrar gastos
      setExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    if (!categoryId) {
      toast.error('Seleccione una categoría');
      return;
    }

    if (!description.trim()) {
      toast.error('Ingrese una descripción del gasto');
      return;
    }

    try {
      setLoading(true);

      const data: CreateCashExpenseDto = {
        amount: parseFloat(amount),
        categoryId: parseInt(categoryId),
        description: description.trim(),
        receiptNumber: receiptNumber.trim() || undefined,
      };

      await CashExpenseService.createExpense(data);

      toast.success('Gasto registrado correctamente');

      // Limpiar formulario
      setAmount('');
      setCategoryId('');
      setDescription('');
      setReceiptNumber('');

      // Recargar lista de gastos
      await loadExpenses();

      // Notificar al padre
      onExpenseCreated?.();
    } catch (error: any) {
      console.error('Error creating expense:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo registrar el gasto';
      toast.error('Error al registrar el gasto', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId: number) => {
    try {
      await CashExpenseService.deleteExpense(expenseId);
      toast.success('Gasto eliminado');
      await loadExpenses();
      onExpenseCreated?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'No se pudo eliminar el gasto';
      toast.error('Error al eliminar el gasto', {
        description: errorMessage,
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Gastos de Caja
          </DialogTitle>
          <DialogDescription>
            Registre los retiros de efectivo para cubrir gastos del día
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Formulario de nuevo gasto */}
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Registrar Nuevo Gasto
              </h4>

              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Monto */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto (RD$)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Categoría */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={categoryId}
                      onValueChange={setCategoryId}
                      disabled={loadingCategories}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCategories ? "Cargando..." : "Seleccionar..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Describa el gasto..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Número de recibo */}
                <div className="space-y-2">
                  <Label htmlFor="receiptNumber">
                    No. Factura/Recibo (opcional)
                  </Label>
                  <Input
                    id="receiptNumber"
                    placeholder="Ej: B0100000123"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={loading || loadingCategories} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar Gasto
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Lista de gastos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Gastos del Turno</h4>
                <Badge variant="secondary" className="text-sm">
                  Total: {formatCurrency(totalExpenses)}
                </Badge>
              </div>

              {loadingExpenses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                  <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                  <p className="text-sm">No hay gastos registrados</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={expense.category.color || 'bg-gray-100 text-gray-800'}
                          >
                            {expense.category.name}
                          </Badge>
                          <span className="font-semibold">
                            {formatCurrency(expense.amount)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {expense.description}
                        </p>
                        {expense.receiptNumber && (
                          <p className="text-xs text-gray-500 mt-1">
                            Recibo: {expense.receiptNumber}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
