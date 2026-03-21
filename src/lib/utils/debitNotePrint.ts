import { DebitNote } from '@/lib/services/debitNoteService';
import { Tenant } from '@/lib/services/tenantService';
import { formatCurrency } from '@/lib/utils';

interface PrintDebitNoteOptions {
  debitNote: DebitNote;
  tenantInfo: Tenant | null;
  itbisRate: number;
  includeLogo?: boolean;
  invoiceFooter?: string;
}

export function printDebitNote({
  debitNote,
  tenantInfo,
  itbisRate,
  includeLogo = true,
  invoiceFooter,
}: PrintDebitNoteOptions) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes.');
  }

  // Asegurar que itbisRate sea un número válido
  const itbisRateNum = Number(itbisRate) || 18;
  const itbisPercentage = itbisRateNum > 1 ? itbisRateNum : itbisRateNum * 100;

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Nota de Débito ${debitNote.debitNoteNumber}</title>
        <style>
          @page {
            margin: 10mm;
            size: auto;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            padding: 20px;
            font-size: 11pt;
            line-height: 1.4;
          }
          .debit-note-container { max-width: 210mm; margin: 0 auto; }

          /* Header - Información de la empresa */
          .company-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          .company-header .logo {
            max-width: 150px;
            max-height: 80px;
            margin: 0 auto 15px;
            display: block;
          }
          .company-header h1 {
            font-size: 24pt;
            margin-bottom: 8px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .company-header .company-info {
            font-size: 10pt;
            margin: 3px 0;
            color: #333;
          }
          .company-header .rnc {
            font-weight: 600;
            font-size: 11pt;
            margin-top: 5px;
          }

          /* Título del documento */
          .document-title {
            text-align: center;
            background-color: #dc3545;
            color: white;
            padding: 12px;
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 20px;
            border-radius: 4px;
          }

          /* Sección de información fiscal (NCF) */
          .fiscal-section {
            background-color: #f8f8f8;
            border: 2px solid #000;
            padding: 15px;
            margin-bottom: 20px;
          }
          .fiscal-section .ncf-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .fiscal-section .ncf-row:last-child {
            margin-bottom: 0;
          }
          .fiscal-section .ncf-label {
            font-weight: 600;
            font-size: 11pt;
          }
          .fiscal-section .ncf-value {
            font-family: 'Courier New', monospace;
            font-size: 13pt;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .fiscal-section .ncf-type {
            font-size: 10pt;
            color: #555;
            font-style: italic;
          }
          .fiscal-section .ncf-validity {
            font-size: 9pt;
            color: #666;
          }

          /* Información de la nota de débito */
          .debit-note-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
            font-size: 10pt;
          }
          .debit-note-info .info-group {
            padding: 10px;
            background-color: #fafafa;
            border-radius: 4px;
          }
          .debit-note-info .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            padding: 2px 0;
          }
          .debit-note-info .row:last-child {
            margin-bottom: 0;
          }
          .debit-note-info .row .label {
            font-weight: 600;
            color: #555;
          }
          .debit-note-info .row .value {
            font-weight: 500;
          }

          /* Sección de factura original */
          .original-invoice-section {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
          }
          .original-invoice-section h3 {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 10px;
            color: #856404;
          }
          .original-invoice-section .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 10pt;
          }
          .original-invoice-section .row .label {
            font-weight: 600;
            color: #856404;
          }
          .original-invoice-section .row .value {
            font-weight: 500;
          }

          /* Sección de motivo */
          .reason-section {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
          }
          .reason-section h3 {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .reason-section p {
            font-size: 11pt;
            line-height: 1.5;
          }
          .reason-section .notes {
            margin-top: 10px;
            font-size: 10pt;
            color: #666;
            font-style: italic;
          }

          /* Sección de totales */
          .totals {
            margin-top: 20px;
            border-top: 2px solid #000;
            padding-top: 15px;
          }
          .totals .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 11pt;
            padding: 3px 0;
          }
          .totals .row .label {
            font-weight: 500;
          }
          .totals .row .value {
            font-weight: 600;
            min-width: 120px;
            text-align: right;
          }
          .totals .itbis-row {
            background-color: #f0f0f0;
            padding: 8px;
            margin: 5px 0;
            border-radius: 4px;
          }
          .totals .total-row {
            font-weight: bold;
            font-size: 16pt;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 2px solid #000;
            background-color: #ffebee;
            padding: 12px 8px;
            color: #c62828;
          }
          .totals .total-row .label {
            font-size: 14pt;
          }
          .totals .total-row .value {
            font-size: 18pt;
          }

          /* Footer */
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10pt;
            border-top: 1px solid #000;
            padding-top: 15px;
          }
          .footer p {
            margin: 5px 0;
          }
          .footer .legal {
            font-size: 8pt;
            color: #666;
            margin-top: 10px;
          }

          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
            @page {
              margin-top: 0;
              margin-bottom: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="debit-note-container">
          <!-- Header con información de la empresa -->
          <div class="company-header">
            ${includeLogo && tenantInfo?.logo ? `<img src="${tenantInfo.logo}" alt="Logo" class="logo" />` : ''}
            <h1>${tenantInfo?.name || 'CloudSuite Pro'}</h1>
            ${tenantInfo?.address ? `<p class="company-info">${tenantInfo.address}</p>` : ''}
            ${tenantInfo?.phone ? `<p class="company-info">Tel: ${tenantInfo.phone}</p>` : ''}
            ${tenantInfo?.email ? `<p class="company-info">Email: ${tenantInfo.email}</p>` : ''}
            ${tenantInfo?.taxId ? `<p class="rnc">RNC: ${tenantInfo.taxId}</p>` : ''}
          </div>

          <!-- Título del documento -->
          <div class="document-title">
            NOTA DE DÉBITO
          </div>

          <!-- Sección de información fiscal (NCF) -->
          ${debitNote.ncf ? `
          <div class="fiscal-section">
            <div class="ncf-row">
              <span class="ncf-label">Comprobante Fiscal (NCF):</span>
              <span class="ncf-value">${debitNote.ncf}</span>
            </div>
            <div class="ncf-row">
              <span class="ncf-label">Tipo:</span>
              <span class="ncf-type">B03 - Nota de Débito</span>
            </div>
            ${debitNote.ncfValidUntil ? `
            <div class="ncf-row">
              <span class="ncf-label">NCF Válido hasta:</span>
              <span class="ncf-validity">${new Date(debitNote.ncfValidUntil).toLocaleDateString('es-DO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            ` : ''}
          </div>
          ` : ''}

          <!-- Información de la nota de débito -->
          <div class="debit-note-info">
            <div class="info-group">
              <div class="row">
                <span class="label">Nota de Débito No:</span>
                <span class="value">${debitNote.debitNoteNumber}</span>
              </div>
              <div class="row">
                <span class="label">Fecha:</span>
                <span class="value">${new Date(debitNote.createdAt).toLocaleString('es-DO', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                })}</span>
              </div>
              <div class="row">
                <span class="label">Sucursal:</span>
                <span class="value">${debitNote.branch?.name || 'N/A'}</span>
              </div>
              <div class="row">
                <span class="label">Creado por:</span>
                <span class="value">${debitNote.user?.name || debitNote.user?.email || 'N/A'}</span>
              </div>
            </div>

            <div class="info-group">
              ${debitNote.customerName || debitNote.customerRnc || debitNote.customer ? `
              <div class="row">
                <span class="label">Cliente:</span>
                <span class="value">${debitNote.customerName || (debitNote.customer ? `${debitNote.customer.name} ${debitNote.customer.lastName || ''}` : 'N/A')}</span>
              </div>
              ${debitNote.customerRnc || debitNote.customer?.taxId ? `
              <div class="row">
                <span class="label">RNC/Cédula:</span>
                <span class="value">${debitNote.customerRnc || debitNote.customer?.taxId}</span>
              </div>
              ` : ''}
              ` : `
              <div class="row">
                <span class="label">Cliente:</span>
                <span class="value">Sin información</span>
              </div>
              `}
              <div class="row">
                <span class="label">Tipo:</span>
                <span class="value">${debitNote.fiscalType === 'FISCAL' ? 'Fiscal (Con NCF)' : 'Interno (Sin NCF)'}</span>
              </div>
            </div>
          </div>

          <!-- Información de la factura original -->
          <div class="original-invoice-section">
            <h3>Factura Original Referenciada</h3>
            <div class="row">
              <span class="label">Número de Factura:</span>
              <span class="value">${debitNote.originalInvoiceNumber}</span>
            </div>
            ${debitNote.originalNcf ? `
            <div class="row">
              <span class="label">NCF Original:</span>
              <span class="value">${debitNote.originalNcf}</span>
            </div>
            ` : ''}
            ${debitNote.originalInvoice ? `
            <div class="row">
              <span class="label">Total Factura Original:</span>
              <span class="value">${formatCurrency(debitNote.originalInvoice.total)}</span>
            </div>
            ` : ''}
          </div>

          <!-- Motivo del cargo -->
          <div class="reason-section">
            <h3>Motivo del Cargo Adicional</h3>
            <p>${debitNote.reason}</p>
            ${debitNote.notes ? `
            <p class="notes"><strong>Notas:</strong> ${debitNote.notes}</p>
            ` : ''}
          </div>

          <!-- Totales -->
          <div class="totals">
            <div class="row">
              <span class="label">Subtotal:</span>
              <span class="value">${formatCurrency(debitNote.subtotal)}</span>
            </div>
            ${Number(debitNote.discount) > 0 ? `
            <div class="row">
              <span class="label">Descuento:</span>
              <span class="value">-${formatCurrency(debitNote.discount)}</span>
            </div>
            ` : ''}
            ${Number(debitNote.tax) > 0 ? `
            <div class="row itbis-row">
              <span class="label">ITBIS (${itbisPercentage.toFixed(0)}%):</span>
              <span class="value">${formatCurrency(debitNote.tax)}</span>
            </div>
            ` : `
            <div class="row">
              <span class="label">ITBIS:</span>
              <span class="value">${formatCurrency(0)}</span>
            </div>
            `}
            <div class="row total-row">
              <span class="label">TOTAL CARGO ADICIONAL:</span>
              <span class="value">${formatCurrency(debitNote.total)}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            ${invoiceFooter ? `
              <p><strong>${invoiceFooter}</strong></p>
            ` : `
              <p><strong>Gracias por su preferencia</strong></p>
            `}
            <p>Este cargo ha sido aplicado a su cuenta</p>
            ${debitNote.ncf ? `
            <p class="legal">
              Este documento es válido como comprobante fiscal según la Norma 06-18 de la DGII
            </p>
            ` : ''}
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
}

export function downloadDebitNotePDF({
  debitNote,
  tenantInfo,
  itbisRate,
  includeLogo = true,
  invoiceFooter,
}: PrintDebitNoteOptions) {
  // Para descargar PDF, usamos la misma lógica de impresión
  // El usuario puede usar "Guardar como PDF" desde el diálogo de impresión
  // o podemos implementar una solución con html2pdf o similar en el futuro
  printDebitNote({
    debitNote,
    tenantInfo,
    itbisRate,
    includeLogo,
    invoiceFooter,
  });
}
