import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Invoice, ShopSettings } from '../types';

export class ReceiptService {
  /**
   * Generate an authentic thermal receipt HTML document (58mm / 80mm format)
   */
  public generateThermalReceiptHtml(invoice: Invoice, settings: ShopSettings): string {
    const isInterstate = invoice.isInterstate;
    const formattedDate = new Date(invoice.date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const itemsRows = invoice.items
      .map(
        (item, idx) => `
      <tr>
        <td style="padding: 4px 0; text-align: left; vertical-align: top;">
          <strong>${idx + 1}. ${this.escapeHtml(item.productName)}</strong><br/>
          <small style="color: #555;">HSN: ${item.hsn} | GST: ${item.gstRate}%</small>
        </td>
        <td style="padding: 4px 0; text-align: center; vertical-align: top;">${item.quantity} ${item.unit}</td>
        <td style="padding: 4px 0; text-align: right; vertical-align: top;">${settings.currencySymbol}${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 4px 0; text-align: right; vertical-align: top; font-weight: bold;">${settings.currencySymbol}${item.totalAmount.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    // Group items by GST rate for the statutory GST tax breakdown table
    const taxSummary: {
      [rate: number]: {
        taxable: number;
        cgst: number;
        sgst: number;
        igst: number;
        total: number;
      };
    } = {};

    for (const item of invoice.items) {
      if (!taxSummary[item.gstRate]) {
        taxSummary[item.gstRate] = { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
      }
      taxSummary[item.gstRate].taxable += item.taxableAmount;
      taxSummary[item.gstRate].cgst += item.cgstAmount;
      taxSummary[item.gstRate].sgst += item.sgstAmount;
      taxSummary[item.gstRate].igst += item.igstAmount;
      taxSummary[item.gstRate].total += item.cgstAmount + item.sgstAmount + item.igstAmount;
    }

    const taxRows = Object.entries(taxSummary)
      .map(([rateStr, t]) => {
        const rate = Number(rateStr);
        if (isInterstate) {
          return `
            <tr>
              <td style="text-align: left;">${rate}%</td>
              <td style="text-align: right;">${settings.currencySymbol}${t.taxable.toFixed(2)}</td>
              <td style="text-align: right;">${settings.currencySymbol}${t.igst.toFixed(2)}</td>
              <td style="text-align: right;">${settings.currencySymbol}${t.total.toFixed(2)}</td>
            </tr>
          `;
        } else {
          return `
            <tr>
              <td style="text-align: left;">${rate}%</td>
              <td style="text-align: right;">${settings.currencySymbol}${t.taxable.toFixed(2)}</td>
              <td style="text-align: right;">${settings.currencySymbol}${t.cgst.toFixed(2)}</td>
              <td style="text-align: right;">${settings.currencySymbol}${t.sgst.toFixed(2)}</td>
            </tr>
          `;
        }
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            @page {
              margin: 4mm;
              size: 80mm auto;
            }
            body {
              font-family: 'Courier New', Courier, monospace, -apple-system;
              font-size: 11px;
              line-height: 1.35;
              color: #111;
              background: #fff;
              padding: 6px;
              margin: 0 auto;
              max-width: 320px;
            }
            .header {
              text-align: center;
              margin-bottom: 8px;
            }
            .shop-title {
              font-size: 16px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0;
            }
            .tagline {
              font-size: 10px;
              color: #444;
              margin: 2px 0 6px 0;
            }
            .gst-badge {
              font-size: 11px;
              font-weight: bold;
              display: inline-block;
              padding: 2px 6px;
              border: 1px dashed #000;
              margin: 3px 0;
            }
            .meta-info {
              font-size: 10px;
              margin-bottom: 6px;
            }
            .divider {
              border-top: 1px dashed #444;
              margin: 6px 0;
            }
            .double-divider {
              border-top: 2px solid #000;
              margin: 6px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10.5px;
            }
            th {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 4px 0;
              font-weight: bold;
              text-align: left;
            }
            .tax-table th {
              font-size: 9.5px;
              padding: 2px 0;
            }
            .tax-table td {
              font-size: 9.5px;
              padding: 2px 0;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
            }
            .grand-total {
              font-size: 15px;
              font-weight: 900;
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
            }
            .footer {
              text-align: center;
              font-size: 9.5px;
              margin-top: 10px;
              color: #333;
            }
            .barcode-box {
              text-align: center;
              margin: 10px 0;
              font-family: 'Courier New', monospace;
              letter-spacing: 4px;
              font-size: 14px;
              font-weight: bold;
              padding: 4px;
              border-top: 1px solid #ddd;
              border-bottom: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="shop-title">${this.escapeHtml(settings.shopName)}</h1>
            <p class="tagline">${this.escapeHtml(settings.tagline)}</p>
            <div>${this.escapeHtml(settings.address)}</div>
            <div>Phone: ${this.escapeHtml(settings.phone)} | State: ${this.escapeHtml(settings.state)} (${settings.stateCode})</div>
            <div class="gst-badge">GSTIN: ${this.escapeHtml(settings.gstin)}</div>
            <div style="font-weight: bold; margin-top: 4px;">${this.escapeHtml(settings.receiptHeader)}</div>
          </div>

          <div class="divider"></div>

          <div class="meta-info">
            <div style="display: flex; justify-content: space-between;">
              <span><strong>Invoice:</strong> ${invoice.invoiceNo}</span>
              <span><strong>Date:</strong> ${formattedDate}</span>
            </div>
            ${
              invoice.customerName
                ? `<div><strong>Customer:</strong> ${this.escapeHtml(invoice.customerName)} ${
                    invoice.customerPhone ? '(' + this.escapeHtml(invoice.customerPhone) + ')' : ''
                  }</div>`
                : ''
            }
            ${
              invoice.customerGstin
                ? `<div><strong>Cust GSTIN:</strong> ${this.escapeHtml(invoice.customerGstin)} (B2B Tax Invoice)</div>`
                : '<div><strong>Type:</strong> B2C Retail Invoice</div>'
            }
            <div><strong>Payment:</strong> ${invoice.paymentMode} ${invoice.paymentRef ? `(${invoice.paymentRef})` : ''}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 46%;">ITEM</th>
                <th style="width: 14%; text-align: center;">QTY</th>
                <th style="width: 20%; text-align: right;">RATE</th>
                <th style="width: 20%; text-align: right;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="divider"></div>

          <div>
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${settings.currencySymbol}${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${
              invoice.discount > 0
                ? `<div class="totals-row" style="color: #059669;">
                    <span>Discount:</span>
                    <span>-${settings.currencySymbol}${invoice.discount.toFixed(2)}</span>
                  </div>`
                : ''
            }
            <div class="totals-row">
              <span>Taxable Value:</span>
              <span>${settings.currencySymbol}${invoice.taxableAmount.toFixed(2)}</span>
            </div>
            ${
              !isInterstate
                ? `
                <div class="totals-row">
                  <span>CGST Total:</span>
                  <span>${settings.currencySymbol}${invoice.totalCgst.toFixed(2)}</span>
                </div>
                <div class="totals-row">
                  <span>SGST Total:</span>
                  <span>${settings.currencySymbol}${invoice.totalSgst.toFixed(2)}</span>
                </div>
                `
                : `
                <div class="totals-row">
                  <span>IGST Total:</span>
                  <span>${settings.currencySymbol}${invoice.totalIgst.toFixed(2)}</span>
                </div>
                `
            }
          </div>

          <div class="double-divider"></div>

          <div class="grand-total">
            <span>GRAND TOTAL:</span>
            <span>${settings.currencySymbol}${Math.round(invoice.grandTotal).toFixed(2)}</span>
          </div>

          ${
            invoice.paymentMode === 'Cash' && invoice.cashTendered
              ? `
              <div class="totals-row" style="font-size: 10px;">
                <span>Cash Received:</span>
                <span>${settings.currencySymbol}${invoice.cashTendered.toFixed(2)}</span>
              </div>
              <div class="totals-row" style="font-size: 10px; font-weight: bold;">
                <span>Change Returned:</span>
                <span>${settings.currencySymbol}${(invoice.changeDue || 0).toFixed(2)}</span>
              </div>
            `
              : ''
          }

          <div class="divider"></div>

          <div style="font-weight: bold; margin-bottom: 3px; font-size: 10px;">GST TAX ANALYSIS:</div>
          <table class="tax-table">
            <thead>
              <tr>
                <th style="width: 25%;">RATE</th>
                <th style="width: 25%; text-align: right;">TAXABLE</th>
                ${
                  !isInterstate
                    ? `<th style="width: 25%; text-align: right;">CGST</th><th style="width: 25%; text-align: right;">SGST</th>`
                    : `<th style="width: 25%; text-align: right;">IGST</th><th style="width: 25%; text-align: right;">TOTAL</th>`
                }
              </tr>
            </thead>
            <tbody>
              ${taxRows}
            </tbody>
          </table>

          <div class="barcode-box">
            *${invoice.invoiceNo}*
          </div>

          <div class="footer">
            <div>${this.escapeHtml(settings.receiptFooter)}</div>
            <div style="margin-top: 4px;">Items Sold: ${invoice.items.reduce((s, i) => s + i.quantity, 0)} | Thank you!</div>
          </div>
        </body>
      </html>
    `;
  }

  public async printOrShareReceipt(invoice: Invoice, settings: ShopSettings): Promise<void> {
    const html = this.generateThermalReceiptHtml(invoice, settings);

    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 350);
      }
      return;
    }

    try {
      const { uri } = await Print.printToFileAsync({ html, width: 226, height: 400 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Tax Invoice ${invoice.invoiceNo}`,
        });
      } else {
        await Print.printAsync({ html });
      }
    } catch (e) {
      console.warn('Print error fallback:', e);
    }
  }

  private escapeHtml(text?: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export const receiptService = new ReceiptService();
