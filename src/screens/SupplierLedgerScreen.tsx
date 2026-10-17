import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';
import { Product } from '../types';
import { DetailedPurchaseEntryScreen } from './DetailedPurchaseEntryScreen';

interface SupplierLedgerScreenProps {
  onBack: () => void;
  products?: Product[];
  onStockUpdated?: (productId: string, inwardQty: number) => void;
}

interface Supplier {
  id: string;
  name: string;
  phone: string;
  contactPerson: string;
  gstin?: string;
  address?: string;
  openingBalance: number;
}

interface SupplierTxn {
  id: string;
  date: string;
  type: 'Purchase' | 'Payment';
  ref: string;
  amt: number;
  bal: number;
  productName?: string;
  quantity?: number;
  mode?: string;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-01',
    name: 'ABC Distributors',
    phone: '98765 01234',
    contactPerson: 'Arun Kumar',
    gstin: '33AAACB1234F1Z9',
    address: 'Warehouse #12, Koyambedu, Chennai',
    openingBalance: 12500,
  },
  {
    id: 'sup-02',
    name: 'Metro Cash & Carry',
    phone: '98401 55667',
    contactPerson: 'Suresh V',
    gstin: '33AABCM9988H1Z4',
    address: 'Wholesale Hub, Guindy, Chennai',
    openingBalance: 8200,
  },
  {
    id: 'sup-03',
    name: 'Britannia Agencies',
    phone: '91760 33445',
    contactPerson: 'Karthik R',
    gstin: '33AABCB5544K1Z1',
    address: 'Depot Rd, Ambattur, Chennai',
    openingBalance: 5000,
  },
  {
    id: 'sup-04',
    name: 'Sri Murugan Wholesale',
    phone: '94440 88990',
    contactPerson: 'Murugan M',
    gstin: '33AAECM7766L1Z8',
    address: 'Market St, George Town, Chennai',
    openingBalance: 15400,
  },
];

