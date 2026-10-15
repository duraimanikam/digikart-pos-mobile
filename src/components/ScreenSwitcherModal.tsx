import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { ScreenName } from '../screens/HomeScreen';

interface ScreenSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  currentScreen: ScreenName;
  onSelectScreen: (screen: ScreenName) => void;
}

export const ScreenSwitcherModal: React.FC<ScreenSwitcherModalProps> = ({
  visible,
  onClose,
  currentScreen,
  onSelectScreen,
}) => {
  const image1Screens: { id: ScreenName; number: number; label: string; icon: string }[] = [
    { id: 'home', number: 1, label: '1. Home Screen', icon: 'home-outline' },
    { id: 'scan_photo', number: 2, label: '2. Take Photo', icon: 'camera-outline' },
    { id: 'detect_product', number: 3, label: '3. Auto Detect Name', icon: 'scan-outline' },
    { id: 'confirm_add', number: 4, label: '4. Confirm & Add', icon: 'add-circle-outline' },
    { id: 'new_bill', number: 5, label: '5. Billing Screen (New Bill)', icon: 'receipt-outline' },
    { id: 'products_list', number: 6, label: '6. Product List', icon: 'cube-outline' },
    { id: 'product_details', number: 7, label: '7. Product Master (Details)', icon: 'create-outline' },
    { id: 'sales_reports', number: 8, label: '8. Reports Dashboard', icon: 'bar-chart-outline' },
    { id: 'bill_print', number: 9, label: '9. Print Bill & WhatsApp Share', icon: 'print-outline' },
    { id: 'settings', number: 10, label: '10. Settings', icon: 'settings-outline' },
  ];

  const image2Screens: { id: ScreenName; number: number; label: string; icon: string }[] = [
    { id: 'login', number: 1, label: '1. Login Screen', icon: 'log-in-outline' },
    { id: 'daily_closing', number: 2, label: '2. Daily Closing', icon: 'lock-closed-outline' },
    { id: 'gst_reports', number: 3, label: '3. GST Reports (GSTR-1)', icon: 'document-text-outline' },
    { id: 'accounts', number: 4, label: '4. Accounting Dashboard', icon: 'wallet-outline' },
    { id: 'customer_ledger', number: 5, label: '5. Customer Ledger', icon: 'people-outline' },
    { id: 'supplier_ledger', number: 6, label: '6. Supplier Ledger & Payment', icon: 'bus-outline' },
    { id: 'expense_voucher', number: 7, label: '7. Expense Voucher', icon: 'flash-outline' },
    { id: 'profit_loss', number: 8, label: '8. Profit & Loss Report', icon: 'trending-up-outline' },
    { id: 'stock_report', number: 9, label: '9. Stock Movement & Valuation', icon: 'server-outline' },
    { id: 'backup_restore', number: 10, label: '10. Backup & Restore', icon: 'shield-checkmark-outline' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>DigiKart POS Screens (20 Screens)</Text>
              <Text style={styles.sheetSubtitle}>Jump directly to any screen from the 2 image sets</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Image 1 Group */}
            <Text style={styles.sectionHeader}>IMAGE 1: CORE POS & PHOTO BILLING</Text>
            <View style={styles.grid}>
              {image1Screens.map((s) => {
                const isActive = currentScreen === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.itemCard, isActive && styles.itemCardActive]}
                    onPress={() => {
                      onSelectScreen(s.id);
                      onClose();
                    }}
                  >
                    <Ionicons
                      name={s.icon as any}
                      size={18}
                      color={isActive ? COLORS.primary : '#64748B'}
                    />
                    <Text
                      style={[styles.itemText, isActive && styles.itemTextActive]}
                      numberOfLines={1}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Image 2 Group */}
            <Text style={[styles.sectionHeader, { marginTop: 18 }]}>
              IMAGE 2: ACCOUNTS, LEDGERS & GST
            </Text>
            <View style={styles.grid}>
              {image2Screens.map((s) => {
                const isActive = currentScreen === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.itemCard, isActive && styles.itemCardActive]}
                    onPress={() => {
                      onSelectScreen(s.id);
                      onClose();
                    }}
                  >
                    <Ionicons
                      name={s.icon as any}
                      size={18}
                      color={isActive ? COLORS.primary : '#64748B'}
                    />
                    <Text
                      style={[styles.itemText, isActive && styles.itemTextActive]}
                      numberOfLines={1}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  grid: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  itemCardActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  itemText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  itemTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
