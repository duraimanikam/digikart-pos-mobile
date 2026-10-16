import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';
import { Invoice } from '../types';
import { shareOnWhatsApp } from '../services/whatsappService';
import { DEFAULT_SETTINGS } from '../database/sqlite';
import { PrintOptionsModal } from '../components/PrintOptionsModal';
import { receiptService } from '../services/receiptService';

interface BillPrintScreenProps {
  invoice?: Invoice | null;
  onBack: () => void;
  onNewBill: () => void;
}

export const BillPrintScreen: React.FC<BillPrintScreenProps> = ({
  invoice,
  onBack,
  onNewBill,
}) => {
  const [customerPhone, setCustomerPhone] = useState(
    invoice?.customerPhone || '9876543210'
  );
  const [isShared, setIsShared] = useState(false);

  // Mock invoice data matching Screen 9 exactly if no live invoice passed
  const displayBillNo = invoice?.invoiceNo || '000123';
  const displayDate = invoice?.date || '15-10-2026 10:45 AM';

  const defaultItems = [
    { sNo: 1, name: 'Aachi Turmeric Powder 500 g', qty: 1, rate: 120.0, amt: 120.0 },
    { sNo: 2, name: 'Aavin Milk 1 Ltr', qty: 1, rate: 68.0, amt: 68.0 },
    { sNo: 3, name: 'Sunfeast Marie Biscuits 200 g', qty: 1, rate: 30.0, amt: 30.0 },
    { sNo: 4, name: 'Coca Cola 750 ml', qty: 1, rate: 45.0, amt: 45.0 },
  ];

  const items = invoice
    ? invoice.items.map((i, idx) => ({
        sNo: idx + 1,
        name: `${i.productName} ${i.unit || ''}`,
        qty: i.quantity,
        rate: i.unitPrice,
        amt: i.totalAmount,
      }))
    : defaultItems;

  const totalItems = items.length;
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
  const totalAmount = invoice ? invoice.grandTotal : 263.0;
  const paidCash = invoice?.cashTendered || 300.0;
  const balance = invoice?.changeDue || 37.0;

  const handleShareWhatsApp = async () => {
    const inv: Invoice = invoice || {
      id: 'inv-000123',
      invoiceNo: displayBillNo,
      date: displayDate,
      customerName: 'Walk-in Customer',
      customerPhone,
      isB2B: false,
      isInterstate: false,
      subtotal: totalAmount,
      discount: 0,
      taxableAmount: totalAmount * 0.9,
      totalCgst: totalAmount * 0.05,
      totalSgst: totalAmount * 0.05,
      totalIgst: 0,
      grandTotal: totalAmount,
      paymentMode: 'Cash',
      cashTendered: paidCash,
      changeDue: balance,
      items: items.map((it) => ({
        productId: `p-${it.sNo}`,
        productName: it.name,
        hsn: '0910',
        quantity: it.qty,
        unit: '',
        unitPrice: it.rate,
        gstRate: 5,
        taxableAmount: it.amt * 0.9,
        cgstAmount: it.amt * 0.05,
        sgstAmount: it.amt * 0.05,
        igstAmount: 0,
        totalAmount: it.amt,
      })),
    };

    const success = await shareOnWhatsApp(inv, customerPhone);
    if (success) {
      setIsShared(true);
      setTimeout(() => setIsShared(false), 3000);
    }
  };

  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);

  // Construct printable invoice object
  const printableInvoice: Invoice = useMemo(
    () =>
      invoice || {
        id: `inv-${displayBillNo}`,
        invoiceNo: displayBillNo,
        date: displayDate,
        customerName: 'Cash Customer',
        customerPhone: customerPhone,
        isB2B: false,
        isInterstate: false,
        subtotal: 263.0,
        discount: 0,
        taxableAmount: 250.48,
        totalCgst: 6.26,
        totalSgst: 6.26,
        totalIgst: 0,
        grandTotal: 263.0,
        paymentMode: 'Cash',
        cashTendered: 300.0,
        changeDue: 37.0,
        items: defaultItems.map((it, idx) => ({
          productId: `prod-00${idx + 1}`,
          productName: it.name,
          hsn: '2106',
          quantity: it.qty,
          unit: 'pcs',
          unitPrice: it.rate,
          gstRate: 5,
          taxableAmount: it.amt * 0.95,
          cgstAmount: it.amt * 0.025,
          sgstAmount: it.amt * 0.025,
          igstAmount: 0,
          totalAmount: it.amt,
        })),
      },
    [invoice, displayBillNo, displayDate, customerPhone]
  );

  const handlePrint = () => {
    setIsPrintOptionsOpen(true);
  };

  const handleQuickWifiA4 = () => {
    receiptService.printA4Wifi(printableInvoice, DEFAULT_SETTINGS);
  };

  const handleQuickBluetoothThermal = () => {
    receiptService.printThermalBluetooth(printableInvoice, DEFAULT_SETTINGS, 80);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 9 Header with share and print icons */}
      <AppHeader
        title="Bill Print Preview"
        showBack={true}
        onBack={onBack}
        secondRightIcon="share-social-outline"
        onSecondRightPress={handleShareWhatsApp}
        rightIcon="print-outline"
        onRightPress={handlePrint}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* WhatsApp Sharing Card */}
        <View style={styles.whatsappCard}>
          <View style={styles.whatsappCardLeft}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Text style={styles.whatsappTitle}>Share Bill on WhatsApp</Text>
          </View>
          <View style={styles.phoneInputRow}>
            <TextInput
              style={styles.phoneInput}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="Enter 10-digit Phone"
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.sendWhatsAppBtn}
              onPress={handleShareWhatsApp}
              activeOpacity={0.8}
            >
              <Text style={styles.sendWhatsAppText}>Send</Text>
            </TouchableOpacity>
          </View>
          {isShared && (
            <Text style={styles.shareSuccessText}>
              ✓ WhatsApp opened with formatted receipt!
            </Text>
          )}
        </View>

        {/* Thermal Receipt Paper Card matching Screen 9 */}
        <View style={styles.receiptPaper}>
          {/* Header */}
          <Text style={styles.storeName}>DigiKart Super Market</Text>
          <Text style={styles.storeAddr}>No. 123, Main Road, Chennai - 600001</Text>
          <Text style={styles.storePhone}>Ph: 98765 43210</Text>
          <Text style={styles.storeGstin}>GSTIN: 33ABCDE1234F1Z5</Text>

          <View style={styles.dashedDivider} />

          {/* Bill Meta */}
          <View style={styles.billMetaRow}>
            <Text style={styles.metaText}>Bill No : {displayBillNo}</Text>
            <Text style={styles.metaText}>Date : {displayDate}</Text>
          </View>

          <View style={styles.solidDivider} />

          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colHeader, { width: 30 }]}>S.No</Text>
            <Text style={[styles.colHeader, { flex: 1, paddingLeft: 4 }]}>Product</Text>
            <Text style={[styles.colHeader, { width: 34, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.colHeader, { width: 50, textAlign: 'right' }]}>Rate</Text>
            <Text style={[styles.colHeader, { width: 50, textAlign: 'right' }]}>Amt</Text>
          </View>

          <View style={styles.solidDivider} />

          {/* Items Rows */}
          {items.map((it) => (
            <View key={it.sNo} style={styles.tableRow}>
              <Text style={[styles.cellText, { width: 30 }]}>{it.sNo}</Text>
              <Text style={[styles.cellText, { flex: 1, paddingLeft: 4 }]} numberOfLines={2}>
                {it.name}
              </Text>
              <Text style={[styles.cellText, { width: 34, textAlign: 'center' }]}>
                {it.qty}
              </Text>
              <Text style={[styles.cellText, { width: 50, textAlign: 'right' }]}>
                {it.rate.toFixed(2)}
              </Text>
              <Text style={[styles.cellText, { width: 50, textAlign: 'right' }]}>
                {it.amt.toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.dashedDivider} />

          {/* Total Items & Qty */}
          <View style={styles.billMetaRow}>
            <Text style={styles.boldMetaText}>Total Items : {totalItems}</Text>
            <Text style={styles.boldMetaText}>Total Qty : {totalQty}</Text>
          </View>

          <View style={styles.dashedDivider} />

          {/* Total Calculation breakdown matching Screen 9 */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelLarge}>Total Amount</Text>
            <Text style={styles.totalValLarge}>₹ {totalAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.calcSubRow}>
            <Text style={styles.calcSubLabel}>Paid (Cash)</Text>
            <Text style={styles.calcSubVal}>₹ {paidCash.toFixed(2)}</Text>
          </View>

          <View style={styles.calcSubRow}>
            <Text style={styles.calcSubLabel}>Balance</Text>
            <Text style={styles.calcSubVal}>₹ {balance.toFixed(2)}</Text>
          </View>

          <View style={styles.dashedDivider} />

          {/* Footer note */}
          <Text style={styles.receiptFooter}>Thank You! Visit Again.</Text>
        </View>

        {/* Dual Action Buttons: Wi-Fi A4 vs Bluetooth Thermal */}
        <View style={styles.footerActionRow}>
          <TouchableOpacity
            style={[styles.thermalPrintBtn, { backgroundColor: '#2563EB' }]}
            onPress={handleQuickWifiA4}
            activeOpacity={0.8}
          >
            <Ionicons name="wifi" size={17} color="#FFFFFF" />
            <Text style={styles.thermalPrintText}>Wi-Fi (A4 GST)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.thermalPrintBtn, { backgroundColor: '#059669' }]}
            onPress={handleQuickBluetoothThermal}
            activeOpacity={0.8}
          >
            <Ionicons name="bluetooth" size={17} color="#FFFFFF" />
            <Text style={styles.thermalPrintText}>Bluetooth (Thermal)</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.footerActionRow, { marginTop: 8 }]}>
          <TouchableOpacity
            style={styles.morePrintBtn}
            onPress={() => setIsPrintOptionsOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={17} color={COLORS.primary} />
            <Text style={styles.morePrintText}>More Print & PDF Options</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newBillActionBtn}
            onPress={onNewBill}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={17} color={COLORS.primary} />
            <Text style={styles.newBillActionText}>New Bill</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Print Options Modal */}
      <PrintOptionsModal
        visible={isPrintOptionsOpen}
        onClose={() => setIsPrintOptionsOpen(false)}
        invoice={printableInvoice}
        settings={DEFAULT_SETTINGS}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    padding: 16,
    paddingBottom: 30,
  },
  whatsappCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    ...SHADOWS.card,
  },
  whatsappCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  whatsappTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  sendWhatsAppBtn: {
    backgroundColor: '#25D366',
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendWhatsAppText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  shareSuccessText: {
    color: '#166534',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 8,
  },
  receiptPaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...SHADOWS.card,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  storeAddr: {
    fontSize: 11,
    textAlign: 'center',
    color: '#475569',
    marginTop: 2,
  },
  storePhone: {
    fontSize: 11,
    textAlign: 'center',
    color: '#475569',
    marginTop: 1,
  },
  storeGstin: {
    fontSize: 11,
    textAlign: 'center',
    color: '#475569',
    marginTop: 1,
  },
  dashedDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#94A3B8',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  solidDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    marginVertical: 6,
  },
  billMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  boldMetaText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  cellText: {
    fontSize: 11,
    color: '#1E293B',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  totalLabelLarge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValLarge: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  calcSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  calcSubLabel: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  calcSubVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  receiptFooter: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#475569',
    marginTop: 4,
  },
  footerActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  thermalPrintBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
    ...SHADOWS.card,
  },
  thermalPrintText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  morePrintBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
  },
  morePrintText: {
    color: '#334155',
    fontSize: 12.5,
    fontWeight: '700',
  },
  newBillActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
  },
  newBillActionText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
});
