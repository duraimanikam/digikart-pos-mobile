import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { ScreenName } from '../screens/HomeScreen';

interface TopMenuBarProps {
  onNavigate: (screen: ScreenName) => void;
  activeScreen?: ScreenName;
}

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen?: ScreenName;
  hasDropdown?: boolean;
  options?: { label: string; screen: ScreenName }[];
}

export const TopMenuBar: React.FC<TopMenuBarProps> = ({ onNavigate }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'registration',
      label: 'Registration',
      icon: 'document-text-outline',
      hasDropdown: true,
      options: [
        { label: 'Shop Details & GSTIN', screen: 'settings' },
        { label: 'Manage Units', screen: 'settings' },
        { label: 'Barcode Settings', screen: 'settings' },
      ],
    },
    {
      id: 'masters',
      label: 'Masters',
      icon: 'server-outline',
      hasDropdown: true,
      options: [
        { label: 'Product Master Catalog', screen: 'products_list' },
        { label: 'Add New Product', screen: 'product_details' },
        { label: 'Category Master', screen: 'settings' },
      ],
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: 'people-outline',
      hasDropdown: true,
      options: [
        { label: 'Customer Directory & Ledger', screen: 'customer_ledger' },
        { label: 'Add New Customer', screen: 'customer_ledger' },
        { label: 'Outstanding Credit Balances', screen: 'customer_ledger' },
      ],
    },
    {
      id: 'supplier',
      label: 'Supplier',
      icon: 'bus-outline',
      hasDropdown: true,
      options: [
        { label: 'Supplier Ledger & Payments', screen: 'supplier_ledger' },
        { label: 'Purchase Inward Stock', screen: 'supplier_ledger' },
      ],
    },
    {
      id: 'retail_bill',
      label: 'Retail Bill',
      icon: 'cart-outline',
      hasDropdown: true,
      options: [
        { label: 'New Retail Bill (POS)', screen: 'new_bill' },
        { label: 'Barcode Laser Scanner', screen: 'scan_photo' },
        { label: 'Daily Invoices List', screen: 'sales_reports' },
      ],
    },
    {
      id: 'pos_touch',
      label: 'POS Touch',
      icon: 'desktop-outline',
      hasDropdown: true,
      options: [
        { label: 'Touch Billing Screen', screen: 'new_bill' },
        { label: 'Speed Counter Mode', screen: 'new_bill' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'bar-chart-outline',
      hasDropdown: true,
      options: [
        { label: 'Daily Sales Report', screen: 'sales_reports' },
        { label: 'GST GSTR-1 Report', screen: 'gst_reports' },
        { label: 'Stock Valuation Report', screen: 'stock_report' },
        { label: 'Profit & Loss Statement', screen: 'profit_loss' },
      ],
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: 'swap-horizontal-outline',
      hasDropdown: true,
      options: [
        { label: 'Daily Register Closing', screen: 'daily_closing' },
        { label: 'Cash & Bank Accounts', screen: 'accounts' },
        { label: 'Expense Vouchers', screen: 'expense_voucher' },
      ],
    },
    {
      id: 'backup_restore',
      label: 'Back Up and Restore',
      icon: 'shield-checkmark-outline',
      hasDropdown: true,
      options: [
        { label: 'Manual Backup', screen: 'backup_restore' },
        { label: 'Restore from Cloud/File', screen: 'backup_restore' },
        { label: 'Demo Data Reset', screen: 'settings' },
      ],
    },
  ];

  const handleItemPress = (item: MenuItem) => {
    if (item.options && item.options.length > 0) {
      Alert.alert(
        `${item.label} Menu`,
        'Select an action:',
        [
          ...item.options.map((opt) => ({
            text: opt.label,
            onPress: () => onNavigate(opt.screen),
          })),
          { text: 'Cancel', style: 'cancel' as const },
        ]
      );
    } else if (item.screen) {
      onNavigate(item.screen);
    }
  };

  return (
    <View style={styles.topBarContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.menuScroll}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon} size={15} color={COLORS.topMenuIcon} />
            <Text style={styles.menuItemText}>{item.label}</Text>
            {item.hasDropdown && (
              <Ionicons name="chevron-down" size={12} color={COLORS.topMenuChevron} />
            )}
          </TouchableOpacity>
        ))}

        {/* Minimize Pill matching screenshot 1 */}
        <TouchableOpacity
          style={styles.minimizeBtn}
          onPress={() => Alert.alert('App Status', 'DigiKart POS System Active • Online Offline Sync')}
          activeOpacity={0.7}
        >
          <Ionicons name="remove-circle" size={15} color={COLORS.topMenuMinimize} />
          <Text style={styles.minimizeText}>Minimize</Text>
        </TouchableOpacity>

        {/* Window controls on far right */}
        <View style={styles.windowControls}>
          <Text style={styles.winControlBtn}>—</Text>
          <Text style={styles.winControlBtn}>□</Text>
          <Text style={styles.winControlBtn}>✕</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topBarContainer: {
    backgroundColor: COLORS.topMenuBg,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.topMenuBorder,
    zIndex: 100,
  },
  menuScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  menuItemText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.topMenuText,
  },
  minimizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    marginLeft: 6,
  },
  minimizeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  windowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    marginLeft: 6,
  },
  winControlBtn: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
});
