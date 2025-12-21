'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/lib/hooks/usePermissions';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

interface ExportButtonProps {
    /**
     * Código de la pantalla para verificar permisos
     */
    screenCode: string;

    /**
     * Función que se ejecuta cuando se confirma la exportación
     * @param format - Formato de exportación (pdf o excel)
     * @param startDate - Fecha de inicio (opcional)
     * @param endDate - Fecha de fin (opcional)
     */
    onExport: (format: ExportFormat, startDate?: string, endDate?: string) => Promise<void>;

    /**
     * Si requiere rango de fechas (por defecto true)
     */
    requiresDateRange?: boolean;

    /**
     * Texto del botón (opcional)
     */
    buttonText?: string;

    /**
     * Variante del botón (opcional)
     */
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';

    /**
     * Tamaño del botón (opcional)
     */
    size?: 'default' | 'sm' | 'lg' | 'icon';

    /**
     * Formatos disponibles (por defecto ambos)
     */
    availableFormats?: ExportFormat[];

    /**
     * Clase CSS adicional
     */
    className?: string;
}

export function ExportButton({
    screenCode,
    onExport,
    requiresDateRange = true,
    buttonText = 'Exportar',
    variant = 'outline',
    size = 'default',
    availableFormats = ['pdf', 'excel'],
    className = '',
}: ExportButtonProps) {
    const { hasPermission } = usePermissions(screenCode);
    const canExport = hasPermission('EXPORT');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    // Si no tiene permiso, no mostrar el botón
    if (!canExport) {
        return null;
    }

    const handleFormatSelect = (format: ExportFormat) => {
        setSelectedFormat(format);
        if (requiresDateRange) {
            setDialogOpen(true);
        } else {
            handleExport(format);
        }
    };

    const handleExport = async (format?: ExportFormat) => {
        const exportFormat = format || selectedFormat;
        if (!exportFormat) return;

        try {
            setIsExporting(true);

            if (requiresDateRange && (!startDate || !endDate)) {
                toast.error('Por favor seleccione el rango de fechas');
                return;
            }

            if (requiresDateRange && startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (start > end) {
                    toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
                    return;
                }
            }

            await onExport(
                exportFormat,
                requiresDateRange ? startDate : undefined,
                requiresDateRange ? endDate : undefined
            );

            toast.success(`Exportando a ${exportFormat.toUpperCase()}...`);
            setDialogOpen(false);
            setStartDate('');
            setEndDate('');
        } catch (error: any) {
            toast.error('Error al exportar', {
                description: error.message || 'No se pudo completar la exportación',
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={variant} size={size} className={className}>
                        <Download className="h-4 w-4 mr-2" />
                        {buttonText}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {availableFormats.includes('excel') && (
                        <DropdownMenuItem onClick={() => handleFormatSelect('excel')}>
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                            Exportar a Excel
                        </DropdownMenuItem>
                    )}
                    {availableFormats.includes('csv') && (
                        <DropdownMenuItem onClick={() => handleFormatSelect('csv')}>
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-600" />
                            Exportar a CSV
                        </DropdownMenuItem>
                    )}
                    {availableFormats.includes('pdf') && (
                        <DropdownMenuItem onClick={() => handleFormatSelect('pdf')}>
                            <FileText className="h-4 w-4 mr-2 text-red-600" />
                            Exportar a PDF
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Seleccionar Rango de Fechas</DialogTitle>
                        <DialogDescription>
                            Seleccione el período que desea exportar a {selectedFormat?.toUpperCase()}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="startDate">Fecha de Inicio</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate || undefined}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endDate">Fecha de Fin</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate || undefined}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            disabled={isExporting}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={() => handleExport()} disabled={isExporting || !startDate || !endDate}>
                            {isExporting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Exportando...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
