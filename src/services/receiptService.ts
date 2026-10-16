import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Invoice, ShopSettings } from '../types';
import { numberToIndianWords } from '../utils/numberToWords';
import { bluetoothPrinterService } from './bluetoothPrinterService';

export class ReceiptService {
  /**
   * Generate an authentic statutory Indian A4 GST Tax Invoice HTML document
   * Formatted for standard A4 Wi-Fi, LAN, Laser, and Network printers.
   */
  public generateA4GstInvoiceHtml(invoice: Invoice, settings: ShopSettings): string {
    const isInterstate = invoice.isInterstate;
    const formattedDate = new Date(invoice.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = new Date(invoice.date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const amountInWords = numberToIndianWords(Math.round(invoice.grandTotal));

    // Group items by GST rate for statutory HSN / GST summary table
    const taxSummary: {
      [key: string]: {
        hsn: string;
        rate: number;
        taxable: number;
        cgst: number;
        sgst: number;
        igst: number;
        total: number;
      };
    } = {};

    for (const item of invoice.items) {
      const key = `${item.hsn}_${item.gstRate}`;
      if (!taxSummary[key]) {
        taxSummary[key] = {
          hsn: item.hsn || 'General',
          rate: item.gstRate,
          taxable: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: 0,
        };
      }
      taxSummary[key].taxable += item.taxableAmount;
      taxSummary[key].cgst += item.cgstAmount;
      taxSummary[key].sgst += item.sgstAmount;
      taxSummary[key].igst += item.igstAmount;
      taxSummary[key].total += item.cgstAmount + item.sgstAmount + item.igstAmount;
    }

    const itemsRows = invoice.items
      .map(
        (item, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: #1e293b;">${this.escapeHtml(item.productName)}</div>
          <small style="color: #64748b;">Unit: ${item.unit || 'pcs'}</small>
        </td>
        <td style="text-align: center;">${item.hsn || '-'}</td>
        <td style="text-align: center; font-weight: 600;">${item.quantity}</td>
        <td style="text-align: right;">${item.unitPrice.toFixed(2)}</td>
        <td style="text-align: right; font-weight: 600;">${item.taxableAmount.toFixed(2)}</td>
        ${
          !isInterstate
            ? `
            <td style="text-align: right;">${(item.gstRate / 2).toFixed(1)}%<br/><small>₹${item.cgstAmount.toFixed(2)}</small></td>
            <td style="text-align: right;">${(item.gstRate / 2).toFixed(1)}%<br/><small>₹${item.sgstAmount.toFixed(2)}</small></td>
          `
            : `
            <td colspan="2" style="text-align: right;">${item.gstRate}%<br/><small>₹${item.igstAmount.toFixed(2)}</small></td>
          `
        }
        <td style="text-align: right; font-weight: 700; color: #0f172a;">${item.totalAmount.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    const taxSummaryRows = Object.values(taxSummary)
      .map(
        (t) => `
      <tr>
        <td style="text-align: center;">${t.hsn}</td>
        <td style="text-align: right;">₹${t.taxable.toFixed(2)}</td>
        ${
          !isInterstate
            ? `
            <td style="text-align: right;">${(t.rate / 2).toFixed(1)}%</td>
            <td style="text-align: right;">₹${t.cgst.toFixed(2)}</td>
            <td style="text-align: right;">${(t.rate / 2).toFixed(1)}%</td>
            <td style="text-align: right;">₹${t.sgst.toFixed(2)}</td>
          `
            : `
            <td style="text-align: right;">${t.rate}%</td>
            <td style="text-align: right;">₹${t.igst.toFixed(2)}</td>
            <td style="text-align: right;">-</td>
            <td style="text-align: right;">-</td>
          `
        }
        <td style="text-align: right; font-weight: 700;">₹${t.total.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Tax Invoice - ${invoice.invoiceNo}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              font-size: 11px;
              line-height: 1.35;
              margin: 0;
              padding: 0;
              background: #fff;
            }
            .invoice-box {
              border: 1.5px solid #0f172a;
              width: 100%;
              max-width: 210mm;
              margin: 0 auto;
              background: #fff;
            }
            .top-bar {
              background: #0f172a;
              color: #fff;
              text-align: center;
              padding: 6px 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .top-bar h1 {
              margin: 0;
              font-size: 15px;
              letter-spacing: 1.5px;
              font-weight: 800;
            }
            .top-bar span {
              font-size: 9px;
              background: #334155;
              padding: 2px 8px;
              border-radius: 3px;
              font-weight: 600;
            }
            .header-grid {
              display: flex;
              border-bottom: 1px solid #0f172a;
            }
            .seller-box {
              flex: 1.4;
              padding: 10px 14px;
              border-right: 1px solid #0f172a;
            }
            .invoice-meta-box {
              flex: 1;
              padding: 10px 14px;
            }
            .shop-title {
              font-size: 18px;
              font-weight: 900;
              color: #1e1b4b;
              margin: 0 0 2px 0;
            }
            .shop-tagline {
              font-size: 10px;
              color: #64748b;
              margin-bottom: 6px;
              font-style: italic;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
              font-size: 10.5px;
            }
            .meta-label {
              color: #475569;
              font-weight: 600;
            }
            .meta-val {
              color: #0f172a;
              font-weight: 700;
            }
            .buyer-grid {
              display: flex;
              background: #f8fafc;
              border-bottom: 1px solid #0f172a;
            }
            .buyer-col {
              flex: 1;
              padding: 8px 14px;
            }
            .buyer-col:first-child {
              border-right: 1px solid #cbd5e1;
            }
            .section-badge {
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.5px;
              color: #475569;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            table.items-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }
            table.items-table th {
              background: #1e293b;
              color: #fff;
              font-weight: 700;
              padding: 6px 8px;
              border: 1px solid #1e293b;
              text-align: left;
              font-size: 9.5px;
            }
            table.items-table td {
              padding: 6px 8px;
              border: 1px solid #e2e8f0;
              vertical-align: middle;
            }
            table.items-table tbody tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .totals-section {
              display: flex;
              border-top: 1.5px solid #0f172a;
              border-bottom: 1px solid #0f172a;
            }
            .words-and-notes {
              flex: 1.3;
              padding: 10px 14px;
              border-right: 1px solid #0f172a;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .calc-box {
              flex: 1;
              padding: 8px 14px;
              background: #fcfcfc;
            }
            .calc-row {
              display: flex;
              justify-content: space-between;
              padding: 2.5px 0;
              font-size: 10.5px;
            }
            .calc-row.grand {
              border-top: 2px solid #0f172a;
              margin-top: 4px;
              padding-top: 6px;
              font-size: 15px;
              font-weight: 900;
              color: #1e1b4b;
            }
            .tax-summary-block {
              padding: 8px 14px;
              border-bottom: 1px solid #0f172a;
              background: #fff;
            }
            table.tax-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9px;
              margin-top: 4px;
            }
            table.tax-table th {
              background: #e2e8f0;
              color: #334155;
              font-weight: 700;
              padding: 3px 6px;
              border: 1px solid #cbd5e1;
            }
            table.tax-table td {
              padding: 3px 6px;
              border: 1px solid #cbd5e1;
            }
            .footer-grid {
              display: flex;
              min-height: 85px;
            }
            .bank-box {
              flex: 1.3;
              padding: 8px 14px;
              border-right: 1px solid #0f172a;
              font-size: 9.5px;
            }
            .sign-box {
              flex: 1;
              padding: 8px 14px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: right;
            }
            .sign-for {
              font-size: 10px;
              font-weight: 700;
              color: #1e293b;
            }
            .sign-line {
              margin-top: 45px;
              border-top: 1px dashed #64748b;
              padding-top: 4px;
              font-size: 9px;
              font-weight: 700;
              color: #475569;
            }
            .terms-box {
              font-size: 8.5px;
              color: #64748b;
              margin-top: 6px;
              line-height: 1.3;
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <!-- Top Bar -->
            <div class="top-bar">
              <span>ORIGINAL FOR RECIPIENT</span>
              <h1>TAX INVOICE</h1>
              <span>GST SECTION 31</span>
            </div>

            <!-- Seller & Invoice Header -->
            <div class="header-grid">
              <div class="seller-box">
                <div class="shop-title">${this.escapeHtml(settings.shopName)}</div>
                <div class="shop-tagline">${this.escapeHtml(settings.tagline)}</div>
                <div><strong>Address:</strong> ${this.escapeHtml(settings.address)}</div>
                <div><strong>State:</strong> ${this.escapeHtml(settings.state)} (Code: ${settings.stateCode})</div>
                <div style="margin-top: 4px;"><strong>GSTIN / UIN:</strong> <span style="font-family: monospace; font-size: 12px; font-weight: 800; color: #1e40af;">${settings.gstin}</span></div>
                <div><strong>Contact:</strong> ${settings.phone} | ${settings.email}</div>
              </div>

              <div class="invoice-meta-box">
                <div class="meta-row">
                  <span class="meta-label">Invoice No:</span>
                  <span class="meta-val" style="font-size: 13px; color: #1e40af;">${invoice.invoiceNo}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Invoice Date:</span>
                  <span class="meta-val">${formattedDate} ${formattedTime}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Place of Supply:</span>
                  <span class="meta-val">${isInterstate ? 'Other State (Interstate)' : settings.state}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Reverse Charge:</span>
                  <span class="meta-val">No</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Payment Mode:</span>
                  <span class="meta-val" style="color: #059669;">${invoice.paymentMode}</span>
                </div>
              </div>
            </div>

            <!-- Buyer Details -->
            <div class="buyer-grid">
              <div class="buyer-col">
                <div class="section-badge">Billed To (Customer):</div>
                <div style="font-size: 12px; font-weight: 800; color: #0f172a;">${this.escapeHtml(invoice.customerName)}</div>
                <div>Phone: <strong>${invoice.customerPhone || 'Counter Sale'}</strong></div>
                <div>State: ${isInterstate ? 'Interstate' : settings.state}</div>
                <div>GSTIN: <span style="font-family: monospace; font-weight: 700;">${invoice.customerGstin || 'Unregistered Consumer (B2C)'}</span></div>
              </div>

              <div class="buyer-col">
                <div class="section-badge">Shipping / Delivery To:</div>
                <div style="font-size: 11px; font-weight: 700;">${this.escapeHtml(invoice.customerName)}</div>
                <div>Same as Billing Address / Counter POS Delivery</div>
                <div>Invoice Type: <strong>${invoice.isB2B ? 'B2B GST Commercial' : 'B2C Regular Retail'}</strong></div>
              </div>
            </div>

            <!-- Line Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 28px; text-align: center;">#</th>
                  <th>Item Description</th>
                  <th style="width: 55px; text-align: center;">HSN</th>
                  <th style="width: 40px; text-align: center;">Qty</th>
                  <th style="width: 65px; text-align: right;">Rate (₹)</th>
                  <th style="width: 75px; text-align: right;">Taxable (₹)</th>
                  ${
                    !isInterstate
                      ? `
                      <th style="width: 65px; text-align: right;">CGST</th>
                      <th style="width: 65px; text-align: right;">SGST</th>
                    `
                      : `
                      <th colspan="2" style="width: 130px; text-align: right;">IGST</th>
                    `
                  }
                  <th style="width: 80px; text-align: right;">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Totals & Amount in Words -->
            <div class="totals-section">
              <div class="words-and-notes">
                <div>
                  <div class="section-badge">Amount Chargeable (in Words):</div>
                  <div style="font-weight: 800; color: #1e1b4b; font-size: 11.5px; text-transform: uppercase;">
                    ${amountInWords}
                  </div>
                </div>

                <div class="terms-box">
                  <strong>Terms & Conditions:</strong><br/>
                  1. Goods once sold will not be accepted without valid bill.<br/>
                  2. Warranty claims subject to respective manufacturer policies.<br/>
                  3. All disputes are subject to local district jurisdiction.
                </div>
              </div>

              <div class="calc-box">
                <div class="calc-row">
                  <span class="meta-label">Total Items / Qty:</span>
                  <span class="meta-val">${invoice.items.length} items (${invoice.items.reduce((s, i) => s + i.quantity, 0)} units)</span>
                </div>
                <div class="calc-row">
                  <span class="meta-label">Taxable Amount:</span>
                  <span class="meta-val">₹${invoice.taxableAmount.toFixed(2)}</span>
                </div>
                ${
                  !isInterstate
                    ? `
                    <div class="calc-row">
                      <span class="meta-label">Central GST (CGST):</span>
                      <span class="meta-val">₹${invoice.totalCgst.toFixed(2)}</span>
                    </div>
                    <div class="calc-row">
                      <span class="meta-label">State GST (SGST):</span>
                      <span class="meta-val">₹${invoice.totalSgst.toFixed(2)}</span>
                    </div>
                  `
                    : `
                    <div class="calc-row">
                      <span class="meta-label">Integrated GST (IGST):</span>
                      <span class="meta-val">₹${invoice.totalIgst.toFixed(2)}</span>
                    </div>
                  `
                }
                ${
                  invoice.discount > 0
                    ? `
                    <div class="calc-row" style="color: #059669;">
                      <span class="meta-label" style="color: #059669;">Discount:</span>
                      <span class="meta-val" style="color: #059669;">-₹${invoice.discount.toFixed(2)}</span>
                    </div>
                  `
                    : ''
                }
                <div class="calc-row grand">
                  <span>GRAND TOTAL:</span>
                  <span>₹${Math.round(invoice.grandTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- Statutory HSN / Tax Breakdown Summary -->
            <div class="tax-summary-block">
              <div class="section-badge">Tax Computation Analysis (HSN / SAC Wise):</div>
              <table class="tax-table">
                <thead>
                  <tr>
                    <th style="width: 15%; text-align: center;">HSN / SAC</th>
                    <th style="width: 17%; text-align: right;">Taxable Value</th>
                    <th style="width: 10%; text-align: right;">CGST %</th>
                    <th style="width: 15%; text-align: right;">CGST Amt</th>
                    <th style="width: 10%; text-align: right;">SGST %</th>
                    <th style="width: 15%; text-align: right;">SGST Amt</th>
                    <th style="width: 18%; text-align: right;">Total Tax</th>
                  </tr>
                </thead>
                <tbody>
                  ${taxSummaryRows}
                </tbody>
              </table>
            </div>

            <!-- Bank Details & Signature -->
            <div class="footer-grid">
              <div class="bank-box">
                <div class="section-badge">Bank & Remittance Details:</div>
                <div><strong>Bank Name:</strong> State Bank of India / HDFC Bank</div>
                <div><strong>A/C No:</strong> 50200012345678</div>
                <div><strong>IFSC Code:</strong> SBIN0001234</div>
                <div><strong>UPI Pay ID:</strong> ${settings.phone}@upi</div>
                <div style="margin-top: 4px; color: #64748b;">${this.escapeHtml(settings.receiptFooter)}</div>
              </div>

              <div class="sign-box">
                <div class="sign-for">For ${this.escapeHtml(settings.shopName)}</div>
                <div class="sign-line">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate authentic thermal receipt HTML (58mm or 80mm format)
   */
  public generateThermalReceiptHtml(
    invoice: Invoice,
    settings: ShopSettings,
    widthMm: 58 | 80 = 80
  ): string {
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
        <td style="padding: 3px 0; text-align: left; vertical-align: top;">
          <strong>${idx + 1}. ${this.escapeHtml(item.productName)}</strong><br/>
          <small style="color: #555;">HSN: ${item.hsn} | GST: ${item.gstRate}%</small>
        </td>
        <td style="padding: 3px 0; text-align: center; vertical-align: top;">${item.quantity} ${item.unit || 'pcs'}</td>
        <td style="padding: 3px 0; text-align: right; vertical-align: top;">${settings.currencySymbol}${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 3px 0; text-align: right; vertical-align: top; font-weight: bold;">${settings.currencySymbol}${item.totalAmount.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            @page {
              margin: 2mm;
              size: ${widthMm}mm auto;
            }
            body {
              font-family: 'Courier New', Courier, monospace, -apple-system;
              font-size: ${widthMm === 58 ? '10px' : '11px'};
              line-height: 1.3;
              color: #111;
              background: #fff;
              padding: 4px;
              width: 100%;
              max-width: ${widthMm}mm;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 6px;
            }
            .shop-title {
              font-size: ${widthMm === 58 ? '13px' : '15px'};
              font-weight: bold;
              text-transform: uppercase;
              margin: 0;
            }
            .shop-info {
              font-size: 9.5px;
              color: #333;
              margin: 2px 0;
            }
            .tax-badge {
              display: inline-block;
              font-weight: bold;
              border: 1px dashed #111;
              padding: 2px 6px;
              margin: 4px 0;
              font-size: 10px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 6px 0;
            }
            .double-divider {
              border-top: 2px solid #000;
              margin: 6px 0;
            }
            .meta-line {
              display: flex;
              justify-content: space-between;
              font-size: 9.5px;
            }
            table.items-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9.5px;
              margin: 6px 0;
            }
            table.items-table th {
              border-bottom: 1px dashed #000;
              padding: 3px 0;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              font-size: 10.5px;
              margin: 2px 0;
            }
            .grand-total {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              font-weight: bold;
              margin: 4px 0;
            }
            .footer {
              text-align: center;
              font-size: 9px;
              margin-top: 8px;
              padding-top: 4px;
              border-top: 1px dashed #000;
            }
            .barcode-box {
              text-align: center;
              font-family: 'Courier New', monospace;
              letter-spacing: 2px;
              font-weight: bold;
              margin: 6px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="shop-title">${this.escapeHtml(settings.shopName)}</h1>
            <div class="shop-info">${this.escapeHtml(settings.address)}</div>
            <div class="shop-info">Phone: ${settings.phone}</div>
            <div class="shop-info">GSTIN: <strong>${settings.gstin}</strong></div>
            <div class="tax-badge">TAX INVOICE (RETAIL / CASH)</div>
          </div>

          <div class="divider"></div>

          <div class="meta-line">
            <span>Bill No: <strong>${invoice.invoiceNo}</strong></span>
            <span>Date: ${formattedDate}</span>
          </div>
          <div class="meta-line">
            <span>Cust: ${this.escapeHtml(invoice.customerName)}</span>
            <span>Pay: ${invoice.paymentMode}</span>
          </div>
          ${
            invoice.customerGstin
              ? `<div class="meta-line"><span>Cust GST: ${invoice.customerGstin}</span></div>`
              : ''
          }

          <div class="divider"></div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="text-align: left; width: 45%;">Item</th>
                <th style="text-align: center; width: 15%;">Qty</th>
                <th style="text-align: right; width: 20%;">Price</th>
                <th style="text-align: right; width: 20%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="totals-row">
            <span>Taxable Amount:</span>
            <span>${settings.currencySymbol}${invoice.taxableAmount.toFixed(2)}</span>
          </div>
          ${
            !isInterstate
              ? `
              <div class="totals-row">
                <span>CGST:</span>
                <span>${settings.currencySymbol}${invoice.totalCgst.toFixed(2)}</span>
              </div>
              <div class="totals-row">
                <span>SGST:</span>
                <span>${settings.currencySymbol}${invoice.totalSgst.toFixed(2)}</span>
              </div>
            `
              : `
              <div class="totals-row">
                <span>IGST:</span>
                <span>${settings.currencySymbol}${invoice.totalIgst.toFixed(2)}</span>
              </div>
            `
          }

          <div class="double-divider"></div>

          <div class="grand-total">
            <span>GRAND TOTAL:</span>
            <span>${settings.currencySymbol}${Math.round(invoice.grandTotal).toFixed(2)}</span>
          </div>

          ${
            invoice.paymentMode === 'Cash' && invoice.cashTendered
              ? `
              <div class="totals-row" style="font-size: 9.5px;">
                <span>Cash Received:</span>
                <span>${settings.currencySymbol}${invoice.cashTendered.toFixed(2)}</span>
              </div>
              <div class="totals-row" style="font-size: 9.5px; font-weight: bold;">
                <span>Change Due:</span>
                <span>${settings.currencySymbol}${(invoice.changeDue || 0).toFixed(2)}</span>
              </div>
            `
              : ''
          }

          <div class="barcode-box">*${invoice.invoiceNo}*</div>

          <div class="footer">
            <div>${this.escapeHtml(settings.receiptFooter)}</div>
            <div>Items: ${invoice.items.length} | Units: ${invoice.items.reduce((s, i) => s + i.quantity, 0)}</div>
            <div>*** Powered by DigiKart POS ***</div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Print full A4 GST Tax Invoice to connected Wi-Fi / Network / System Printer
   */
  public async printA4Wifi(
    invoice: Invoice,
    settings: ShopSettings
  ): Promise<{ success: boolean; message?: string }> {
    const html = this.generateA4GstInvoiceHtml(invoice, settings);

    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 350);
        return { success: true, message: 'Opening A4 GST Invoice print window.' };
      }
    }

    try {
      await Print.printAsync({ html });
      return {
        success: true,
        message: `A4 GST Invoice #${invoice.invoiceNo} sent to Wi-Fi / Network printer.`,
      };
    } catch (e: any) {
      console.warn('Wi-Fi A4 print error:', e);
      return { success: false, message: e?.message || 'Print error' };
    }
  }

  /**
   * Print fast thermal roll slip to wireless Bluetooth Thermal Printer (80mm / 58mm)
   */
  public async printThermalBluetooth(
    invoice: Invoice,
    settings: ShopSettings,
    widthMm: 58 | 80 = 80
  ): Promise<{ success: boolean; message?: string }> {
    // 1. Try ESC/POS Direct Bluetooth stream if connected
    if (bluetoothPrinterService.getConnectedDevice()?.connected) {
      const res = await bluetoothPrinterService.printEscPos(invoice, settings, widthMm);
      if (res.success) {
        return res;
      }
    }

    // 2. Mobile print spooler with thermal paper width
    const html = this.generateThermalReceiptHtml(invoice, settings, widthMm);
    const paperWidthPixels = widthMm === 58 ? 164 : 226;

    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 350);
        return { success: true, message: `Thermal slip (${widthMm}mm) sent to printer.` };
      }
    }

    try {
      await Print.printAsync({
        html,
        width: paperWidthPixels,
      });
      return {
        success: true,
        message: `Thermal receipt (${widthMm}mm) sent to Bluetooth thermal printer spooler.`,
      };
    } catch (e: any) {
      console.warn('Thermal Bluetooth print error:', e);
      return { success: false, message: e?.message || 'Bluetooth print failed' };
    }
  }

  /**
   * Share Invoice PDF (either A4 Tax Invoice or Thermal Slip)
   */
  public async shareInvoicePdf(
    invoice: Invoice,
    settings: ShopSettings,
    format: 'a4' | 'thermal' = 'a4'
  ): Promise<void> {
    const html =
      format === 'a4'
        ? this.generateA4GstInvoiceHtml(invoice, settings)
        : this.generateThermalReceiptHtml(invoice, settings, 80);

    try {
      const { uri } = await Print.printToFileAsync({
        html,
        width: format === 'a4' ? undefined : 226,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `${format === 'a4' ? 'A4 Tax Invoice' : 'Thermal Slip'} ${invoice.invoiceNo}`,
        });
      }
    } catch (e) {
      console.warn('Sharing error:', e);
    }
  }

  public async printOrShareReceipt(invoice: Invoice, settings: ShopSettings): Promise<void> {
    await this.printA4Wifi(invoice, settings);
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
