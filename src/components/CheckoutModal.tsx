import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem, ShopSettings, Invoice, InvoiceItem } from '../types';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: ShopSettings;
  onInvoiceCreated: (invoice: Invoice) => void;
  nextInvoiceNo: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  visible,
  onClose,
  cart,
  settings,
  onInvoiceCreated,
  nextInvoiceNo,
}) => {
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Credit'>('Cash');
  const [isInterstate, setIsInterstate] = useState(false);
  const [discountAmount, setDiscountAmount] = useState('0');
  const [cashTendered, setCashTendered] = useState('');

  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalAmount, 0);
  const discountVal = Math.min(cartSubtotal, parseFloat(discountAmount) || 0);
  const grandTotal = Math.max(0, cartSubtotal - discountVal);

  const tenderedVal = parseFloat(cashTendered) || grandTotal;
  const changeDue = Math.max(0, tenderedVal - grandTotal);

  const handleQuickCash = (amount: number) => {
    setCashTendered(amount.toString());
  };

  const handleCheckout = () => {
    const isB2B = Boolean(customerGstin.trim());

    // Build statutory invoice items
    const invoiceItems: InvoiceItem[] = cart.map((item) => {
      // Pro-rate discount if any
      const discountRatio = cartSubtotal > 0 ? (cartSubtotal - discountVal) / cartSubtotal : 1;
      const effectiveTotal = item.totalAmount * discountRatio;
      const gstRate = item.product.gstRate;

      // Reverse calculate taxable amount: Total = Taxable * (1 + GST/100)
      const taxable = effectiveTotal / (1 + gstRate / 100);
      const totalTax = effectiveTotal - taxable;

      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (isInterstate) {
        igst = totalTax;
      } else {
        cgst = totalTax / 2;
        sgst = totalTax / 2;
      }

      return {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        productId: item.product.id,
        productName: item.product.name,
        hsn: item.product.hsn,
        quantity: item.quantity,
        unit: item.product.unit,
        unitPrice: item.product.sellingPrice,
        gstRate: item.product.gstRate,
        taxableAmount: parseFloat(taxable.toFixed(2)),
        cgstAmount: parseFloat(cgst.toFixed(2)),
        sgstAmount: parseFloat(sgst.toFixed(2)),
        igstAmount: parseFloat(igst.toFixed(2)),
        totalAmount: parseFloat(effectiveTotal.toFixed(2)),
      };
    });

    const totalCgst = invoiceItems.reduce((s, i) => s + i.cgstAmount, 0);
    const totalSgst = invoiceItems.reduce((s, i) => s + i.sgstAmount, 0);
    const totalIgst = invoiceItems.reduce((s, i) => s + i.igstAmount, 0);
    const taxableTotal = invoiceItems.reduce((s, i) => s + i.taxableAmount, 0);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: nextInvoiceNo,
      date: new Date().toISOString(),
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      customerGstin: customerGstin.trim() || undefined,
      isB2B,
      isInterstate,
      subtotal: parseFloat(cartSubtotal.toFixed(2)),
      discount: parseFloat(discountVal.toFixed(2)),
      taxableAmount: parseFloat(taxableTotal.toFixed(2)),
      totalCgst: parseFloat(totalCgst.toFixed(2)),
      totalSgst: parseFloat(totalSgst.toFixed(2)),
      totalIgst: parseFloat(totalIgst.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      paymentMode,
      cashTendered: paymentMode === 'Cash' ? tenderedVal : undefined,
      changeDue: paymentMode === 'Cash' ? changeDue : undefined,
      items: invoiceItems,
    };

    onInvoiceCreated(newInvoice);
  };

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
            <View>
              <Text style={styles.headerTitle}>Checkout & Payment</Text>
              <Text style={styles.headerSubtitle}>Invoice #{nextInvoiceNo}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Grand Total Callout */}
            <View style={styles.totalBanner}>
              <Text style={styles.totalBannerLabel}>PAYABLE GRAND TOTAL</Text>
              <Text style={styles.totalBannerAmount}>
                {settings.currencySymbol}
                {Math.round(grandTotal).toFixed(2)}
              </Text>
              <Text style={styles.totalBannerSub}>
                Includes all applicable CGST, SGST & statutory taxes
              </Text>
            </View>

            {/* Payment Mode Selector */}
            <Text style={styles.sectionHeading}>PAYMENT METHOD</Text>
            <View style={styles.paymentMethodsGrid}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodCard,
                  paymentMode === 'Cash' && styles.paymentMethodCardActive,
                ]}
                onPress={() => setPaymentMode('Cash')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="cash-outline"
                  size={24}
                  color={paymentMode === 'Cash' ? '#10B981' : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMode === 'Cash' && styles.paymentMethodTextActive,
                  ]}
                >
                  Cash
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodCard,
                  paymentMode === 'UPI' && styles.paymentMethodCardActive,
                ]}
                onPress={() => setPaymentMode('UPI')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={24}
                  color={paymentMode === 'UPI' ? '#10B981' : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMode === 'UPI' && styles.paymentMethodTextActive,
                  ]}
                >
                  UPI / QR
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodCard,
                  paymentMode === 'Card' && styles.paymentMethodCardActive,
                ]}
                onPress={() => setPaymentMode('Card')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="card-outline"
                  size={24}
                  color={paymentMode === 'Card' ? '#10B981' : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMode === 'Card' && styles.paymentMethodTextActive,
                  ]}
                >
                  Card POS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodCard,
                  paymentMode === 'Credit' && styles.paymentMethodCardActive,
                ]}
                onPress={() => setPaymentMode('Credit')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="receipt-outline"
                  size={24}
                  color={paymentMode === 'Credit' ? '#10B981' : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMode === 'Credit' && styles.paymentMethodTextActive,
                  ]}
                >
                  Khata / Due
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mode-Specific Details */}
            {paymentMode === 'Cash' && (
              <View style={styles.cashBox}>
                <Text style={styles.cashLabel}>Cash Tendered / Received:</Text>
                <View style={styles.cashInputRow}>
                  <Text style={styles.currencyPrefix}>{settings.currencySymbol}</Text>
                  <TextInput
                    style={styles.cashInput}
                    value={cashTendered}
                    onChangeText={setCashTendered}
                    placeholder={Math.round(grandTotal).toString()}
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                  />
                </View>

                {/* Quick Cash Buttons */}
                <View style={styles.quickCashRow}>
                  <TouchableOpacity
                    style={styles.quickCashChip}
                    onPress={() => handleQuickCash(Math.round(grandTotal))}
                  >
                    <Text style={styles.quickCashChipText}>Exact</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickCashChip}
                    onPress={() => handleQuickCash(100)}
                  >
                    <Text style={styles.quickCashChipText}>₹100</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickCashChip}
                    onPress={() => handleQuickCash(200)}
                  >
                    <Text style={styles.quickCashChipText}>₹200</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickCashChip}
                    onPress={() => handleQuickCash(500)}
                  >
                    <Text style={styles.quickCashChipText}>₹500</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickCashChip}
                    onPress={() => handleQuickCash(2000)}
                  >
                    <Text style={styles.quickCashChipText}>₹2000</Text>
                  </TouchableOpacity>
                </View>

                {/* Change Return Box */}
                <View style={styles.changeDueRow}>
                  <Text style={styles.changeDueLabel}>Change to Return:</Text>
                  <Text style={styles.changeDueVal}>
                    {settings.currencySymbol}
                    {changeDue.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {paymentMode === 'UPI' && (
              <View style={styles.upiBox}>
                <View style={styles.upiQrPlaceholder}>
                  <Ionicons name="qr-code" size={110} color="#10B981" />
                </View>
                <Text style={styles.upiPayAmount}>
                  Scan & Pay {settings.currencySymbol}
                  {Math.round(grandTotal).toFixed(2)}
                </Text>
                <Text style={styles.upiVpaText}>UPI ID: {settings.phone.replace(/[^0-9]/g, '')}@okaxis</Text>
              </View>
            )}

            {/* Customer Details Form */}
            <Text style={styles.sectionHeading}>CUSTOMER & TAX INVOICE DETAILS</Text>
            <View style={styles.customerForm}>
              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Customer Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={customerName}
                    onChangeText={setCustomerName}
                    placeholder="Walk-in Customer"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Mobile (for WhatsApp/SMS)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={customerPhone}
                    onChangeText={setCustomerPhone}
                    placeholder="9876543210"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Customer GSTIN (Required for B2B Tax Credit)
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={customerGstin}
                  onChangeText={setCustomerGstin}
                  placeholder="33AABCS1234D1Z5"
                  placeholderTextColor="#64748B"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Inter-state Supply (IGST)</Text>
                  <Text style={styles.toggleSub}>
                    Charge Integrated GST instead of CGST + SGST
                  </Text>
                </View>
                <Switch
                  value={isInterstate}
                  onValueChange={setIsInterstate}
                  thumbColor={isInterstate ? '#10B981' : '#64748B'}
                  trackColor={{ false: '#334155', true: '#064E3B' }}
                />
              </View>
            </View>

            {/* Discount */}
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>Add Bill Discount ({settings.currencySymbol}):</Text>
              <TextInput
                style={styles.discountInput}
                value={discountAmount}
                onChangeText={setDiscountAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#64748B"
              />
            </View>
          </ScrollView>

          {/* Action Button */}
          <View style={styles.footerAction}>
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <Ionicons name="receipt" size={20} color="#FFFFFF" />
              <Text style={styles.completeBtnText}>
                Complete Sale & Print Receipt ({settings.currencySymbol}
                {Math.round(grandTotal).toFixed(0)})
              </Text>
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
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
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
  totalBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  totalBannerLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  totalBannerAmount: {
    color: '#10B981',
    fontSize: 32,
    fontWeight: '900',
    marginVertical: 4,
  },
  totalBannerSub: {
    color: '#64748B',
    fontSize: 10.5,
  },
  sectionHeading: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  paymentMethodCardActive: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B25',
  },
  paymentMethodText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  paymentMethodTextActive: {
    color: '#10B981',
    fontWeight: '800',
  },
  cashBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  cashLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  cashInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  currencyPrefix: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 6,
  },
  cashInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    paddingVertical: 8,
  },
  quickCashRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  quickCashChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickCashChipText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  changeDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  changeDueLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  changeDueVal: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '900',
  },
  upiBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  upiQrPlaceholder: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  upiPayAmount: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  upiVpaText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  customerForm: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  formRow: {
    flexDirection: 'row',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  toggleLabel: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleSub: {
    color: '#64748B',
    fontSize: 10,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    marginBottom: 10,
  },
  discountLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  discountInput: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#10B981',
    fontWeight: '800',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 80,
    textAlign: 'center',
  },
  footerAction: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
