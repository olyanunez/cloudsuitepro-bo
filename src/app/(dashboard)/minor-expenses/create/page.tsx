'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ExpenseCategory,
    PaymentMethod,
    expenseCategoryLabels,
    paymentMethodLabels,
    CreateMinorExpenseInput,
} from '@/lib/types/minor-expense';
import { MinorExpenseService } from '@/lib/services/minorExpenseService';
import { AccountingService, Account } from '@/lib/services/accountingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface Account {
    id: number;
    code: string;
    name: string;
}

export default function CreateMinorExpensePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [attachments, setAttachments] = useState<Array<{ name: string; base64: string }>>([]);

    const [formData, setFormData] = useState<CreateMinorExpenseInput>({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'FUEL' as ExpenseCategory,
        amount: 0,
        taxableAmount: 0,
        tax: 0,
        beneficiary: '',
        beneficiaryId: '',
        paymentMethod: 'CASH' as PaymentMethod,
        accountId: undefined,
        notes: '',
        branchId: 1,
    });

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const accountsList = await AccountingService.getAccounts(false);
            setAccounts(accountsList);
        } catch (error) {
            console.error('Error loading accounts:', error);
            toast.error('Error al cargar las cuentas contables');
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setFormData((prev) => {
            const updated = { ...prev, [name]: numValue };

            // Auto-calculate tax if taxable amount changes
            if (name === 'taxableAmount') {
                updated.tax = numValue * 0.18; // 18% ITBIS
                updated.amount = numValue + updated.tax;
            }

            // Recalculate total if tax changes manually
            if (name === 'tax') {
                updated.amount = (updated.taxableAmount || 0) + numValue;
            }

            return updated;
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newAttachments: Array<{ name: string; base64: string }> = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                newAttachments.push({ name: file.name, base64 });

                if (newAttachments.length === files.length) {
                    setAttachments((prev) => [...prev, ...newAttachments]);
                }
            };

            reader.readAsDataURL(file);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.description.trim()) {
            toast.error('La descripción es requerida');
            return;
        }

        if (formData.amount <= 0) {
            toast.error('El monto debe ser mayor a 0');
            return;
        }

        if (!formData.accountId) {
            toast.error('Debe seleccionar una cuenta contable');
            return;
        }

        try {
            setLoading(true);

            const dataToSend = {
                ...formData,
                attachments: attachments.length > 0 ? attachments.map(f => f.base64) : undefined,
            };

            await MinorExpenseService.createMinorExpense(dataToSend);

            toast.success('Gasto menor creado exitosamente');
            router.push('/minor-expenses');
        } catch (error: any) {
            console.error('Error creating expense:', error);
            toast.error(error.response?.data?.message || 'Error al crear gasto menor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <Link href="/minor-expenses">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Nuevo Gasto Menor</h1>
                <p className="text-gray-500 mt-1">Registrar nuevo gasto con NCF B13</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Básica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="date">Fecha *</Label>
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="category">Categoría *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => handleSelectChange('category', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(expenseCategoryLabels).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Descripción *</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe el gasto..."
                                    rows={3}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Amounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Montos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="taxableAmount">Monto Gravado *</Label>
                                    <Input
                                        id="taxableAmount"
                                        name="taxableAmount"
                                        type="number"
                                        step="0.01"
                                        value={formData.taxableAmount}
                                        onChange={(e) => handleNumberChange('taxableAmount', e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Base imponible</p>
                                </div>

                                <div>
                                    <Label htmlFor="tax">ITBIS (18%) *</Label>
                                    <Input
                                        id="tax"
                                        name="tax"
                                        type="number"
                                        step="0.01"
                                        value={formData.tax}
                                        onChange={(e) => handleNumberChange('tax', e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
                                </div>

                                <div>
                                    <Label htmlFor="amount">Total *</Label>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        readOnly
                                        className="bg-gray-50 font-bold"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Gravado + ITBIS</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Beneficiary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Beneficiario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="beneficiary">Nombre/Razón Social</Label>
                                    <Input
                                        id="beneficiary"
                                        name="beneficiary"
                                        value={formData.beneficiary}
                                        onChange={handleInputChange}
                                        placeholder="Nombre del beneficiario"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="beneficiaryId">RNC/Cédula</Label>
                                    <Input
                                        id="beneficiaryId"
                                        name="beneficiaryId"
                                        value={formData.beneficiaryId}
                                        onChange={handleInputChange}
                                        placeholder="000-0000000-0"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment & Account */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pago y Contabilidad</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="paymentMethod">Método de Pago *</Label>
                                    <Select
                                        value={formData.paymentMethod}
                                        onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(paymentMethodLabels).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="accountId">Cuenta Contable *</Label>
                                    <Select
                                        value={formData.accountId?.toString() || ''}
                                        onValueChange={(value) => handleNumberChange('accountId', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione una cuenta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map((account) => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.code} - {account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Cuenta de gastos en el plan contable donde se registrará este gasto
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attachments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Adjuntos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="attachments">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition">
                                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">
                                            Haz clic para subir archivos o arrástralos aquí
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            PDF, JPG, PNG (máx. 5MB por archivo)
                                        </p>
                                    </div>
                                    <Input
                                        id="attachments"
                                        type="file"
                                        multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </Label>
                            </div>

                            {attachments.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Archivos adjuntos:</p>
                                    {attachments.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                        >
                                            <span className="text-sm truncate">{file.name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAttachment(index)}
                                            >
                                                <X className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notas Adicionales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Observaciones o notas adicionales..."
                                rows={3}
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Link href="/minor-expenses">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Gasto
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
