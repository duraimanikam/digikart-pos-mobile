import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';
import { ScreenName } from './HomeScreen';
import { PrintOptionsModal } from '../components/PrintOptionsModal';
import { DEFAULT_SETTINGS } from '../database/sqlite';
import { Invoice } from '../types';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: ScreenName) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const [cloudSyncEnabled, setCloudSyncEnabled] = React.useState(true);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = React.useState(false);

  // Test Invoice for Printer Testing
  const sampleInvoice: Invoice = {
    id: 'test-inv-001',
    invoiceNo: 'TEST-0001',
    date: new Date().toISOString(),
    customerName: 'Test Customer (Counter)',
    customerPhone: '9876543210',
    isB2B: false,
    isInterstate: false,
    subtotal: 100.0,
    discount: 0,
    taxableAmount: 95.24,
    totalCgst: 2.38,
    totalSgst: 2.38,
    totalIgst: 0,
    grandTotal: 100.0,
    paymentMode: 'Cash',
    items: [
      {
        productId: 'p-1',
        productName: 'Sample GST Test Product',
        hsn: '2106',
        quantity: 1,
        unit: 'pcs',
        unitPrice: 100.0,
        gstRate: 5,
        taxableAmount: 95.24,
        cgstAmount: 2.38,
        sgstAmount: 2.38,
        igstAmount: 0,
        totalAmount: 100.0,
      },
    ],
  };

  const settingsList = [
    {
      id: 'shop_details',
      title: 'Shop Details',
      icon: 'storefront-outline',
      color: '#4F46B8',
      action: () => Alert.alert('Shop Details', 'DigiKart Super Market\nGSTIN: 33ABCDE1234F1Z5\nChennai - 600001'),
    },
    {
      id: 'categories',
      title: 'Manage Categories',
      icon: 'grid-outline',
      color: '#F59E0B',
      action: () => Alert.alert('Categories', 'Spices, Dairy, Snacks, Beverages, Staples, Personal Care'),
    },
    {
      id: 'units',
      title: 'Manage Units',
      icon: 'scale-outline',
      color: '#06B6D4',
      action: () => Alert.alert('Units', '500 g, 1 Ltr, 200 g, 750 ml, 1 kg, pcs'),
    },
    {
      id: 'barcode',
      title: 'Barcode Settings',
      icon: 'barcode-outline',
      color: '#4F46B8',
      action: () => Alert.alert('Barcode Settings', 'EAN-13, Code 128, Auto-generate enabled'),
    },
    {
      id: 'printer',
      title: 'Printer Settings (Wi-Fi & Bluetooth)',
      icon: 'print-outline',
      color: '#0284C7',
      action: () => setIsPrinterModalOpen(true),
    },
    {
      id: 'backup_restore',
      title: 'Backup & Restore',
      icon: 'server-outline',
      color: '#10B981',
      action: () => onNavigate('backup_restore'),
    },
    {
      id: 'cloud_sync',
      title: 'Cloud Sync (Optional)',
      icon: 'cloud-outline',
      color: '#2563EB',
      action: () => onNavigate('backup_restore'),
      hasSwitch: true,
    },
    {
      id: 'theme',
      title: 'App Theme',
      icon: 'color-palette-outline',
      color: '#F59E0B',
      action: () => Alert.alert('Theme', 'Royal Purple Theme (Active)'),
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle-outline',
      color: '#4F46B8',
      action: () =>
        Alert.alert(
          'About DigiKart POS',
          'v1.0.0 | DigiKart POS\nRetail Billing Made Simple\nOffline First • GST Ready • Photo AI Scan'
        ),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 10 Header */}
      <AppHeader title="Settings" showBack={true} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.menuCard}>
          {settingsList.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === settingsList.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>

              {item.hasSwitch ? (
                <Switch
                  value={cloudSyncEnabled}
                  onValueChange={setCloudSyncEnabled}
                  trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
                  thumbColor={cloudSyncEnabled ? COLORS.primary : '#94A3B8'}
                />
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Nav to Screen 11 (Login) */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => onNavigate('login')}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutBtnText}>Switch User / Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Printer Configuration & Test Print Modal */}
      <PrintOptionsModal
        visible={isPrinterModalOpen}
        onClose={() => setIsPrinterModalOpen(false)}
        invoice={sampleInvoice}
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
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 20,
    gap: 8,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
