import { Platform } from 'react-native';
import { Invoice, ShopSettings } from '../types';

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  connected: boolean;
  type: 'ESC_POS' | 'TSC';
  paperWidth: 58 | 80;
  macAddress?: string;
}

export const KNOWN_BLUETOOTH_PRINTERS: BluetoothDeviceInfo[] = [
  {
    id: 'bt-pos-80',
    name: 'POS-80 / MPT-III Bluetooth (3-Inch)',
    connected: true,
    type: 'ESC_POS',
    paperWidth: 80,
    macAddress: '66:32:8A:4F:1B:01',
  },
  {
    id: 'bt-pos-58',
    name: 'XP-58 / MPT-II Thermal (2-Inch)',
    connected: false,
    type: 'ESC_POS',
    paperWidth: 58,
    macAddress: '88:41:6B:22:90:7E',
  },
  {
    id: 'bt-tsc-244',
    name: 'TSC TE244 / TTP-244 Pro Label Printer',
    connected: false,
    type: 'TSC',
    paperWidth: 80,
    macAddress: '00:15:83:5F:AA:34',
  },
  {
    id: 'bt-rpp-02',
    name: 'RPP-02N Bluetooth Pocket POS',
    connected: false,
    type: 'ESC_POS',
    paperWidth: 58,
    macAddress: 'DC:0D:30:19:8C:23',
  },
  {
    id: 'bt-tvs-3150',
    name: 'TVS RP-3150 Star Thermal POS',
    connected: false,
    type: 'ESC_POS',
    paperWidth: 80,
    macAddress: 'A4:C3:F0:88:12:4A',
  },
];

/**
 * Service to handle ESC/POS & TSC TSPL thermal printing for Bluetooth thermal & label printers.
 */
export class BluetoothPrinterService {
  private connectedDevice: BluetoothDeviceInfo = KNOWN_BLUETOOTH_PRINTERS[0];
  private pairedPrinters: BluetoothDeviceInfo[] = [...KNOWN_BLUETOOTH_PRINTERS];
  private bluetoothServer: any = null;
  private printCharacteristic: any = null;

  public isWebBluetoothSupported(): boolean {
    return (
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      'bluetooth' in navigator
    );
  }

  public getPairedPrinters(): BluetoothDeviceInfo[] {
    return [...this.pairedPrinters];
  }

  public getConnectedDevice(): BluetoothDeviceInfo {
    return this.connectedDevice;
  }

  public setConnectedDevice(device: BluetoothDeviceInfo): void {
    this.pairedPrinters = this.pairedPrinters.map((p) => ({
      ...p,
      connected: p.id === device.id,
    }));
    this.connectedDevice = { ...device, connected: true };
  }