export const SupplierLedgerScreen: React.FC<SupplierLedgerScreenProps> = ({
  onBack,
  products = [],
  onStockUpdated,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    INITIAL_SUPPLIERS[0].id
  );
  const [activeTab, setActiveTab] = useState<'Transactions' | 'Make Payment'>('Transactions');

  // Supplier Transactions map
  const [supplierLedgerMap, setSupplierLedgerMap] = useState<Record<string, SupplierTxn[]>>({
    'sup-01': [
      { id: 'st-1', date: '01-10-2026', type: 'Purchase', ref: 'P00045', amt: 12000, bal: 24500, productName: 'Aachi Turmeric 500g', quantity: 150 },
      { id: 'st-2', date: '04-10-2026', type: 'Payment', ref: 'PY-001', amt: 10000, bal: 14500, mode: 'Bank' },
      { id: 'st-3', date: '08-10-2026', type: 'Purchase', ref: 'P00046', amt: 25680, bal: 40180, productName: 'General Groceries Lot', quantity: 200 },
      { id: 'st-4', date: '10-10-2026', type: 'Payment', ref: 'PY-002', amt: 15000, bal: 25180, mode: 'UPI' },
      { id: 'st-5', date: '12-10-2026', type: 'Purchase', ref: 'P00051', amt: 10060, bal: 35240, productName: 'Sunfeast Marie Boxes', quantity: 80 },
      { id: 'st-6', date: '14-10-2026', type: 'Payment', ref: 'PY-003', amt: 20000, bal: 15240, mode: 'Bank' },
      { id: 'st-7', date: '15-10-2026', type: 'Purchase', ref: 'P00055', amt: 10500, bal: 25740, productName: 'Aavin Milk Crates', quantity: 50 },
    ],
    'sup-02': [
      { id: 'st-8', date: '05-10-2026', type: 'Purchase', ref: 'P00047', amt: 18000, bal: 26200 },
      { id: 'st-9', date: '08-10-2026', type: 'Payment', ref: 'PY-004', amt: 15000, bal: 11200, mode: 'Cheque' },
    ],
    'sup-03': [
      { id: 'st-10', date: '06-10-2026', type: 'Purchase', ref: 'P00048', amt: 8500, bal: 13500 },
      { id: 'st-11', date: '11-10-2026', type: 'Payment', ref: 'PY-005', amt: 8000, bal: 5500, mode: 'UPI' },
    ],
    'sup-04': [
      { id: 'st-12', date: '03-10-2026', type: 'Purchase', ref: 'P00049', amt: 22000, bal: 37400 },
      { id: 'st-13', date: '12-10-2026', type: 'Payment', ref: 'PY-006', amt: 20000, bal: 17400, mode: 'Bank' },
    ],
  });

  // Modal States
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseInvoiceNo, setPurchaseInvoiceNo] = useState('');
  const [purchaseProductName, setPurchaseProductName] = useState('');
  const [purchaseQty, setPurchaseQty] = useState('50');
  const [purchaseRate, setPurchaseRate] = useState('65.00');
  const [purchaseGst, setPurchaseGst] = useState('5');
  const [purchasePaymentMode, setPurchasePaymentMode] = useState<'Credit' | 'Paid' | 'Partial'>('Credit');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Bank' | 'UPI' | 'Cash' | 'Cheque'>('Bank');
  const [paymentRef, setPaymentRef] = useState('');

  const [isNewSupModalOpen, setIsNewSupModalOpen] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupGstin, setNewSupGstin] = useState('');
  const [newSupOpeningBal, setNewSupOpeningBal] = useState('0');

  const selectedSupplier =
    suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  const transactions = supplierLedgerMap[selectedSupplier.id] || [];

  // Financial calculations
  const totalPurchases = transactions
    .filter((t) => t.type === 'Purchase')
    .reduce((s, t) => s + t.amt, 0);

  const totalPayments = transactions
    .filter((t) => t.type === 'Payment')
    .reduce((s, t) => s + t.amt, 0);

  const currentBalance = Math.max(
    0,
    selectedSupplier.openingBalance + totalPurchases - totalPayments
  );

  // Handle Save Inward Goods Purchase Entry
  const handleSavePurchaseEntry = () => {
    const qty = parseInt(purchaseQty, 10) || 1;
    const rate = parseFloat(purchaseRate) || 0;
    const gstRate = parseFloat(purchaseGst) || 0;

    if (!purchaseProductName.trim()) {
      Alert.alert('Item Required', 'Please enter or select a product for this purchase.');
      return;
    }
    if (rate <= 0) {
      Alert.alert('Invalid Rate', 'Please enter a valid purchase rate.');
      return;
    }

    const subtotal = qty * rate;
    const taxAmt = subtotal * (gstRate / 100);
    const totalBillAmt = subtotal + taxAmt;

    const newTxn: SupplierTxn = {
      id: `st-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '-'),
      type: 'Purchase',
      ref: purchaseInvoiceNo.trim() || `PUR-${Math.floor(1000 + Math.random() * 9000)}`,
      amt: totalBillAmt,
      bal: currentBalance + totalBillAmt,
      productName: purchaseProductName.trim(),
      quantity: qty,
      mode: purchasePaymentMode,
    };

    setSupplierLedgerMap((prev) => ({
      ...prev,
      [selectedSupplier.id]: [newTxn, ...(prev[selectedSupplier.id] || [])],
    }));

    // If matching product in catalog, update stock
    if (onStockUpdated) {
      const match = products.find(
        (p) => p.name.toLowerCase() === purchaseProductName.toLowerCase()
      );
      if (match) {
        onStockUpdated(match.id, qty);
      }
    }

    // Reset and close
    setPurchaseInvoiceNo('');
    setPurchaseProductName('');
    setPurchaseQty('50');
    setPurchaseRate('65.00');
    setIsPurchaseModalOpen(false);
    Alert.alert(
      'Purchase Recorded',
      `Inward purchase of ${qty} units of "${purchaseProductName}" recorded for ₹${totalBillAmt.toFixed(2)}.`
    );
  };

  // Handle Save Payment to Supplier
  const handleSavePayment = () => {
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    const newTxn: SupplierTxn = {
      id: `st-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '-'),
      type: 'Payment',
      ref: paymentRef.trim() || `PY-${Math.floor(100 + Math.random() * 900)}`,
      amt,
      bal: Math.max(0, currentBalance - amt),
      mode: paymentMode,
    };

    setSupplierLedgerMap((prev) => ({
      ...prev,
      [selectedSupplier.id]: [newTxn, ...(prev[selectedSupplier.id] || [])],
    }));

    setPaymentAmount('');
    setPaymentRef('');
    setIsPaymentModalOpen(false);
    Alert.alert(
      'Payment Recorded',
      `Successfully recorded payment of ₹${amt.toFixed(2)} to ${selectedSupplier.name} via ${paymentMode}.`
    );
  };

  // Handle Add New Supplier
  const handleSaveNewSupplier = () => {
    if (!newSupName.trim()) {
      Alert.alert('Supplier Name Required', 'Please enter company name.');
      return;
    }
    if (!newSupPhone.trim()) {
      Alert.alert('Phone Required', 'Please enter supplier phone.');
      return;
    }

    const openBal = parseFloat(newSupOpeningBal) || 0;
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: newSupName.trim(),
      phone: newSupPhone.trim(),
      contactPerson: newSupContact.trim() || 'Manager',
      gstin: newSupGstin.trim() || undefined,
      openingBalance: openBal,
    };

    setSuppliers((prev) => [newSup, ...prev]);
    setSelectedSupplierId(newSup.id);

    setNewSupName('');
    setNewSupPhone('');
    setNewSupContact('');
    setNewSupGstin('');
    setNewSupOpeningBal('0');
    setIsNewSupModalOpen(false);
    Alert.alert('Supplier Added', `Supplier "${newSup.name}" created successfully.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.headerBg} />

      {/* Screen Header */}
      <AppHeader
        title="Purchase & Supplier Ledger"
        showBack={true}
        onBack={onBack}
        rightIcon="business-outline"
        onRightPress={() => setIsNewSupModalOpen(true)}
      />

      {/* Supplier Switcher Strip */}
      <View style={styles.supplierSelectorStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.supplierChipsRow}>
          {suppliers.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.supplierChip,
                s.id === selectedSupplierId && styles.supplierChipActive,
              ]}
              onPress={() => setSelectedSupplierId(s.id)}
            >
              <Text
                style={[
                  styles.supplierChipText,
                  s.id === selectedSupplierId && styles.supplierChipTextActive,
                ]}
              >
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addSupplierChip}
            onPress={() => setIsNewSupModalOpen(true)}
          >
            <Ionicons name="add" size={14} color={COLORS.primary} />
            <Text style={styles.addSupplierChipText}>+ New Supplier</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Supplier Profile Card matching Image 2 Screen 6 */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {selectedSupplier.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{selectedSupplier.name}</Text>
              <Text style={styles.profilePhone}>
                <Ionicons name="call-outline" size={12} color="#64748B" /> {selectedSupplier.phone} • {selectedSupplier.contactPerson}
              </Text>
              {selectedSupplier.gstin && (
                <Text style={styles.profileGstin}>GSTIN: {selectedSupplier.gstin}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.purchaseQuickBtn}
              onPress={() => setIsPurchaseModalOpen(true)}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.purchaseQuickText}>Inward</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Breakdown */}
          <View style={styles.statsStrip}>
            <View style={styles.statCol}>
              <Text style={styles.statColLabel}>Opening Balance</Text>
              <Text style={styles.statColValue}>₹ {selectedSupplier.openingBalance.toFixed(2)}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statColLabel}>Total Purchases</Text>
              <Text style={styles.statColValue}>₹ {totalPurchases.toFixed(2)}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statColLabel}>Total Payments</Text>
              <Text style={styles.statColValue}>₹ {totalPayments.toFixed(2)}</Text>
            </View>
            <View style={styles.statColHighlight}>
              <Text style={styles.highlightLabel}>Current Balance</Text>
              <Text style={styles.highlightVal}>₹ {currentBalance.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Tabs: Transactions, Make Payment */}
        <View style={styles.tabsStrip}>
          {(['Transactions', 'Make Payment'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab(t);
                if (t === 'Make Payment') {
                  setIsPaymentModalOpen(true);
                }
              }}
            >
              <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Supplier Ledger Table */}
        <View style={styles.ledgerTable}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: 78 }]}>Date</Text>
            <Text style={[styles.th, { width: 68 }]}>Type</Text>
            <Text style={[styles.th, { width: 70 }]}>Ref No</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Amount</Text>
            <Text style={[styles.th, { width: 78, textAlign: 'right' }]}>Balance</Text>
          </View>

          {transactions.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.td, { width: 78 }]}>{item.date}</Text>
              <Text
                style={[
                  styles.td,
                  { width: 68 },
                  item.type === 'Payment' ? styles.greenType : styles.blueType,
                ]}
              >
                {item.type}
              </Text>
              <Text style={[styles.td, { width: 70 }]}>{item.ref}</Text>
              <Text style={[styles.td, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>
                {item.type === 'Payment' ? `- ₹${item.amt.toFixed(2)}` : `₹${item.amt.toFixed(2)}`}
              </Text>
              <Text style={[styles.td, { width: 78, textAlign: 'right', fontWeight: '800' }]}>
                ₹{item.bal.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => setIsPaymentModalOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="card-outline" size={18} color="#FFFFFF" />
            <Text style={styles.payBtnText}>Record Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.purchaseBtn}
            onPress={() => setIsPurchaseModalOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={18} color={COLORS.primary} />
            <Text style={styles.purchaseBtnText}>+ New Purchase Entry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MODAL 1: DETAILED PURCHASE INWARD ENTRY WITH PHOTO OCR & BARCODE SCAN --- */}
      <Modal visible={isPurchaseModalOpen} animationType="slide">
        <DetailedPurchaseEntryScreen
          onBack={() => setIsPurchaseModalOpen(false)}
          products={products || []}
          onStockUpdated={(productId, inwardQty) => {
            if (onStockUpdated) {
              onStockUpdated(productId, inwardQty);
            }
          }}
          onPurchaseCompleted={(supName, billNum, totalAmt) => {
            const newTxn: SupplierTxn = {
              id: `st-${Date.now()}`,
              date: new Date().toLocaleDateString('en-IN'),
              type: 'Purchase',
              ref: billNum,
              amt: totalAmt,
              bal: currentBalance + totalAmt,
              productName: `${supName} Inward`,
              mode: 'Credit',
            };
            setSupplierLedgerMap((prev) => ({
              ...prev,
              [selectedSupplier.id]: [newTxn, ...(prev[selectedSupplier.id] || [])],
            }));
            setIsPurchaseModalOpen(false);
          }}
        />
      </Modal>

      {/* --- MODAL 2: RECORD PAYMENT TO SUPPLIER --- */}
      <Modal visible={isPaymentModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <Ionicons name="card" size={20} color="#10B981" />
                <Text style={styles.modalTitle}>Record Supplier Payment</Text>
              </View>
              <TouchableOpacity onPress={() => setIsPaymentModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalCustomerName}>
              Pay To: <Text style={{ fontWeight: '800', color: COLORS.primary }}>{selectedSupplier.name}</Text>
              {'  '}(Total Due: ₹{currentBalance.toFixed(2)})
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Payment Amount (₹) *</Text>
              <View style={styles.amountInputBox}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder={currentBalance > 0 ? currentBalance.toFixed(2) : '10000.00'}
                  placeholderTextColor="#94A3B8"
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="decimal-pad"
                  autoFocus={true}
                />
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Payment Mode</Text>
              <View style={styles.gstChipsRow}>
                {(['Bank', 'UPI', 'Cash', 'Cheque'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.gstChip, paymentMode === m && styles.gstChipActive]}
                    onPress={() => setPaymentMode(m)}
                  >
                    <Text style={[styles.gstChipText, paymentMode === m && styles.gstChipTextActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Reference / UTR / Cheque No</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. NEFT-20261015-09"
                placeholderTextColor="#94A3B8"
                value={paymentRef}
                onChangeText={setPaymentRef}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsPaymentModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: '#10B981' }]}
                onPress={handleSavePayment}
              >
                <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                <Text style={styles.modalSubmitText}>Confirm Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 3: NEW SUPPLIER MASTER ENTRY --- */}
      <Modal visible={isNewSupModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <Ionicons name="business" size={20} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Add New Supplier</Text>
              </View>
              <TouchableOpacity onPress={() => setIsNewSupModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Supplier Company Name *</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Parle Agro Wholesale"
                  placeholderTextColor="#94A3B8"
                  value={newSupName}
                  onChangeText={setNewSupName}
                  autoFocus={true}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. 9840012345"
                  placeholderTextColor="#94A3B8"
                  value={newSupPhone}
                  onChangeText={setNewSupPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Contact Person</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Ramesh (Sales Head)"
                  placeholderTextColor="#94A3B8"
                  value={newSupContact}
                  onChangeText={setNewSupContact}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>GSTIN (For Purchase Input Credit)</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. 33AAAAA1111A1Z1"
                  placeholderTextColor="#94A3B8"
                  value={newSupGstin}
                  onChangeText={setNewSupGstin}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Opening Balance Due to Supplier (₹)</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                  value={newSupOpeningBal}
                  onChangeText={setNewSupOpeningBal}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsNewSupModalOpen(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleSaveNewSupplier}
                >
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  <Text style={styles.modalSubmitText}>Save Supplier</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  supplierSelectorStrip: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  supplierChipsRow: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplierChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  supplierChipActive: {
    backgroundColor: COLORS.primary,
  },
  supplierChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  supplierChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  addSupplierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  addSupplierChipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  body: {
    padding: 16,
    paddingBottom: 30,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    ...SHADOWS.card,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profilePhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profileGstin: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 1,
  },
  purchaseQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  purchaseQuickText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  statsStrip: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
  },
  statColLabel: {
    fontSize: 9.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statColValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 3,
  },
  statColHighlight: {
    flex: 1.1,
    backgroundColor: '#FEF2F2',
    padding: 6,
    borderRadius: 8,
  },
  highlightLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#991B1B',
  },
  highlightVal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 2,
  },
  tabsStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  ledgerTable: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
    ...SHADOWS.card,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  th: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  td: {
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  blueType: {
    color: '#2563EB',
    fontWeight: '800',
  },
  greenType: {
    color: '#10B981',
    fontWeight: '800',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  payBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
    ...SHADOWS.card,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  purchaseBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: 6,
  },
  purchaseBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalCustomerName: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  modalInputGroup: {
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  modalTextInput: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colHalf: {
    flex: 1,
  },
  quickProductChips: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 6,
  },
  quickProdChip: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  quickProdChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  gstChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gstChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gstChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  gstChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  gstChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  calculationPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EDEBFB',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  calcLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  calcValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  amountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
