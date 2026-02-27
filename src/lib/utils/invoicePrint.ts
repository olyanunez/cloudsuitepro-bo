import { Invoice } from '@/lib/services/posService';
import { Tenant } from '@/lib/services/tenantService';
import { NcfType, ncfTypeLabels } from '@/lib/services/ncfService';
import { formatCurrency } from '@/lib/utils';

interface PrintInvoiceOptions {
  invoice: Invoice;
  tenantInfo: Tenant | null;
  itbisRate: number;
  includeLogo?: boolean;
  invoiceFooter?: string;
  termsAndConditions?: string;
  isExemptFromTax?: boolean;
  taxExemptionReason?: string;
}

export function printInvoice({
  invoice,
  tenantInfo,
  itbisRate,
  includeLogo = true,
  invoiceFooter,
  termsAndConditions,
  isExemptFromTax = false,
  taxExemptionReason
}: PrintInvoiceOptions) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('No se pudo abrir la ventana de impresión. Por favor, permita las ventanas emergentes.');
  }

  const paymentMethodLabels: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    CHECK: 'Cheque',
    CREDIT: 'Crédito',
  };

  // Obtener el label del tipo de NCF si existe
  const ncfTypeLabel = invoice.ncfType
    ? ncfTypeLabels[invoice.ncfType as NcfType]
    : '';

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Factura ${invoice.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            padding: 20px;
            font-size: 11pt;
            line-height: 1.4;
          }
          .invoice-container { max-width: 210mm; margin: 0 auto; }

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

          /* Información de la factura */
          .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
            font-size: 10pt;
          }
          .invoice-info .info-group {
            padding: 10px;
            background-color: #fafafa;
            border-radius: 4px;
          }
          .invoice-info .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            padding: 2px 0;
          }
          .invoice-info .row:last-child {
            margin-bottom: 0;
          }
          .invoice-info .row .label {
            font-weight: 600;
            color: #555;
          }
          .invoice-info .row .value {
            font-weight: 500;
          }

          /* Tabla de productos */
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th {
            text-align: left;
            border-bottom: 2px solid #000;
            padding: 10px 6px;
            font-size: 10pt;
            font-weight: bold;
            background-color: #e8e8e8;
          }
          .items-table td {
            padding: 8px 6px;
            font-size: 10pt;
            border-bottom: 1px solid #ddd;
          }
          .items-table .product-name {
            font-weight: 600;
            margin-bottom: 2px;
          }
          .items-table .product-code {
            font-size: 9pt;
            color: #666;
          }
          .items-table .text-right {
            text-align: right;
          }
          .items-table .text-center {
            text-align: center;
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
            background-color: #f5f5f5;
            padding: 12px 8px;
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
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header con información de la empresa -->
          <div class="company-header">
            ${includeLogo && tenantInfo?.logo ? `<img src="${tenantInfo.logo}" alt="Logo" class="logo" />` : ''}
            <h1>${tenantInfo?.name || 'CloudSuite Pro'}</h1>
            ${tenantInfo?.address ? `<p class="company-info">${tenantInfo.address}</p>` : ''}
            ${tenantInfo?.phone ? `<p class="company-info">Tel: ${tenantInfo.phone}</p>` : ''}
            ${tenantInfo?.email ? `<p class="company-info">Email: ${tenantInfo.email}</p>` : ''}
            ${tenantInfo?.taxId ? `<p class="rnc">RNC: ${tenantInfo.taxId}</p>` : ''}
          </div>

          <!-- Sección de información fiscal (NCF) -->
          ${invoice.ncf || invoice.ncfType ? `
          <div class="fiscal-section">
            ${invoice.ncf ? `
            <div class="ncf-row">
              <span class="ncf-label">Comprobante Fiscal (NCF):</span>
              <span class="ncf-value">${invoice.ncf}</span>
            </div>
            ` : ''}
            ${ncfTypeLabel ? `
            <div class="ncf-row">
              <span class="ncf-label">Tipo:</span>
              <span class="ncf-type">${ncfTypeLabel}</span>
            </div>
            ` : ''}
            ${invoice.ncfValidUntil ? `
            <div class="ncf-row">
              <span class="ncf-label">NCF Válido hasta:</span>
              <span class="ncf-validity">${new Date(invoice.ncfValidUntil).toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</span>
            </div>
            ` : ''}
          </div>
          ` : ''}

          <!-- Información de la factura -->
          <div class="invoice-info">
            <div class="info-group">
              <div class="row">
                <span class="label">Factura No:</span>
                <span class="value">${invoice.invoiceNumber}</span>
              </div>
              <div class="row">
                <span class="label">Fecha:</span>
                <span class="value">${new Date(invoice.createdAt).toLocaleString('es-DO', {
    dateStyle: 'short',
    timeStyle: 'short'
  })}</span>
              </div>
              <div class="row">
                <span class="label">Sucursal:</span>
                <span class="value">${invoice.branch?.name || 'N/A'}</span>
              </div>
              <div class="row">
                <span class="label">Cajero:</span>
                <span class="value">${invoice.user?.name || 'N/A'}</span>
              </div>
            </div>

            <div class="info-group">
              ${invoice.customerName || invoice.customerRnc ? `
              <div class="row">
                <span class="label">Cliente:</span>
                <span class="value">${invoice.customerName || 'N/A'}</span>
              </div>
              ${invoice.customerRnc ? `
              <div class="row">
                <span class="label">RNC/Cédula:</span>
                <span class="value">${invoice.customerRnc}</span>
              </div>
              ` : ''}
              ` : `
              <div class="row">
                <span class="label">Cliente:</span>
                <span class="value">Consumidor Final</span>
              </div>
              `}
              <div class="row">
                <span class="label">Pago:</span>
                <span class="value">${paymentMethodLabels[invoice.paymentMethod] || invoice.paymentMethod}</span>
              </div>
              ${invoice.paymentReference ? `
              <div class="row">
                <span class="label">Ref. Pago:</span>
                <span class="value">${invoice.paymentReference}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Tabla de productos -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-center">Cant.</th>
                <th class="text-right">Precio</th>
                <th class="text-right">ITBIS</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => {
    // Calcular valores correctamente según tipo de factura
    const unitPriceValue = parseFloat(item.unitPrice.toString());
    const quantity = item.quantity;

    let itemPrice, itemTax, itemTotal;

    if (isExemptFromTax && taxExemptionReason) {
      // Facturas B14, B15, B16 - Exentas
      itemPrice = unitPriceValue * quantity;
      itemTax = 0;
      itemTotal = itemPrice;
    } else {
      // Facturas B01, B02 - Calcular ITBIS sobre el precio
      itemPrice = unitPriceValue * quantity;
      itemTax = itemPrice * itbisRate;
      itemTotal = itemPrice + itemTax;
    }

    return `
                <tr>
                  <td>
                    <div class="product-name">${item.variant.product.name}${item.variant.name ? ` - ${item.variant.name}` : ''}</div>
                  </td>
                  <td class="text-center">${quantity}</td>
                  <td class="text-right">${formatCurrency(itemPrice)}</td>
                  <td class="text-right">${formatCurrency(itemTax)}</td>
                  <td class="text-right">${formatCurrency(itemTotal)}</td>
                </tr>
                `;
  }).join('')}
            </tbody>
          </table>

          <!-- Totales con desglose de ITBIS -->
          <div class="totals">
            ${(() => {
      // Usar directamente los valores que vienen del backend
      // El backend ya calculó correctamente si hay ITBIS o no según el tipo de cliente
      const invoiceSubtotal = parseFloat(invoice.subtotal.toString());
      const invoiceTax = parseFloat(invoice.tax.toString());
      const invoiceDiscount = parseFloat(invoice.discount.toString());
      const invoiceTotal = parseFloat(invoice.total.toString());

      return `
                <div class="row">
                  <span class="label">Subtotal${invoiceTax > 0 ? ' (sin ITBIS)' : ''}:</span>
                  <span class="value">${formatCurrency(invoiceSubtotal)}</span>
                </div>
                ${invoiceTax > 0 ? `
                <div class="row itbis-row">
                  <span class="label">ITBIS (${(itbisRate * 100).toFixed(0)}%):</span>
                  <span class="value">${formatCurrency(invoiceTax)}</span>
                </div>
                ` : invoiceTax === 0 && isExemptFromTax && taxExemptionReason ? `
                <div class="row" style="background-color: #d4edda; border: 1px solid #28a745; padding: 8px; margin: 5px 0; border-radius: 4px;">
                  <span class="label" style="color: #155724; font-weight: bold;">ITBIS - EXENTO:</span>
                  <span class="value" style="color: #155724; font-weight: bold;">${formatCurrency(0)}</span>
                </div>
                <div style="font-size: 9pt; color: #155724; margin: 5px 0; padding: 5px 8px; background-color: #d4edda; border-radius: 4px;">
                  <em>${taxExemptionReason}</em>
                </div>
                ` : `
                <div class="row">
                  <span class="label">ITBIS:</span>
                  <span class="value">${formatCurrency(0)}</span>
                </div>
                `}
                ${invoiceDiscount > 0 ? `
                <div class="row">
                  <span class="label">Descuento:</span>
                  <span class="value">-${formatCurrency(invoiceDiscount).replace('RD$', 'RD$ ')}</span>
                </div>
                ` : ''}
                <div class="row total-row">
                  <span class="label">TOTAL A PAGAR:</span>
                  <span class="value">${formatCurrency(invoiceTotal)}</span>
                </div>
              `;
    })()}
          </div>

          ${termsAndConditions ? `
          <!-- Términos y Condiciones -->
          <div style="margin-top: 25px; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;">
            <h3 style="font-size: 11pt; margin-bottom: 8px; font-weight: bold;">Términos y Condiciones</h3>
            <p style="font-size: 9pt; line-height: 1.4; white-space: pre-wrap; margin: 0;">${termsAndConditions}</p>
          </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            ${invoiceFooter ? `
              <p><strong>${invoiceFooter}</strong></p>
            ` : `
              <p><strong>¡Gracias por su preferencia!</strong></p>
            `}
            <p>Conserve este comprobante para fines fiscales</p>
            ${invoice.ncf ? `
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
