import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';

const ANDROID_STATUS_BAR = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

export type ScreenName =
  | 'home'
  | 'scan_photo'
  | 'detect_product'
  | 'confirm_add'
  | 'new_bill'
  | 'products_list'
  | 'product_details'
  | 'sales_reports'
  | 'bill_print'
  | 'settings'
  | 'login'
  | 'daily_closing'
  | 'gst_reports'
  | 'accounts'
  | 'customer_ledger'
  | 'supplier_ledger'
  | 'expense_voucher'
  | 'profit_loss'
  | 'stock_report'
  | 'backup_restore';

interface HomeScreenProps {
  onNavigate: (screen: ScreenName) => void;
  cartCount: number;
  onOpenMenu: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  cartCount,
  onOpenMenu,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Header matching Screen 1 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onOpenMenu} activeOpacity={0.7}>
          <Ionicons name="menu" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>DigiKart POS</Text>
          <Text style={styles.headerSubtitle}>Retail Billing Made Simple</Text>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => onNavigate('settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* 8 Action Tiles Grid - Exactly matching Screen 1 */}
        <View style={styles.grid}>
          {/* 1. Barcode & QR Scanner (Dedicated Real-time Camera Scanner) */}
          <TouchableOpacity
            style={[styles.tileCard, styles.tileCardActive]}
            onPress={() => onNavigate('scan_photo')}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Ionicons name="barcode-outline" size={34} color={COLORS.secondary} />
            </View>
            <Text style={styles.tileTitleActive}>Barcode Scanner</Text>
            <Text style={styles.tileSubActive}>(Dedicated 1D & QR)</Text>
          </TouchableOpacity>

          {/* 2. New Bill */}
          <TouchableOpacity
            style={styles.tileCard}
            onPress={() => onNavigate('new_bill')}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Ionicons name="cart" size={32} color={COLORS.primary} />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.tileTitle}>New Bill</Text>
          </TouchableOpacity>

          {/* 3. Products */}
          <TouchableOpacity
            style={styles.tileCard}
            onPress={() => onNavigate('products_list')}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Ionicons name="cube" size={32} color="#C2410C" />
            </View>
            <Text style={styles.tileTitle}>Products</Text>
          </TouchableOpacity>

          {/* 4. Customers */}
          <TouchableOpacity
            style={styles.tileCard}
            onPress={() => onNavigate('customer_ledger')}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Ionicons name="people" size={32} color="#2563EB" />
            </View>
            <Text style={styles.tileTitle}>Customers</Text>
          </TouchableOpacity>

          {/* 5. Sales Reports */}
          <TouchableOpacity
            style={styles.tileCard}
            onPress={() => onNavigate('sales_reports')}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Ionicons name="bar-chart" size={32} color="#2563EB" />
            </View>
            <Text style={styles.tileTitle}>Sales Reports</Text>
          </TouchableOpacity>

          {/* 6. Purchase */}
          <TouchableOpacity
            style={styles.tileCard}
            onPress={() => onNavigate('supplier_ledger')}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Ionicons name="bus" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.tileTitle}>Purchase</Text>
          </TouchableOpacity>

          {/* 7. Stock Report */}
          <TouchableOpacity
            style={styles.tileCard}
            onPress={() => onNavigate('stock_report')}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Ionicons name="server" size={32} color="#0284C7" />
            </View>
            <Text style={styles.tileTitle}>Stock Report</Text>
          </TouchableOpacity>

          {/* 8. Settings */}
          <TouchableOpacity
            style={styles.tileCard}
            onPress={() => onNavigate('settings')}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Ionicons name="settings" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.tileTitle}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Jump Bar for all modules */}
        <View style={styles.quickAccessCard}>
          <Text style={styles.quickAccessTitle}>MORE REGISTER & ACCOUNTING MODULES</Text>
          <View style={styles.quickPillsRow}>
            <TouchableOpacity
              style={styles.quickPill}
              onPress={() => onNavigate('daily_closing')}
            >
              <Ionicons name="lock-closed-outline" size={14} color={COLORS.primary} />
              <Text style={styles.quickPillText}>Daily Closing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickPill}
              onPress={() => onNavigate('gst_reports')}
            >
              <Ionicons name="receipt-outline" size={14} color={COLORS.primary} />
              <Text style={styles.quickPillText}>GST Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickPill}
              onPress={() => onNavigate('accounts')}
            >
              <Ionicons name="wallet-outline" size={14} color={COLORS.primary} />
              <Text style={styles.quickPillText}>Accounts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickPill}
              onPress={() => onNavigate('profit_loss')}
            >
              <Ionicons name="trending-up-outline" size={14} color={COLORS.primary} />
              <Text style={styles.quickPillText}>P & L Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation matching Screen 1 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('home')}>
          <Ionicons name="home" size={24} color={COLORS.tabActive} />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('new_bill')}>
          <Ionicons name="receipt-outline" size={24} color={COLORS.tabInactive} />
          <Text style={styles.navText}>Bills</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('products_list')}>
          <Ionicons name="cube-outline" size={24} color={COLORS.tabInactive} />
          <Text style={styles.navText}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('sales_reports')}>
          <Ionicons name="bar-chart-outline" size={24} color={COLORS.tabInactive} />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: ANDROID_STATUS_BAR + 10,
    paddingBottom: 14,
  },
  iconBtn: {
    padding: 4,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  body: {
    padding: 16,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  tileCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
    ...SHADOWS.card,
  },
  tileCardActive: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: COLORS.primaryTint,
  },
  iconBox: {
    marginBottom: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  tileTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  tileTitleActive: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  tileSubActive: {
    color: COLORS.primaryMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  quickAccessCard: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAccessTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  quickPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  quickPillText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    ...SHADOWS.floating,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  navText: {
    color: COLORS.tabInactive,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  navTextActive: {
    color: COLORS.tabActive,
    fontWeight: '800',
  },
});
