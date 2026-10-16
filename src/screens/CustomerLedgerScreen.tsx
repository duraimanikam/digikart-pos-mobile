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
import { Customer } from '../types';
import { INITIAL_CUSTOMERS } from '../database/sqlite';

interface CustomerLedgerScreenProps {
  onBack: () => void;
  onNewInvoice: (customer?: Customer) => void;
}

interface LedgerTxn {
  id: string;
  date: string;
  type: 'Invoice' | 'Receipt' | 'Adjustment';
  ref: string;
  amt: number;
  bal: number;
  mode?: string;
  notes?: string;
}

export const CustomerLedgerScreen: React.FC<CustomerLedgerScreenProps> = ({
  onBack,
  onNewInvoice,
}) => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    INITIAL_CUSTOMERS[0].id
  );
  const [activeTab, setActiveTab] = useState<'All' | 'Invoices' | 'Receipts' | 'Adjustments'>('All');

  // Customer Transaction Ledgers map by customer ID
  const [ledgerMap, setLedgerMap] = useState<Record<string, LedgerTxn[]>>({
    'cust-01': [
      { id: 'tx-1', date: '01-10-2026', type: 'Invoice', ref: '000123', amt: 2360, bal: 2360 },
      { id: 'tx-2', date: '03-10-2026', type: 'Receipt', ref: 'REC-001', amt: 1000, bal: 1360, mode: 'GPay' },
      { id: 'tx-3', date: '08-10-2026', type: 'Invoice', ref: '000156', amt: 1480, bal: 2840 },
      { id: 'tx-4', date: '12-10-2026', type: 'Receipt', ref: 'REC-002', amt: 1640, bal: 1200, mode: 'Cash' },
    ],
    'cust-02': [
      { id: 'tx-5', date: '05-10-2026', type: 'Invoice', ref: '000140', amt: 4500, bal: 4500 },
      { id: 'tx-6', date: '06-10-2026', type: 'Receipt', ref: 'REC-003', amt: 4500, bal: 0, mode: 'UPI' },
    ],
    'cust-03': [
      { id: 'tx-7', date: '10-10-2026', type: 'Invoice', ref: '000178', amt: 750, bal: 750 },
    ],
    'cust-04': [
      { id: 'tx-8', date: '02-10-2026', type: 'Invoice', ref: '000130', amt: 18500, bal: 18500 },
      { id: 'tx-9', date: '09-10-2026', type: 'Receipt', ref: 'REC-004', amt: 14000, bal: 4500, mode: 'Bank Transfer' },
    ],
  });

  // Modal States
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptMode, setReceiptMode] = useState<'Cash' | 'GPay' | 'PhonePe' | 'UPI' | 'Bank'>('Cash');
  const [receiptRef, setReceiptRef] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');

  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustOpeningBal, setNewCustOpeningBal] = useState('0');

  // Customer Dropdown Picker State
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const filteredDropdownCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      c.phone.includes(customerSearchQuery) ||
      (c.gstin && c.gstin.toLowerCase().includes(customerSearchQuery.toLowerCase()))
  );

  const transactions = ledgerMap[selectedCustomer.id] || [];

  // Calculate live totals
  const totalInvoices = transactions
    .filter((t) => t.type === 'Invoice')
    .reduce((s, t) => s + t.amt, 0);

  const totalReceipts = transactions
    .filter((t) => t.type === 'Receipt')
    .reduce((s, t) => s + t.amt, 0);

  const currentBalance = Math.max(0, totalInvoices - totalReceipts);

  // Filtered transactions by tab
  const filteredTransactions = transactions.filter((t) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Invoices') return t.type === 'Invoice';
    if (activeTab === 'Receipts') return t.type === 'Receipt';
    if (activeTab === 'Adjustments') return t.type === 'Adjustment';
    return true;
  });

  // Handle Save Receipt Entry
  const handleSaveReceipt = () => {
    const amt = parseFloat(receiptAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid receipt amount.');
      return;
    }

    const newTxn: LedgerTxn = {
      id: `tx-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).replace(/\//g, '-'),
      type: 'Receipt',
      ref: receiptRef.trim() || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      amt,
      bal: Math.max(0, currentBalance - amt),
      mode: receiptMode,
      notes: receiptNotes.trim(),
    };

    setLedgerMap((prev) => ({
      ...prev,
      [selectedCustomer.id]: [newTxn, ...(prev[selectedCustomer.id] || [])],
    }));

    // Update customer pending credit
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id
          ? { ...c, pendingCredit: Math.max(0, c.pendingCredit - amt) }
          : c
      )
    );

    // Reset and close
    setReceiptAmount('');
    setReceiptRef('');
    setReceiptNotes('');
    setIsReceiptModalOpen(false);
    Alert.alert('Receipt Recorded', `Successfully recorded ₹${amt.toFixed(2)} payment via ${receiptMode}.`);
  };

  // Handle Add New Customer
  const handleSaveNewCustomer = () => {
    if (!newCustName.trim()) {
      Alert.alert('Name Required', 'Please enter customer name.');
      return;
    }
    if (!newCustPhone.trim()) {
      Alert.alert('Phone Required', 'Please enter customer phone number.');
      return;
    }

    const openingBal = parseFloat(newCustOpeningBal) || 0;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
      gstin: newCustGstin.trim() || undefined,
      totalPurchases: openingBal,
      pendingCredit: openingBal,
      lastVisit: new Date().toLocaleDateString('en-IN'),
    };

    setCustomers((prev) => [newCust, ...prev]);
    setSelectedCustomerId(newCust.id);

    if (openingBal > 0) {
      setLedgerMap((prev) => ({
        ...prev,
        [newCust.id]: [
          {
            id: `tx-open-${Date.now()}`,
            date: new Date().toLocaleDateString('en-IN').replace(/\//g, '-'),
            type: 'Adjustment',
            ref: 'OPEN-BAL',
            amt: openingBal,
            bal: openingBal,
            notes: 'Opening Balance',
          },
        ],
      }));
    }

    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustGstin('');
    setNewCustOpeningBal('0');
    setIsNewCustModalOpen(false);
    Alert.alert('Customer Added', `Customer "${newCust.name}" registered successfully.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen Header */}
      <AppHeader
        title="Customer Ledger"
        showBack={true}
        onBack={onBack}
        rightIcon="person-add-outline"
        onRightPress={() => setIsNewCustModalOpen(true)}
      />

      {/* Customer Switcher Dropdown */}
      <View style={styles.customerDropdownStrip}>
        <TouchableOpacity
          style={styles.dropdownSelectorBtn}
          onPress={() => setIsCustomerDropdownOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.dropdownCustomerInfo}>
            <View style={styles.dropdownAvatarCircle}>
              <Text style={styles.dropdownAvatarText}>
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.dropdownTextGroup}>
              <View style={styles.dropdownNameRow}>
                <Text style={styles.dropdownCustomerName} numberOfLines={1}>
                  {selectedCustomer.name}
                </Text>
                {selectedCustomer.pendingCredit > 0 ? (
                  <View style={styles.dropdownDueBadge}>
                    <Text style={styles.dropdownDueText}>
                      ₹{selectedCustomer.pendingCredit.toLocaleString('en-IN')} Due
                    </Text>
                  </View>
                ) : (
                  <View style={styles.dropdownClearBadge}>
                    <Text style={styles.dropdownClearText}>Clear</Text>
                  </View>
                )}
              </View>
              <Text style={styles.dropdownCustomerPhone}>
                {selectedCustomer.phone} {selectedCustomer.gstin ? `• ${selectedCustomer.gstin}` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.dropdownChevronBtn}>
            <Ionicons name="chevron-down" size={18} color="#94A3B8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdownAddBtn}
          onPress={() => setIsNewCustModalOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={16} color="#FFFFFF" />
          <Text style={styles.dropdownAddBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Customer Profile Banner matching Screen 5 */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{selectedCustomer.name}</Text>
              <Text style={styles.profilePhone}>
                <Ionicons name="call-outline" size={12} color="#64748B" /> {selectedCustomer.phone}
              </Text>
              {selectedCustomer.gstin && (
                <Text style={styles.profileGstin}>GSTIN: {selectedCustomer.gstin}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.receiptQuickBtn}
              onPress={() => setIsReceiptModalOpen(true)}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.receiptQuickText}>Pay</Text>
            </TouchableOpacity>
          </View>

          {/* 4 Stats Columns */}
          <View style={styles.statsStrip}>
            <View style={styles.statCol}>
              <Text style={styles.statColLabel}>Opening Balance</Text>
              <Text style={styles.statColValue}>₹ 0.00</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statColLabel}>Total Invoices</Text>
              <Text style={styles.statColValue}>₹ {totalInvoices.toFixed(2)}</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statColLabel}>Total Receipts</Text>
              <Text style={styles.statColValue}>₹ {totalReceipts.toFixed(2)}</Text>
            </View>
            <View style={styles.statColHighlight}>
              <Text style={styles.highlightLabel}>Current Balance</Text>
              <Text style={styles.highlightVal}>₹ {currentBalance.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Tabs: All, Invoices, Receipts, Adjustments */}
        <View style={styles.tabsStrip}>
          {(['All', 'Invoices', 'Receipts', 'Adjustments'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ledger Table */}
        <View style={styles.ledgerTable}>
          <View style={styles.tableHead}>
            <Text style={[styles.th, { width: 78 }]}>Date</Text>
            <Text style={[styles.th, { width: 62 }]}>Type</Text>
            <Text style={[styles.th, { width: 70 }]}>Ref No</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Amount</Text>
            <Text style={[styles.th, { width: 76, textAlign: 'right' }]}>Balance</Text>
          </View>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyTableState}>
              <Ionicons name="document-text-outline" size={32} color="#94A3B8" />
              <Text style={styles.emptyTableText}>No transactions under "{activeTab}"</Text>
            </View>
          ) : (
            filteredTransactions.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.td, { width: 78 }]}>{item.date}</Text>
                <Text
                  style={[
                    styles.td,
                    { width: 62 },
                    item.type === 'Receipt'
                      ? styles.greenType
                      : item.type === 'Adjustment'
                      ? styles.orangeType
                      : styles.blueType,
                  ]}
                >
                  {item.type}
                </Text>
                <Text style={[styles.td, { width: 70 }]}>{item.ref}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>
                  {item.type === 'Receipt' ? `- ₹${item.amt.toFixed(2)}` : `₹${item.amt.toFixed(2)}`}
                </Text>
                <Text style={[styles.td, { width: 76, textAlign: 'right', fontWeight: '800' }]}>
                  ₹{item.bal.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.receiptBtn}
            onPress={() => setIsReceiptModalOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="cash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.receiptBtnText}>Add Receipt (Receive Payment)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newInvoiceBtn}
            onPress={() => onNewInvoice(selectedCustomer)}
            activeOpacity={0.8}
          >
            <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
            <Text style={styles.newInvoiceBtnText}>New Bill for this Customer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MODAL 1: ADD RECEIPT (RECORD CUSTOMER PAYMENT ENTRY) --- */}
      <Modal visible={isReceiptModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <Ionicons name="cash" size={20} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Add Customer Receipt</Text>
              </View>
              <TouchableOpacity onPress={() => setIsReceiptModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalCustomerName}>
              Customer: <Text style={{ fontWeight: '800', color: COLORS.primary }}>{selectedCustomer.name}</Text>
              {'  '}(Due: ₹{currentBalance.toFixed(2)})
            </Text>

            {/* Receipt Amount */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Receipt Amount (₹) *</Text>
              <View style={styles.amountInputBox}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder={currentBalance > 0 ? currentBalance.toFixed(2) : '500.00'}
                  placeholderTextColor="#94A3B8"
                  value={receiptAmount}
                  onChangeText={setReceiptAmount}
                  keyboardType="decimal-pad"
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Payment Mode */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Payment Mode</Text>
              <View style={styles.paymentModesRow}>
                {(['Cash', 'GPay', 'PhonePe', 'UPI', 'Bank'] as const).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.modeOptionChip,
                      receiptMode === mode && styles.modeOptionChipActive,
                    ]}
                    onPress={() => setReceiptMode(mode)}
                  >
                    <Text
                      style={[
                        styles.modeOptionText,
                        receiptMode === mode && styles.modeOptionTextActive,
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reference / Txn No */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Reference / UTR / Cheque No</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. UPI-20261015-889"
                placeholderTextColor="#94A3B8"
                value={receiptRef}
                onChangeText={setReceiptRef}
              />
            </View>

            {/* Notes */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Notes / Remarks</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Cleared Diwali balance"
                placeholderTextColor="#94A3B8"
                value={receiptNotes}
                onChangeText={setReceiptNotes}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsReceiptModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveReceipt}
              >
                <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                <Text style={styles.modalSubmitText}>Save Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: ADD NEW CUSTOMER ENTRY --- */}
      <Modal visible={isNewCustModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <Ionicons name="person-add" size={20} color={COLORS.primary} />
                <Text style={styles.modalTitle}>New Customer Entry</Text>
              </View>
              <TouchableOpacity onPress={() => setIsNewCustModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Customer Name *</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Murugan Stores / Rajesh"
                  placeholderTextColor="#94A3B8"
                  value={newCustName}
                  onChangeText={setNewCustName}
                  autoFocus={true}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Mobile Phone *</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. 9876543210"
                  placeholderTextColor="#94A3B8"
                  value={newCustPhone}
                  onChangeText={setNewCustPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Address / Area</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. 14, Main Bazaar, Chennai"
                  placeholderTextColor="#94A3B8"
                  value={newCustAddress}
                  onChangeText={setNewCustAddress}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>GSTIN (For B2B Billing)</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  placeholderTextColor="#94A3B8"
                  value={newCustGstin}
                  onChangeText={setNewCustGstin}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Opening Balance Due (₹)</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                  value={newCustOpeningBal}
                  onChangeText={setNewCustOpeningBal}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsNewCustModalOpen(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleSaveNewCustomer}
                >
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  <Text style={styles.modalSubmitText}>Save Customer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 3: SEARCHABLE CUSTOMER DROPDOWN PICKER --- */}
      <Modal visible={isCustomerDropdownOpen} transparent animationType="fade" onRequestClose={() => setIsCustomerDropdownOpen(false)}>
        <TouchableOpacity
          style={styles.dropdownModalBackdrop}
          activeOpacity={1}
          onPress={() => setIsCustomerDropdownOpen(false)}
        >
          <View style={styles.dropdownModalCard}>
            <View style={styles.dropdownModalHeader}>
              <View style={styles.dropdownModalTitleRow}>
                <Ionicons name="people" size={20} color={COLORS.primary} />
                <Text style={styles.dropdownModalTitle}>Select Customer ({customers.length})</Text>
              </View>
              <TouchableOpacity onPress={() => setIsCustomerDropdownOpen(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.dropdownSearchBox}>
              <Ionicons name="search" size={18} color="#94A3B8" />
              <TextInput
                style={styles.dropdownSearchInput}
                placeholder="Search by name, phone or GSTIN..."
                placeholderTextColor="#94A3B8"
                value={customerSearchQuery}
                onChangeText={setCustomerSearchQuery}
              />
              {customerSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setCustomerSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Customer List */}
            <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
              {filteredDropdownCustomers.map((c) => {
                const isSelected = c.id === selectedCustomerId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.dropdownListItem,
                      isSelected && styles.dropdownListItemActive,
                    ]}
                    onPress={() => {
                      setSelectedCustomerId(c.id);
                      setIsCustomerDropdownOpen(false);
                      setCustomerSearchQuery('');
                    }}
                  >
                    <View style={[styles.dropdownItemAvatar, isSelected && styles.dropdownItemAvatarActive]}>
                      <Text style={[styles.dropdownItemAvatarText, isSelected && styles.dropdownItemAvatarTextActive]}>
                        {c.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.dropdownItemContent}>
                      <Text style={[styles.dropdownItemName, isSelected && styles.dropdownItemNameActive]} numberOfLines={1}>
                        {c.name}
                      </Text>
                      <Text style={styles.dropdownItemPhone}>
                        {c.phone} {c.address ? `• ${c.address}` : ''}
                      </Text>
                    </View>

                    <View style={styles.dropdownItemRight}>
                      {c.pendingCredit > 0 ? (
                        <Text style={styles.dropdownItemDueText}>
                          ₹{c.pendingCredit.toLocaleString('en-IN')}
                        </Text>
                      ) : (
                        <Text style={styles.dropdownItemZeroText}>₹0</Text>
                      )}
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {filteredDropdownCustomers.length === 0 && (
                <View style={styles.dropdownEmptyState}>
                  <Text style={styles.dropdownEmptyText}>No matching customers found</Text>
                </View>
              )}
            </ScrollView>

            {/* Footer: + Add New Customer */}
            <TouchableOpacity
              style={styles.dropdownModalAddBtn}
              onPress={() => {
                setIsCustomerDropdownOpen(false);
                setIsNewCustModalOpen(true);
              }}
            >
              <Ionicons name="person-add" size={16} color="#FFFFFF" />
              <Text style={styles.dropdownModalAddBtnText}>+ Add New Customer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  customerDropdownStrip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownSelectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  dropdownCustomerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  dropdownAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  dropdownTextGroup: {
    flex: 1,
  },
  dropdownNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownCustomerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    maxWidth: 160,
  },
  dropdownDueBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dropdownDueText: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '800',
  },
  dropdownClearBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dropdownClearText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  dropdownCustomerPhone: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  dropdownChevronBtn: {
    paddingLeft: 6,
  },
  dropdownAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 5,
    ...SHADOWS.card,
  },
  dropdownAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  dropdownModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dropdownModalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    ...SHADOWS.card,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dropdownModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownModalTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
  dropdownSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 12,
  },
  dropdownSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  dropdownList: {
    maxHeight: 280,
  },
  dropdownListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  dropdownListItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  dropdownItemAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dropdownItemAvatarActive: {
    backgroundColor: COLORS.primary,
  },
  dropdownItemAvatarText: {
    color: '#475569',
    fontWeight: '800',
    fontSize: 13,
  },
  dropdownItemAvatarTextActive: {
    color: '#FFFFFF',
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemName: {
    color: '#1E293B',
    fontSize: 13.5,
    fontWeight: '700',
  },
  dropdownItemNameActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  dropdownItemPhone: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  dropdownItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownItemDueText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
  },
  dropdownItemZeroText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  dropdownEmptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownModalAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  dropdownModalAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
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
  receiptQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  receiptQuickText: {
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
  orangeType: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  emptyTableState: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTableText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  actionButtons: {
    gap: 10,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    ...SHADOWS.card,
  },
  receiptBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  newInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: 8,
  },
  newInvoiceBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
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
  paymentModesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeOptionChip: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  modeOptionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modeOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
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
