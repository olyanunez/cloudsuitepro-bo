'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    MinorExpense,
    expenseCategoryLabels,
    expenseStatusLabels,
    paymentMethodLabels,
} from '@/lib/types/minor-expense';
import { MinorExpenseService } from '@/lib/services/minorExpenseService';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    FileText,
    User,
    Calendar,
    DollarSign,
    CreditCard,
    Building2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function MinorExpenseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = parseInt(params.id as string);
    const { hasPermission } = usePermissions('MINOR_EXPENSES');

    const [expense, setExpense] = useState<MinorExpense | null>(null);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);
    const [showApproval, setShowApproval] = useState(false);
    const [approvalData, setApprovalData] = useState({
        approved: true,
        rejectionReason: '',
    });

    useEffect(() => {
        if (id) {
            loadExpense();
        }
    }, [id]);

    const loadExpense = async () => {
        try {
            setLoading(true);
            const data = await MinorExpenseService.getMinorExpenseById(id);
            setExpense(data);
        } catch (error: any) {
            console.error('Error loading expense:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'No se pudo cargar el gasto';
            toast.error('Error al cargar el gasto', {
                description: errorMessage,
            });
            router.push('/minor-expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!approvalData.approved && !approvalData.rejectionReason.trim()) {
            toast.error('Debe proporcionar una razón para el rechazo');
            return;
        }

        try {
            setApproving(true);
            await MinorExpenseService.approveMinorExpense(id, approvalData);

            toast.success(
                approvalData.approved
                    ? 'Gasto aprobado exitosamente'
                    : 'Gasto rechazado exitosamente'
            );

            router.push('/minor-expenses');
        } catch (error: any) {
            console.error('Error approving expense:', error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'No se pudo procesar la aprobación';
            toast.error('Error al procesar aprobación', {
                description: errorMessage,
            });
        } finally {
            setApproving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            APPROVED: 'bg-green-100 text-green-800 border-green-300',
            REJECTED: 'bg-red-100 text-red-800 border-red-300',
        };

        const icons = {
            PENDING: <Clock className="h-4 w-4 mr-1" />,
            APPROVED: <CheckCircle className="h-4 w-4 mr-1" />,
            REJECTED: <XCircle className="h-4 w-4 mr-1" />,
        };

        return (
            <Badge
                className={`${variants[status as keyof typeof variants]} flex items-center w-fit`}
            >
                {icons[status as keyof typeof icons]}
                {expenseStatusLabels[status as keyof typeof expenseStatusLabels]}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!expense) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            {/* Header */}
            <div className="mb-6">
                <Link href="/minor-expenses">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{expense.expenseNumber}</h1>
                        <p className="text-gray-500 mt-1">Detalle de gasto menor</p>
                    </div>
                    <div className="flex gap-2">
                        {getStatusBadge(expense.status)}
                        {expense.status === 'PENDING' && hasPermission('APPROVE') && (
                            <Button
                                variant="success"
                                onClick={() => setShowApproval(!showApproval)}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprobar/Rechazar
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Approval Section */}
            {showApproval && expense.status === 'PENDING' && (
                <Card className="mb-6 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-900">Aprobación/Rechazo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Button
                                variant={approvalData.approved ? 'default' : 'outline'}
                                onClick={() => setApprovalData({ ...approvalData, approved: true })}
                                className="flex-1"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprobar
                            </Button>
                            <Button
                                variant={!approvalData.approved ? 'default' : 'outline'}
                                onClick={() => setApprovalData({ ...approvalData, approved: false })}
                                className="flex-1"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Rechazar
                            </Button>
                        </div>

                        {!approvalData.approved && (
                            <div>
                                <Label htmlFor="rejectionReason">Razón del rechazo *</Label>
                                <Textarea
                                    id="rejectionReason"
                                    value={approvalData.rejectionReason}
                                    onChange={(e) =>
                                        setApprovalData({ ...approvalData, rejectionReason: e.target.value })
                                    }
                                    placeholder="Explique por qué se rechaza este gasto..."
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowApproval(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleApprove} disabled={approving}>
                                {approving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    <>Confirmar</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Fecha
                                    </p>
                                    <p className="font-medium">
                                        {new Date(expense.date).toLocaleDateString('es-DO', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Categoría</p>
                                    <Badge variant="outline" className="mt-1">
                                        {expenseCategoryLabels[expense.category]}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Descripción</p>
                                <p className="mt-1">{expense.description}</p>
                            </div>

                            {expense.notes && (
                                <div className="bg-gray-50 p-3 rounded">
                                    <p className="text-sm text-gray-500">Notas</p>
                                    <p className="mt-1 text-sm">{expense.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Amounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Desglose de Montos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-gray-600">Monto Gravado</span>
                                    <span className="font-medium">
                                        {formatCurrency(expense.taxableAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-gray-600">ITBIS (18%)</span>
                                    <span className="font-medium">{formatCurrency(expense.tax)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-semibold flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Total
                                    </span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(expense.amount)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Beneficiary */}
                    {(expense.beneficiary || expense.beneficiaryId) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Beneficiario</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {expense.beneficiary && (
                                    <div>
                                        <p className="text-sm text-gray-500">Nombre/Razón Social</p>
                                        <p className="font-medium">{expense.beneficiary}</p>
                                    </div>
                                )}
                                {expense.beneficiaryId && (
                                    <div>
                                        <p className="text-sm text-gray-500">RNC/Cédula</p>
                                        <p className="font-medium">{expense.beneficiaryId}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Attachments */}
                    {expense.attachments && Array.isArray(expense.attachments) && expense.attachments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Documentos Adjuntos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {expense.attachments.map((file: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-gray-500" />
                                                <span className="text-sm">{file.name}</span>
                                            </div>
                                            <a href={file.base64} download={file.name}>
                                                <Button variant="ghost" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* NCF */}
                    {expense.ncfB13 && (
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-green-900">NCF B13</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-mono font-bold text-green-700">
                                    {expense.ncfB13}
                                </p>
                                <p className="text-xs text-green-600 mt-2">
                                    Comprobante Fiscal Válido
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de Pago</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Método de Pago
                                </p>
                                <Badge variant="outline" className="mt-1">
                                    {paymentMethodLabels[expense.paymentMethod]}
                                </Badge>
                            </div>

                            {expense.account && (
                                <div>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Cuenta Contable
                                    </p>
                                    <p className="text-sm font-medium mt-1">
                                        {expense.account.code} - {expense.account.name}
                                    </p>
                                </div>
                            )}

                            {expense.journalEntry && (
                                <div className="bg-blue-50 p-3 rounded">
                                    <p className="text-sm text-gray-600">Asiento Contable</p>
                                    <p className="font-mono text-sm font-medium mt-1">
                                        {expense.journalEntry.entryNumber}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Creator & Approver */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro y Aprobación</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {expense.creator && (
                                <div>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Creado por
                                    </p>
                                    <p className="font-medium mt-1">
                                        {expense.creator.name} {expense.creator.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(expense.createdAt).toLocaleString('es-DO')}
                                    </p>
                                </div>
                            )}

                            {expense.approver && (
                                <div className="pt-3 border-t">
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        {expense.status === 'APPROVED' ? 'Aprobado por' : 'Rechazado por'}
                                    </p>
                                    <p className="font-medium mt-1">
                                        {expense.approver.name} {expense.approver.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {expense.approvedAt &&
                                            new Date(expense.approvedAt).toLocaleString('es-DO')}
                                    </p>
                                </div>
                            )}

                            {expense.status === 'REJECTED' && expense.rejectionReason && (
                                <div className="bg-red-50 p-3 rounded">
                                    <p className="text-sm font-medium text-red-900">Razón del rechazo:</p>
                                    <p className="text-sm text-red-700 mt-1">{expense.rejectionReason}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