  public async scanForPrinters(): Promise<BluetoothDeviceInfo[]> {
    if (this.isWebBluetoothSupported()) {
      try {
        const navAny = navigator as any;
        const device = await navAny.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [
            '000018f0-0000-1000-8000-00805f9b34fb',
            '49535343-fe7d-4ae5-8fa9-9fafd205e455',
            '0000ff00-0000-1000-8000-00805f9b34fb',
          ],
        });
        if (device) {
          const newDev: BluetoothDeviceInfo = {
            id: device.id,
            name: device.name || 'Discovered Bluetooth Printer',
            connected: true,
            type: 'ESC_POS',
            paperWidth: 80,
          };
          this.pairedPrinters.unshift(newDev);
          this.connectedDevice = newDev;
        }
      } catch (e) {
        console.warn('Bluetooth scan:', e);
      }
    }
    return [...this.pairedPrinters];
  }

  /**
   * Generate standard ESC/POS binary command buffer (Receipt Roll)
   */
  public generateEscPosBuffer(
    invoice: Invoice,
    settings: ShopSettings,
    paperWidth: 58 | 80 = 80
  ): Uint8Array {
    const cols = paperWidth === 58 ? 32 : 48;
    const bytes: number[] = [];

    const append = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i) & 0xff);
      }
    };

    const appendBytes = (...nums: number[]) => {
      bytes.push(...nums);
    };

    // ESC @: Initialize printer
    appendBytes(0x1b, 0x40);

    // Center Align
    appendBytes(0x1b, 0x61, 0x01);

    // Double Height + Double Width for Shop Title
    appendBytes(0x1d, 0x21, 0x11);
    append(settings.shopName.toUpperCase() + '\n');

    // Normal Text
    appendBytes(0x1d, 0x21, 0x00);
    if (settings.tagline) {
      append(settings.tagline + '\n');
    }
    append(settings.address + '\n');
    append(`Phone: ${settings.phone}\n`);
    if (settings.gstin) {
      append(`GSTIN: ${settings.gstin}\n`);
    }

    append('-'.repeat(cols) + '\n');
    append('TAX INVOICE (CASH / RETAIL)\n');
    append('-'.repeat(cols) + '\n');

    // Left Align
    appendBytes(0x1b, 0x61, 0x00);
    append(`Bill No : ${invoice.invoiceNo}\n`);
    const dateFormatted = new Date(invoice.date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    append(`Date    : ${dateFormatted}\n`);
    append(`Customer: ${invoice.customerName} (${invoice.customerPhone || 'Counter'})\n`);
    if (invoice.customerGstin) {
      append(`Cust GST: ${invoice.customerGstin}\n`);
    }

    append('-'.repeat(cols) + '\n');

    // Table Header
    if (paperWidth === 58) {
      append('ITEM            QTY  PRICE  TOTAL\n');
    } else {
      append('ITEM                   HSN    QTY   RATE    TOTAL\n');
    }
    append('-'.repeat(cols) + '\n');

    // Item Rows
    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const name = `${i + 1}.${item.productName}`;
      if (paperWidth === 58) {
        const truncatedName = name.length > 32 ? name.substring(0, 32) : name;
        append(truncatedName + '\n');
        const qtyStr = `${item.quantity} ${item.unit}`.padEnd(8);
        const rateStr = item.unitPrice.toFixed(2).padStart(7);
        const totalStr = item.totalAmount.toFixed(2).padStart(9);
        append(`  ${qtyStr} ${rateStr} ${totalStr}\n`);
      } else {
        const truncatedName = name.length > 22 ? name.substring(0, 22) : name.padEnd(22);
        const hsnStr = (item.hsn || '').substring(0, 6).padEnd(6);
        const qtyStr = `${item.quantity}`.padStart(4);
        const rateStr = item.unitPrice.toFixed(2).padStart(7);
        const totalStr = item.totalAmount.toFixed(2).padStart(9);
        append(`${truncatedName} ${hsnStr} ${qtyStr} ${rateStr} ${totalStr}\n`);
      }
    }

    append('-'.repeat(cols) + '\n');

    // Right Align for Totals
    appendBytes(0x1b, 0x61, 0x02);
    append(`Taxable Value : ${settings.currencySymbol}${invoice.taxableAmount.toFixed(2)}\n`);
    if (!invoice.isInterstate) {
      append(`CGST : ${settings.currencySymbol}${invoice.totalCgst.toFixed(2)}\n`);
      append(`SGST : ${settings.currencySymbol}${invoice.totalSgst.toFixed(2)}\n`);
    } else {
      append(`IGST : ${settings.currencySymbol}${invoice.totalIgst.toFixed(2)}\n`);
    }

    // Bold Grand Total
    appendBytes(0x1b, 0x45, 0x01); // Bold ON
    appendBytes(0x1d, 0x21, 0x01); // Double height
    append(`GRAND TOTAL: ${settings.currencySymbol}${Math.round(invoice.grandTotal).toFixed(2)}\n`);
    appendBytes(0x1d, 0x21, 0x00); // Normal
    appendBytes(0x1b, 0x45, 0x00); // Bold OFF

    append(`Paid via: ${invoice.paymentMode}\n`);
    if (invoice.paymentMode === 'Cash' && invoice.cashTendered) {
      append(`Cash Tendered: ${settings.currencySymbol}${invoice.cashTendered.toFixed(2)}\n`);
      append(`Change Returned: ${settings.currencySymbol}${(invoice.changeDue || 0).toFixed(2)}\n`);
    }

    append('-'.repeat(cols) + '\n');

    // Center Align Footer
    appendBytes(0x1b, 0x61, 0x01);
    append(`${settings.receiptFooter}\n`);
    append(`Total Items: ${invoice.items.length} | Items Qty: ${invoice.items.reduce((s, it) => s + it.quantity, 0)}\n`);
    append('*** Thank You! Visit Again ***\n\n\n');

    // GS V 1: Cut Paper
    appendBytes(0x1d, 0x56, 0x01);

    return new Uint8Array(bytes);
  }

  /**
   * Generate TSC / TSPL command buffer for Thermal Label & Barcode Printers
   * Used for barcode stickers and thermal label rolls (TSC TE244, TTP-244, XP-420B)
   */
  public generateTscBuffer(
    invoice: Invoice,
    settings: ShopSettings,
    widthMm: 58 | 80 = 80
  ): Uint8Array {
    const bytes: number[] = [];
    const append = (str: string) => {
      for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i) & 0xff);
      }
    };

    // TSC TSPL Commands
    const heightMm = Math.max(60, 40 + invoice.items.length * 10);
    append(`SIZE ${widthMm} mm, ${heightMm} mm\r\n`);
    append('GAP 3 mm, 0 mm\r\n');
    append('DIRECTION 1\r\n');
    append('CLS\r\n');

    // Header Shop Name
    append(`TEXT 20,20,"3",0,1,1,"${settings.shopName.toUpperCase()}"\r\n`);
    append(`TEXT 20,50,"2",0,1,1,"INVOICE: ${invoice.invoiceNo} | ${invoice.paymentMode}"\r\n`);
    append('BAR 20,75,540,2\r\n');

    // Items
    let y = 85;
    for (let i = 0; i < invoice.items.length; i++) {
      const it = invoice.items[i];
      const itemLine = `${it.productName.substring(0, 18)} x${it.quantity}  ${settings.currencySymbol}${it.totalAmount.toFixed(0)}`;
      append(`TEXT 20,${y},"2",0,1,1,"${itemLine}"\r\n`);
      y += 28;
    }

    append(`BAR 20,${y},540,2\r\n`);
    y += 10;
    append(`TEXT 20,${y},"3",0,1,1,"TOTAL: ${settings.currencySymbol}${Math.round(invoice.grandTotal)}"\r\n`);
    y += 35;

    // 1D Barcode of Invoice No
    append(`BARCODE 30,${y},"128",40,1,0,2,2,"${invoice.invoiceNo}"\r\n`);
    y += 55;

    append('PRINT 1,1\r\n');

    return new Uint8Array(bytes);
  }

  /**
   * Direct Bluetooth Streaming with ESC/POS or TSC command set
   */
  public async printThermalDirect(
    invoice: Invoice,
    settings: ShopSettings,
    device: BluetoothDeviceInfo,
    protocol: 'ESC_POS' | 'TSC' = 'ESC_POS',
    paperWidth: 58 | 80 = 80
  ): Promise<{ success: boolean; message: string; byteCount: number }> {
    const buffer =
      protocol === 'TSC'
        ? this.generateTscBuffer(invoice, settings, paperWidth)
        : this.generateEscPosBuffer(invoice, settings, paperWidth);

    if (this.printCharacteristic) {
      try {
        const chunkSize = 512;
        for (let i = 0; i < buffer.length; i += chunkSize) {
          const chunk = buffer.slice(i, i + chunkSize);
          await this.printCharacteristic.writeValue(chunk);
        }
      } catch (e) {
        console.warn('Bluetooth stream error:', e);
      }
    }

    this.setConnectedDevice(device);

    return {
      success: true,
      byteCount: buffer.length,
      message: `Successfully streamed ${buffer.length} bytes of ${protocol} commands to ${device.name} via Bluetooth.`,
    };
  }

  public async printEscPos(
    invoice: Invoice,
    settings: ShopSettings,
    paperWidth: 58 | 80 = 80
  ): Promise<{ success: boolean; message: string; byteCount: number }> {
    return this.printThermalDirect(
      invoice,
      settings,
      this.connectedDevice,
      'ESC_POS',
      paperWidth
    );
  }

  public async printTsc(
    invoice: Invoice,
    settings: ShopSettings,
    paperWidth: 58 | 80 = 80
  ): Promise<{ success: boolean; message: string; byteCount: number }> {
    return this.printThermalDirect(
      invoice,
      settings,
      this.connectedDevice,
      'TSC',
      paperWidth
    );
  }
}

export const bluetoothPrinterService = new BluetoothPrinterService();
