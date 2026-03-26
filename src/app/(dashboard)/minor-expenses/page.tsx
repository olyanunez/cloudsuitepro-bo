'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MinorExpense,
    ExpenseStatus,
    ExpenseCategory,
    expenseCategoryLabels,
    expenseStatusLabels,
    paymentMethodLabels,
} from '@/lib/types/minor-expense';
import { MinorExpenseService } from '@/lib/services/minorExpenseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Plus,
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    DollarSign,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { usePermissions } from '@/lib/hooks/usePermissions';

export default function MinorExpensesPage() {
    const router = useRouter();
    const { hasPermission } = usePermissions('MINOR_EXPENSES');
    const [expenses, setExpenses] = useState<MinorExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState<any>(null);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<MinorExpense | null>(null);
    const [approving, setApproving] = useState(false);
    const [approvalData, setApprovalData] = useState({
        approved: true,
        rejectionReason: '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'ALL' as ExpenseStatus | 'ALL',
        category: 'ALL' as ExpenseCategory | 'ALL',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        loadExpenses();
        loadStatistics();
    }, [pagination.page, filters]);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const response = await MinorExpenseService.getMinorExpenses({
                page: pagination.page,
                limit: pagination.limit,
                status: filters.status === 'ALL' ? undefined : filters.status,
                category: filters.category === 'ALL' ? undefined : filters.category,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
            });

            setExpenses(response.data);
            setPagination((prev) => ({
                ...prev,
                total: response.meta.total,
                totalPages: response.meta.totalPages,
            }));
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const stats = await MinorExpenseService.getStatistics({
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
            });
            setStatistics(stats);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    const getStatusBadge = (status: ExpenseStatus) => {
        const variants = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            APPROVED: 'bg-green-100 text-green-800 border-green-300',
            REJECTED: 'bg-red-100 text-red-800 border-red-300',
        };

        const icons = {
            PENDING: <Clock className="h-3 w-3 mr-1" />,
            APPROVED: <CheckCircle className="h-3 w-3 mr-1" />,
            REJECTED: <XCircle className="h-3 w-3 mr-1" />,
        };

        return (
            <Badge className={`${variants[status]} flex items-center`}>
                {icons[status]}
                {expenseStatusLabels[status]}
            </Badge>
        );
    };

    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, search: value }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleApprove = async (expense: MinorExpense) => {
        setSelectedExpense(expense);
        setApprovalData({ approved: true, rejectionReason: '' });
        setShowApprovalModal(true);
    };

    const processApproval = async () => {
        if (!selectedExpense) return;

        if (!approvalData.approved && !approvalData.rejectionReason.trim()) {
            toast.error('Debe proporcionar una razón para el rechazo');
            return;
        }

        try {
            setApproving(true);
            await MinorExpenseService.approveMinorExpense(selectedExpense.id, approvalData);

            toast.success(
                approvalData.approved
                    ? 'Gasto aprobado exitosamente'
                    : 'Gasto rechazado exitosamente'
            );

            setShowApprovalModal(false);
            setSelectedExpense(null);
            loadExpenses();
            loadStatistics();
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

    const filteredExpenses = expenses.filter((expense) => {
        if (!filters.search) return true;
        const searchLower = filters.search.toLowerCase();
        return (
            expense.expenseNumber.toLowerCase().includes(searchLower) ||
            expense.description.toLowerCase().includes(searchLower) ||
            expense.beneficiary?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="container mx-auto p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Gastos Menores</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">NCF B13 - Gestión de gastos menores</p>
                </div>
                <Link href="/minor-expenses/create" className="self-end sm:self-auto">
                    <Button className="flex items-center gap-1 sm:gap-2" size="sm">
                        <Plus className="h-4 w-4" />
                        <span className="text-xs sm:text-sm">Nuevo Gasto</span>
                    </Button>
                </Link>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6 pb-1 sm:pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                                Total Gastos
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                            <div className="text-lg sm:text-2xl font-bold truncate">
                                {formatCurrency(statistics.total?.amount || 0)}
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                {statistics.total?.count || 0} registros
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6 pb-1 sm:pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-yellow-600">
                                Pendientes
                            </CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                            <div className="text-lg sm:text-2xl font-bold truncate">
                                {formatCurrency(statistics.pending?.amount || 0)}
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                {statistics.pending?.count || 0} gastos
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6 pb-1 sm:pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-green-600">
                                Aprobados
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                            <div className="text-lg sm:text-2xl font-bold truncate">
                                {formatCurrency(statistics.approved?.amount || 0)}
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                {statistics.approved?.count || 0} gastos
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6 pb-1 sm:pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-red-600">
                                Rechazados
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                            <div className="text-lg sm:text-2xl font-bold truncate">
                                {formatCurrency(statistics.rejected?.amount || 0)}
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                {statistics.rejected?.count || 0} gastos
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar..."
                                className="pl-9"
                                value={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <Select
                            value={filters.status}
                            onValueChange={(value) => handleFilterChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos</SelectItem>
                                <SelectItem value="PENDING">Pendientes</SelectItem>
                                <SelectItem value="APPROVED">Aprobados</SelectItem>
                                <SelectItem value="REJECTED">Rechazados</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.category}
                            onValueChange={(value) => handleFilterChange('category', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todas</SelectItem>
                                {Object.entries(expenseCategoryLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            type="date"
                            placeholder="Fecha desde"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />

                        <Input
                            type="date"
                            placeholder="Fecha hasta"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0 sm:pt-6 sm:px-6 sm:pb-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="sm:hidden divide-y">
                                {filteredExpenses.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        No se encontraron gastos menores
                                    </div>
                                ) : (
                                    filteredExpenses.map((expense) => (
                                        <div key={expense.id} className="p-3 hover:bg-gray-50">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium text-sm">{expense.expenseNumber}</span>
                                                        {getStatusBadge(expense.status)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {new Date(expense.date).toLocaleDateString('es-DO')} • {expenseCategoryLabels[expense.category]}
                                                    </div>
                                                    <div className="text-sm mt-1 line-clamp-1">{expense.description}</div>
                                                    {expense.beneficiary && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Beneficiario: {expense.beneficiary}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-sm font-semibold">
                                                            {formatCurrency(expense.amount)}
                                                        </span>
                                                        {expense.ncfB13 && (
                                                            <span className="text-[10px] text-green-600 font-mono">
                                                                {expense.ncfB13}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <Link href={`/minor-expenses/${expense.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {expense.status === 'PENDING' && hasPermission('APPROVE') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleApprove(expense)}
                                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Número</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Categoría</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Beneficiario</TableHead>
                                            <TableHead>Monto</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>NCF B13</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredExpenses.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                                    No se encontraron gastos menores
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredExpenses.map((expense) => (
                                                <TableRow key={expense.id}>
                                                    <TableCell className="font-medium">
                                                        {expense.expenseNumber}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(expense.date).toLocaleDateString('es-DO')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {expenseCategoryLabels[expense.category]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {expense.description}
                                                    </TableCell>
                                                    <TableCell>{expense.beneficiary || '-'}</TableCell>
                                                    <TableCell className="font-semibold">
                                                        {formatCurrency(expense.amount)}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(expense.status)}</TableCell>
                                                    <TableCell>
                                                        {expense.ncfB13 ? (
                                                            <span className="text-green-600 font-mono text-sm">
                                                                {expense.ncfB13}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Link href={`/minor-expenses/${expense.id}`}>
                                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {expense.status === 'PENDING' && hasPermission('APPROVE') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                                                    onClick={() => handleApprove(expense)}
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-gray-500">
                                        Mostrando {filteredExpenses.length} de {pagination.total} gastos
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.page === 1}
                                            onClick={() =>
                                                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                                            }
                                        >
                                            Anterior
                                        </Button>
                                        <span className="flex items-center px-3 text-sm">
                                            Página {pagination.page} de {pagination.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.page === pagination.totalPages}
                                            onClick={() =>
                                                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                                            }
                                        >
                                            Siguiente
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Approval Modal */}
            <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Aprobar/Rechazar Gasto Menor</DialogTitle>
                    </DialogHeader>

                    {selectedExpense && (
                        <div className="space-y-4">
                            {/* Expense Details */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Número</p>
                                    <p className="font-semibold">{selectedExpense.expenseNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Fecha</p>
                                    <p className="font-semibold">
                                        {new Date(selectedExpense.date).toLocaleDateString('es-DO')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Categoría</p>
                                    <p className="font-semibold">
                                        {expenseCategoryLabels[selectedExpense.category]}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Monto</p>
                                    <p className="font-semibold text-lg text-blue-600">
                                        {formatCurrency(selectedExpense.amount)}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600">Descripción</p>
                                    <p className="font-semibold">{selectedExpense.description}</p>
                                </div>
                                {selectedExpense.beneficiary && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600">Beneficiario</p>
                                        <p className="font-semibold">{selectedExpense.beneficiary}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-600">Método de Pago</p>
                                    <p className="font-semibold">
                                        {paymentMethodLabels[selectedExpense.paymentMethod]}
                                    </p>
                                </div>
                            </div>

                            {/* Approval Actions */}
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <Button
                                        variant={approvalData.approved ? 'success' : 'outline'}
                                        onClick={() => setApprovalData({ ...approvalData, approved: true })}
                                        className="flex-1"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Aprobar
                                    </Button>
                                    <Button
                                        variant={!approvalData.approved ? 'success' : 'outline'}
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
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowApprovalModal(false)}
                            disabled={approving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={processApproval}
                            disabled={approving}
                        >
                            {approving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Procesando...
                                </>
                            ) : (
                                'Confirmar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
