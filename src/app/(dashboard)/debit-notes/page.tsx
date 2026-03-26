'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, FileText, TrendingUp, DollarSign, CheckCircle, XCircle, Eye } from 'lucide-react';
import { debitNoteService, DebitNote, QueryDebitNotesDto, DebitNoteStats } from '@/lib/services/debitNoteService';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ExportButton } from '@/components/ui/export-button';
import { toast } from 'sonner';
import { CreateDebitNoteDialog } from '@/components/debit-notes/CreateDebitNoteDialog';

export default function DebitNotesPage() {
    const router = useRouter();
    const [debitNotes, setDebitNotes] = useState<DebitNote[]>([]);
    const [stats, setStats] = useState<DebitNoteStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // Filtros
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState<'COMPLETED' | 'CANCELLED' | ''>('');
    const [fiscalTypeFilter, setFiscalTypeFilter] = useState<'FISCAL' | 'INTERNAL' | ''>('');

    useEffect(() => {
        loadDebitNotes();
        loadStats();
    }, [search, startDate, endDate, statusFilter, fiscalTypeFilter]);

    const loadDebitNotes = async () => {
        try {
            setLoading(true);
            const query: QueryDebitNotesDto = {
                limit: 50,
                offset: 0,
            };

            if (search) {
                if (search.startsWith('ND-')) {
                    query.debitNoteNumber = search;
                } else if (search.startsWith('E') && search.length > 2) {
                    query.ncf = search;
                } else {
                    query.originalInvoiceNumber = search;
                }
            }

            if (startDate) query.startDate = startDate;
            if (endDate) query.endDate = endDate;
            if (statusFilter) query.status = statusFilter;
            if (fiscalTypeFilter) query.fiscalType = fiscalTypeFilter;

            const response = await debitNoteService.getAll(query);
            setDebitNotes(response.data);
            setTotal(response.total);
        } catch (error) {
            console.error('Error loading debit notes:', error);
            toast.error('Error al cargar las notas de débito');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const statsData = await debitNoteService.getStats(
                undefined,
                startDate || undefined,
                endDate || undefined
            );
            setStats(statsData);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const getFiscalTypeBadge = (fiscalType: string) => {
        if (fiscalType === 'FISCAL') {
            return <Badge variant="default">Con NCF B03</Badge>;
        }
        return <Badge variant="secondary">Sin NCF</Badge>;
    };

    const getStatusBadge = (status: string) => {
        if (status === 'COMPLETED') {
            return (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completada
                </Badge>
            );
        }
        return (
            <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" />
                Cancelada
            </Badge>
        );
    };

    const handleExport = async (format: 'pdf' | 'excel', startDate?: string, endDate?: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast.error('No estás autenticado');
                return;
            }

            const params = new URLSearchParams({ format });
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/debit-notes/export?${params.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) throw new Error('Error al exportar');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `notas-debito-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`Archivo ${format.toUpperCase()} descargado exitosamente`);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al exportar datos');
        }
    };

    const handleViewDetail = (debitNote: DebitNote) => {
        router.push(`/debit-notes/${debitNote.id}`);
    };

    const handleDebitNoteCreated = () => {
        setShowCreateDialog(false);
        loadDebitNotes();
        loadStats();
        toast.success('Nota de débito creada exitosamente');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Notas de Débito</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Gestión de cargos adicionales a facturas existentes (NCF B03)
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end self-end sm:self-auto">
                    <ExportButton screenCode="DEBIT_NOTE" onExport={handleExport} size="sm" />
                    <Button onClick={() => setShowCreateDialog(true)} size="sm">
                        <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="text-xs sm:text-sm">Nueva Nota</span>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Total Notas</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                            <div className="text-lg sm:text-2xl font-bold">{stats.totalDebitNotes}</div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                                Notas de débito procesadas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Monto Total</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                            <div className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(stats.totalAmount)}</div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                                Total en cargos adicionales
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Activas</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                            <div className="text-lg sm:text-2xl font-bold">{stats.activeDebitNotes}</div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                                Notas vigentes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium">Con NCF B03</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 pt-0">
                            <div className="text-lg sm:text-2xl font-bold">{stats.fiscalDebitNotes}</div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                                Notas fiscales
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-5">
                        <div className="space-y-2">
                            <Label htmlFor="search">Buscar</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="ND-00001, NCF, Factura..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startDate">Fecha Inicio</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">Fecha Fin</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Estado</Label>
                            <select
                                id="status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            >
                                <option value="">Todos</option>
                                <option value="COMPLETED">Completadas</option>
                                <option value="CANCELLED">Canceladas</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fiscalType">Tipo Fiscal</Label>
                            <select
                                id="fiscalType"
                                value={fiscalTypeFilter}
                                onChange={(e) => setFiscalTypeFilter(e.target.value as any)}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            >
                                <option value="">Todos</option>
                                <option value="FISCAL">Con NCF B03</option>
                                <option value="INTERNAL">Sin NCF</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Listado de Notas de Débito</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                        {total} {total === 1 ? 'registro' : 'registros'} encontrados
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 sm:pt-0">
                    {loading ? (
                        <div className="text-center py-8 text-sm">Cargando...</div>
                    ) : debitNotes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No se encontraron notas de débito
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="sm:hidden divide-y">
                                {debitNotes.map((dn) => (
                                    <div key={dn.id} className="p-3 hover:bg-gray-50">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-sm">{dn.debitNoteNumber}</span>
                                                    {getFiscalTypeBadge(dn.fiscalType)}
                                                </div>
                                                {dn.ncf && (
                                                    <div className="text-xs text-muted-foreground font-mono mt-1">
                                                        NCF: {dn.ncf}
                                                    </div>
                                                )}
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Factura: {dn.originalInvoiceNumber}
                                                </div>
                                                {dn.customer && (
                                                    <div className="text-xs mt-1">
                                                        {dn.customer.name} {dn.customer.lastName}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-sm font-medium text-primary">
                                                        {formatCurrency(dn.total)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(dn.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 flex-shrink-0"
                                                onClick={() => handleViewDetail(dn)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Número ND</TableHead>
                                            <TableHead>NCF B03</TableHead>
                                            <TableHead>Factura Original</TableHead>
                                            <TableHead>Cliente</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {debitNotes.map((dn) => (
                                            <TableRow key={dn.id}>
                                                <TableCell className="font-medium">{dn.debitNoteNumber}</TableCell>
                                                <TableCell>
                                                    {dn.ncf ? (
                                                        <span className="text-sm font-mono">{dn.ncf}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{dn.originalInvoiceNumber}</div>
                                                        {dn.originalNcf && (
                                                            <div className="text-xs text-muted-foreground font-mono">
                                                                {dn.originalNcf}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {dn.customer ? (
                                                        <div>
                                                            <div>{dn.customer.name} {dn.customer.lastName}</div>
                                                            {dn.customer.taxId && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    RNC: {dn.customer.taxId}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getFiscalTypeBadge(dn.fiscalType)}</TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(dn.total)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(dn.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handleViewDetail(dn)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <CreateDebitNoteDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={handleDebitNoteCreated}
            />
        </div>
    );
}
