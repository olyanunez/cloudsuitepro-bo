/**
 * PrinterService - Cliente para CloudSuite Printer Service
 * 
 * Este servicio se comunica con la aplicación local de impresión térmica
 * que corre en http://localhost:9100
 */

const PRINTER_SERVICE_URL = 'http://localhost:9100';
const TIMEOUT_MS = 2000;

export interface PrinterServiceStatus {
    available: boolean;
    version?: string;
}

export interface PrinterConfig {
    printerName: string | null;
    printerType: string;
    width: number;
}

export interface InvoicePrintData {
    companyName?: string;
    companyAddress?: string;
    companyRnc?: string;
    companyPhone?: string;
    ncf?: string;
    invoiceNumber: string;
    date: string | Date;
    customerName?: string;
    customerRnc?: string;
    items: Array<{
        name: string;
        description?: string;
        quantity: number;
        price: number;
        total: number;
    }>;
    subtotal?: number;
    discount?: number;
    tax?: number;
    total: number;
    paymentMethod?: string;
    footer?: string;
}

export interface TicketPrintData {
    title?: string;
    content: string;
}

export interface ReportPrintData {
    title: string;
    lines: Array<{
        type: 'line' | 'title' | 'text';
        text?: string;
    }>;
}

export class PrinterService {
    /**
     * Verifica si el servicio de impresión está disponible
     */
    static async checkService(): Promise<PrinterServiceStatus> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

            const response = await fetch(`${PRINTER_SERVICE_URL}/health`, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                return {
                    available: true,
                    version: data.version
                };
            }

            return { available: false };
        } catch (error) {
            // Service no disponible o timeout
            return { available: false };
        }
    }

    /**
     * Obtiene la lista de impresoras disponibles
     */
    static async getPrinters(): Promise<string[]> {
        try {
            const response = await fetch(`${PRINTER_SERVICE_URL}/printers`);
            const data = await response.json();

            if (data.success) {
                return data.printers || [];
            }

            throw new Error(data.error || 'Error al obtener impresoras');
        } catch (error) {
            console.error('Error obteniendo impresoras:', error);
            throw error;
        }
    }

    /**
     * Obtiene la configuración actual
     */
    static async getConfig(): Promise<PrinterConfig> {
        try {
            const response = await fetch(`${PRINTER_SERVICE_URL}/config`);
            const data = await response.json();

            if (data.success) {
                return data.config;
            }

            throw new Error(data.error || 'Error al obtener configuración');
        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            throw error;
        }
    }

    /**
     * Actualiza la configuración
     */
    static async updateConfig(config: Partial<PrinterConfig>): Promise<void> {
        try {
            const response = await fetch(`${PRINTER_SERVICE_URL}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al actualizar configuración');
            }
        } catch (error) {
            console.error('Error actualizando configuración:', error);
            throw error;
        }
    }

    /**
     * Imprime una factura
     */
    static async printInvoice(invoice: InvoicePrintData): Promise<void> {
        try {
            const response = await fetch(`${PRINTER_SERVICE_URL}/print/invoice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoice)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al imprimir factura');
            }
        } catch (error) {
            console.error('Error imprimiendo factura:', error);
            throw error;
        }
    }

    /**
     * Imprime un ticket simple
     */
    static async printTicket(ticket: TicketPrintData): Promise<void> {
        try {
            const response = await fetch(`${PRINTER_SERVICE_URL}/print/ticket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticket)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al imprimir ticket');
            }
        } catch (error) {
            console.error('Error imprimiendo ticket:', error);
            throw error;
        }
    }

    /**
     * Imprime un reporte
     */
    static async printReport(report: ReportPrintData): Promise<void> {
        try {
            const response = await fetch(`${PRINTER_SERVICE_URL}/print/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al imprimir reporte');
            }
        } catch (error) {
            console.error('Error imprimiendo reporte:', error);
            throw error;
        }
    }

    /**
     * Abre el cajón de dinero
     */
    static async openCashDrawer(): Promise<void> {
        try {
            const response = await fetch(`${PRINTER_SERVICE_URL}/open-drawer`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al abrir cajón');
            }
        } catch (error) {
            console.error('Error abriendo cajón:', error);
            throw error;
        }
    }

    /**
     * Imprime una prueba
     */
    static async testPrint(): Promise<void> {
        try {
            const response = await fetch(`${PRINTER_SERVICE_URL}/test`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error en test de impresión');
            }
        } catch (error) {
            console.error('Error en test de impresión:', error);
            throw error;
        }
    }

    /**
     * Imprime usando el servicio si está disponible, o fallback a window.print()
     */
    static async printOrFallback(invoice: InvoicePrintData): Promise<'thermal' | 'browser'> {
        const status = await this.checkService();

        if (status.available) {
            await this.printInvoice(invoice);
            return 'thermal';
        } else {
            // Fallback: impresión desde navegador
            window.print();
            return 'browser';
        }
    }
}
