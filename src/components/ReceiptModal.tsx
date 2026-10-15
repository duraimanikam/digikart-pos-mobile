import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Invoice, ShopSettings } from '../types';
import { receiptService } from '../services/receiptService';

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  settings: ShopSettings;
  onNewSale: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  visible,
  onClose,
  invoice,
  settings,
  onNewSale,
}) => {
  if (!invoice) return null;

  const handlePrintOrShare = () => {
    receiptService.printOrShareReceipt(invoice, settings);
  };

  const formattedDate = new Date(invoice.date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerBadge}>
                <Ionicons name="checkmark-circle" size={22} color="#10B981" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Bill Generated Successfully</Text>
                <Text style={styles.headerSubtitle}>Invoice #{invoice.invoiceNo}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Thermal Paper Slip Container */}
            <View style={styles.thermalSlip}>
              {/* Slip Header */}
              <View style={styles.slipCenter}>
                <Text style={styles.slipShopName}>{settings.shopName}</Text>
                <Text style={styles.slipTagline}>{settings.tagline}</Text>
                <Text style={styles.slipAddress}>{settings.address}</Text>
                <Text style={styles.slipPhone}>
                  Phone: {settings.phone} | State: {settings.state} ({settings.stateCode})
                </Text>
                <View style={styles.slipGstBox}>
                  <Text style={styles.slipGstText}>GSTIN: {settings.gstin}</Text>
                </View>
                <Text style={styles.slipTaxType}>
                  {invoice.isB2B ? 'TAX INVOICE (B2B)' : 'RETAIL INVOICE (B2C)'}
                </Text>
              </View>

              <View style={styles.dashedLine} />

              {/* Meta */}
              <View style={styles.slipMetaRow}>
                <Text style={styles.slipMetaText}>Bill No: {invoice.invoiceNo}</Text>
                <Text style={styles.slipMetaText}>{formattedDate}</Text>
              </View>
              {invoice.customerName ? (
                <Text style={styles.slipMetaText}>
                  Cust: {invoice.customerName} {invoice.customerPhone ? `(${invoice.customerPhone})` : ''}
                </Text>
              ) : null}
              {invoice.customerGstin ? (
                <Text style={styles.slipMetaText}>Cust GSTIN: {invoice.customerGstin}</Text>
              ) : null}
              <Text style={styles.slipMetaText}>Payment: {invoice.paymentMode}</Text>

              <View style={styles.dashedLine} />

              {/* Items Table */}
              <View style={styles.tableHeader}>
                <Text style={[styles.colHeader, { flex: 4 }]}>ITEM</Text>
                <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'center' }]}>QTY</Text>
                <Text style={[styles.colHeader, { flex: 2, textAlign: 'right' }]}>RATE</Text>
                <Text style={[styles.colHeader, { flex: 2.5, textAlign: 'right' }]}>AMOUNT</Text>
              </View>

              {invoice.items.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <View style={{ flex: 4 }}>
                    <Text style={styles.itemNameText}>{item.productName}</Text>
                    <Text style={styles.itemHsnSub}>
                      HSN: {item.hsn} | GST: {item.gstRate}%
                    </Text>
                  </View>
                  <Text style={[styles.itemQtyText, { flex: 1.5, textAlign: 'center' }]}>
                    {item.quantity} {item.unit}
                  </Text>
                  <Text style={[styles.itemRateText, { flex: 2, textAlign: 'right' }]}>
                    {settings.currencySymbol}
                    {item.unitPrice.toFixed(0)}
                  </Text>
                  <Text style={[styles.itemTotalText, { flex: 2.5, textAlign: 'right' }]}>
                    {settings.currencySymbol}
                    {item.totalAmount.toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.dashedLine} />

              {/* Totals */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalVal}>
                  {settings.currencySymbol}
                  {invoice.subtotal.toFixed(2)}
                </Text>
              </View>

              {invoice.discount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount:</Text>
                  <Text style={[styles.totalVal, { color: '#059669' }]}>
                    -{settings.currencySymbol}
                    {invoice.discount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Taxable Value:</Text>
                <Text style={styles.totalVal}>
                  {settings.currencySymbol}
                  {invoice.taxableAmount.toFixed(2)}
                </Text>
              </View>

              {!invoice.isInterstate ? (
                <>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total CGST:</Text>
                    <Text style={styles.totalVal}>
                      {settings.currencySymbol}
                      {invoice.totalCgst.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total SGST:</Text>
                    <Text style={styles.totalVal}>
                      {settings.currencySymbol}
                      {invoice.totalSgst.toFixed(2)}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total IGST:</Text>
                  <Text style={styles.totalVal}>
                    {settings.currencySymbol}
                    {invoice.totalIgst.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.solidLine} />

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
                <Text style={styles.grandTotalVal}>
                  {settings.currencySymbol}
                  {Math.round(invoice.grandTotal).toFixed(2)}
                </Text>
              </View>

              {invoice.cashTendered ? (
                <View style={styles.cashTenderRow}>
                  <Text style={styles.slipMetaText}>
                    Cash Tendered: {settings.currencySymbol}
                    {invoice.cashTendered.toFixed(2)}
                  </Text>
                  <Text style={[styles.slipMetaText, { fontWeight: 'bold' }]}>
                    Change Returned: {settings.currencySymbol}
                    {(invoice.changeDue || 0).toFixed(2)}
                  </Text>
                </View>
              ) : null}

              <View style={styles.dashedLine} />

              {/* Barcode representation */}
              <View style={styles.slipBarcodeBox}>
                <Text style={styles.slipBarcodeText}>*{invoice.invoiceNo}*</Text>
              </View>

              <Text style={styles.slipFooterText}>{settings.receiptFooter}</Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={styles.printBtn}
              onPress={handlePrintOrShare}
              activeOpacity={0.8}
            >
              <Ionicons name="print" size={18} color="#FFFFFF" />
              <Text style={styles.printBtnText}>Print / Share PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newSaleBtn}
              onPress={onNewSale}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.newSaleBtnText}>New Sale</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '94%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  scrollBody: {
    paddingHorizontal: 16,
  },
  thermalSlip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginTop: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  slipCenter: {
    alignItems: 'center',
  },
  slipShopName: {
    fontFamily: 'Courier',
    fontSize: 15,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
  },
  slipTagline: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    color: '#444444',
    textAlign: 'center',
    marginTop: 2,
  },
  slipAddress: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    color: '#333333',
    textAlign: 'center',
    marginTop: 2,
  },
  slipPhone: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#333333',
    textAlign: 'center',
  },
  slipGstBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginVertical: 4,
  },
  slipGstText: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  slipTaxType: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
    marginTop: 2,
  },
  dashedLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#666666',
    borderStyle: 'dashed',
    marginVertical: 6,
  },
  solidLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    marginVertical: 6,
  },
  slipMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slipMetaText: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    color: '#111111',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  colHeader: {
    fontFamily: 'Courier',
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 3,
  },
  itemNameText: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    fontWeight: '700',
    color: '#000000',
  },
  itemHsnSub: {
    fontFamily: 'Courier',
    fontSize: 8.5,
    color: '#555555',
  },
  itemQtyText: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    color: '#000000',
  },
  itemRateText: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    color: '#000000',
  },
  itemTotalText: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  totalLabel: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    color: '#333333',
  },
  totalVal: {
    fontFamily: 'Courier',
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#000000',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  grandTotalLabel: {
    fontFamily: 'Courier',
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
  },
  grandTotalVal: {
    fontFamily: 'Courier',
    fontSize: 15,
    fontWeight: '900',
    color: '#000000',
  },
  cashTenderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  slipBarcodeBox: {
    alignItems: 'center',
    marginVertical: 6,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  slipBarcodeText: {
    fontFamily: 'Courier',
    letterSpacing: 3,
    fontWeight: 'bold',
    fontSize: 12,
  },
  slipFooterText: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#555555',
    textAlign: 'center',
    marginTop: 4,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  printBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  printBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  newSaleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  newSaleBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
