import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/colors';
import { TopMenuBar } from '../components/TopMenuBar';
import { dbService } from '../database/sqlite';

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
  const { width } = useWindowDimensions();
  const isWide = width >= 860;

  const [todaySales, setTodaySales] = useState<number>(0);
  const [todayCash, setTodayCash] = useState<number>(0);
  const [bankAccounts, setBankAccounts] = useState<number>(0);
  const [creditSales, setCreditSales] = useState<number>(0);

  useEffect(() => {
    dbService.getCurrentShift().then((shift) => {
      if (shift) {
        const total =
          (shift.cashSales || 0) +
          (shift.gpaySales || 0) +
          (shift.phonepeSales || 0) +
          (shift.paytmSales || 0) +
          (shift.bankSales || 0) +
          (shift.creditSales || 0);
        setTodaySales(total);
        setTodayCash(shift.cashSales || 0);
        setBankAccounts((shift.bankSales || 0) + (shift.gpaySales || 0) + (shift.phonepeSales || 0));
        setCreditSales(shift.creditSales || 0);
      }
    });
  }, []);

  const formatCurrency = (amount: number) => {
    return `₹ ${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // 9 Quick Access Module Cards exactly matching client Screenshot 2
  const quickAccessModules = [
    {
      id: 'stock_entry',
      title: 'Stock Entry',
      subtitle: 'Manage stock items',
      icon: 'home',
      screen: 'products_list' as ScreenName,
      cardBg: COLORS.cardStockBg,
      borderColor: COLORS.cardStockBorder,
      iconColor: '#FFFFFF',
      iconBoxBg: COLORS.cardStockIcon,
      pillColor: '#DBEAFE',
      arrowColor: '#0284C7',
    },
    {
      id: 'retail_bill',
      title: 'Retail Bill',
      subtitle: 'Create retail invoices',
      icon: 'cart',
      screen: 'new_bill' as ScreenName,
      cardBg: COLORS.cardRetailBg,
      borderColor: COLORS.cardRetailBorder,
      iconColor: '#FFFFFF',
      iconBoxBg: COLORS.cardRetailIcon,
      pillColor: '#FFEDD5',
      arrowColor: '#EA580C',
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'touch_pos',
      title: 'Touch POS',
      subtitle: 'Fast billing interface',
      icon: 'desktop-outline',
      screen: 'new_bill' as ScreenName,
      cardBg: COLORS.cardTouchBg,
      borderColor: COLORS.cardTouchBorder,
      iconColor: '#FFFFFF',
      iconBoxBg: COLORS.cardTouchIcon,
      pillColor: '#EDE9FE',
      arrowColor: '#7C3AED',
    },
    {
      id: 'purchase',
      title: 'Purchase',
      subtitle: 'Manage purchase bills',
      icon: 'barcode-outline',
      screen: 'supplier_ledger' as ScreenName,
      cardBg: COLORS.cardPurchaseBg,
      borderColor: COLORS.cardPurchaseBorder,
      iconColor: '#FFFFFF',
      iconBoxBg: COLORS.cardPurchaseIcon,
      pillColor: '#EDE9FE',
      arrowColor: '#8B5CF6',
    },
    {
      id: 'customer',
      title: 'Customer',
      subtitle: 'Manage customer details',
      icon: 'person-add',
      screen: 'customer_ledger' as ScreenName,
      cardBg: COLORS.cardCustomerBg,
      borderColor: COLORS.cardCustomerBorder,
      iconColor: '#FFFFFF',
      iconBoxBg: COLORS.cardCustomerIcon,
      pillColor: '#DCFCE7',
      arrowColor: '#10B981',
    },
    {
      id: 'supplier',
      title: 'Supplier',
      subtitle: 'Manage supplier details',
      icon: 'bus',
      screen: 'supplier_ledger' as ScreenName,
      cardBg: COLORS.cardSupplierBg,
      borderColor: COLORS.cardSupplierBorder,
      iconColor: '#FFFFFF',
      iconBoxBg: COLORS.cardSupplierIcon,
      pillColor: '#DBEAFE',
      arrowColor: '#2563EB',
    },
    {
      id: 'payment',
      title: 'Payment',
      subtitle: 'Receive and make payments',
      icon: 'cash',
      screen: 'expense_voucher' as ScreenName,
      cardBg: COLORS.cardPaymentBg,
      borderColor: COLORS.cardPaymentBorder,
      iconColor: '#FFFFFF',
      iconBoxBg: COLORS.cardPaymentIcon,
      pillColor: '#CCFBF1',
      arrowColor: '#0D9488',
    },
    {
      id: 'receipt',
      title: 'Receipt',
      subtitle: 'View receipts and history',
      icon: 'receipt',
      screen: 'sales_reports' as ScreenName,
      cardBg: COLORS.cardReceiptBg,
      borderColor: COLORS.cardReceiptBorder,
      iconColor: '#FFFFFF',
      iconBoxBg: COLORS.cardReceiptIcon,
      pillColor: '#FEF3C7',
      arrowColor: '#D97706',
    },
    {
      id: 'logout',
      title: 'Log out',
      subtitle: 'Close current session',
      icon: 'log-out',
      screen: 'login' as ScreenName,
      cardBg: COLORS.cardLogoutBg,
      borderColor: COLORS.cardLogoutBorder,
      iconColor: '#FFFFFF',
      iconBoxBg: COLORS.cardLogoutIcon,
      pillColor: '#FFE4E6',
      arrowColor: '#E11D48',
    },
  ];

  // 4 KPI Summary Cards with Mild Color Backgrounds exactly matching client Screenshot 2
  const kpiCards = [
    {
      id: 'today_sales',
      label: 'Today Sales',
      amount: formatCurrency(todaySales),
      icon: 'cart',
      cardBg: COLORS.kpiGreenBg,
      borderColor: COLORS.kpiGreenBorder,
      iconBoxBg: COLORS.kpiGreenIcon,
      amountColor: COLORS.kpiGreenText,
      pillBg: COLORS.kpiGreenPill,
      arrowColor: '#16A34A',
      onPress: () => onNavigate('sales_reports'),
    },
    {
      id: 'today_cash',
      label: 'Today Cash',
      amount: formatCurrency(todayCash),
      icon: 'wallet',
      cardBg: COLORS.kpiPurpleBg,
      borderColor: COLORS.kpiPurpleBorder,
      iconBoxBg: COLORS.kpiPurpleIcon,
      amountColor: COLORS.kpiPurpleText,
      pillBg: COLORS.kpiPurplePill,
      arrowColor: '#9333EA',
      onPress: () => onNavigate('daily_closing'),
    },
    {
      id: 'bank_accounts',
      label: 'Bank+Other Accounts',
      amount: formatCurrency(bankAccounts),
      icon: 'business',
      cardBg: COLORS.kpiOrangeBg,
      borderColor: COLORS.kpiOrangeBorder,
      iconBoxBg: COLORS.kpiOrangeIcon,
      amountColor: COLORS.kpiOrangeText,
      pillBg: COLORS.kpiOrangePill,
      arrowColor: '#EA580C',
      onPress: () => onNavigate('accounts'),
    },
    {
      id: 'credit_sales',
      label: 'Credit Sales',
      amount: formatCurrency(creditSales),
      icon: 'person',
      cardBg: COLORS.kpiBlueBg,
      borderColor: COLORS.kpiBlueBorder,
      iconBoxBg: COLORS.kpiBlueIcon,
      amountColor: COLORS.kpiBlueText,
      pillBg: COLORS.kpiBluePill,
      arrowColor: '#0284C7',
      onPress: () => onNavigate('customer_ledger'),
    },
  ];

  const renderModuleIcon = (item: (typeof quickAccessModules)[0]) => {
    switch (item.id) {
      case 'stock_entry':
        return <MaterialCommunityIcons name="home" size={24} color={item.iconColor} />;
      case 'retail_bill':
        return <MaterialCommunityIcons name="cart" size={24} color={item.iconColor} />;
      case 'touch_pos':
        return <MaterialCommunityIcons name="monitor" size={24} color={item.iconColor} />;
      case 'purchase':
        return <MaterialCommunityIcons name="barcode" size={24} color={item.iconColor} />;
      case 'customer':
        return <MaterialCommunityIcons name="account-plus" size={24} color={item.iconColor} />;
      case 'supplier':
        return <MaterialCommunityIcons name="truck-delivery" size={24} color={item.iconColor} />;
      case 'payment':
        return <MaterialCommunityIcons name="cash" size={24} color={item.iconColor} />;
      case 'receipt':
        return <MaterialCommunityIcons name="file-document-outline" size={24} color={item.iconColor} />;
      case 'logout':
        return <MaterialCommunityIcons name="logout" size={24} color={item.iconColor} />;
      default:
        return <Ionicons name={item.icon as any} size={22} color={item.iconColor} />;
    }
  };

  const renderKpiIcon = (kpiId: string) => {
    switch (kpiId) {
      case 'today_sales':
        return <MaterialCommunityIcons name="cart" size={26} color="#FFFFFF" />;
      case 'today_cash':
        return <MaterialCommunityIcons name="sack" size={26} color="#FFFFFF" />;
      case 'bank_accounts':
        return <MaterialCommunityIcons name="bank" size={26} color="#FFFFFF" />;
      case 'credit_sales':
        return <MaterialCommunityIcons name="account-search" size={26} color="#FFFFFF" />;
      default:
        return <Ionicons name="stats-chart" size={24} color="#FFFFFF" />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.headerBg} />

      {/* Top Menu Bar exactly matching client screenshot 1 */}
      <TopMenuBar onNavigate={onNavigate} />

      {/* Header Banner Strip matching client screenshot 2 */}
      <View style={styles.brandHeaderStrip}>
        <View style={styles.userStatusLeft}>
          <Text style={styles.brandTitleText}>DEMO</Text>
          <Text style={styles.userLoggedText}>
            Logged in as : <Text style={styles.userNameHighlight}>arun</Text>
          </Text>
        </View>

        <View style={styles.logoRightContainer}>
          <View style={styles.logoBadgeRow}>
            <Ionicons name="cart" size={24} color="#0284C7" />
            <Text style={styles.logoTextTitle}>
              DigiKart<Text style={{ color: '#0284C7' }}>POS</Text>
            </Text>
          </View>
          <Text style={styles.logoTagline}>Simplify Sales, Amplify Success</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.bodyScroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainLayout, isWide && styles.mainLayoutRow]}>
          {/* LEFT SECTION: Quick Access Grid */}
          <View style={[styles.quickAccessSection, isWide && styles.quickAccessSectionWide]}>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.headingIconBubble}>
                <Ionicons name="grid" size={18} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.sectionHeadingTitle}>Quick Access</Text>
                <Text style={styles.sectionHeadingSubtitle}>Choose a module to get started</Text>
              </View>
            </View>

            <View style={styles.moduleCardsGrid}>
              {quickAccessModules.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.moduleCard,
                    isWide && styles.moduleCardWide,
                    {
                      backgroundColor: item.cardBg,
                      borderColor: item.borderColor,
                    },
                  ]}
                  onPress={() => onNavigate(item.screen)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.moduleIconBox, { backgroundColor: item.iconBoxBg }]}>
                    {renderModuleIcon(item)}
                    {item.badge !== undefined && (
                      <View style={styles.cardBadge}>
                        <Text style={styles.cardBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.moduleTextContainer}>
                    <Text style={styles.moduleCardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.moduleCardSubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>

                  <View style={[styles.moduleChevronPill, { backgroundColor: item.pillColor }]}>
                    <Ionicons name="chevron-forward" size={14} color={item.arrowColor} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* RIGHT SECTION: Today's Summary (KPI Cards with Mild Color Backgrounds) */}
          <View style={[styles.kpiSection, isWide && styles.kpiSectionWide]}>
            <View style={styles.sectionHeadingRow}>
              <View style={[styles.headingIconBubble, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="bar-chart" size={18} color="#0284C7" />
              </View>
              <Text style={styles.sectionHeadingTitle}>Today's Summary</Text>
            </View>

            <View style={styles.kpiCardsList}>
              {kpiCards.map((kpi) => (
                <TouchableOpacity
                  key={kpi.id}
                  style={[
                    styles.kpiCard,
                    {
                      backgroundColor: kpi.cardBg,
                      borderColor: kpi.borderColor,
                    },
                  ]}
                  onPress={kpi.onPress}
                  activeOpacity={0.8}
                >
                  <View style={[styles.kpiIconBox, { backgroundColor: kpi.iconBoxBg }]}>
                    {renderKpiIcon(kpi.id)}
                  </View>

                  <View style={styles.kpiTextContainer}>
                    <Text style={[styles.kpiAmountText, { color: kpi.amountColor }]}>
                      {kpi.amount}
                    </Text>
                    <Text style={styles.kpiLabelText}>{kpi.label}</Text>
                  </View>

                  <View style={[styles.kpiChevronPill, { backgroundColor: kpi.pillBg }]}>
                    <Ionicons name="chevron-forward" size={14} color={kpi.arrowColor} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('home')}>
          <Ionicons name="home" size={22} color={COLORS.tabActive} />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('new_bill')}>
          <Ionicons name="receipt-outline" size={22} color={COLORS.tabInactive} />
          <Text style={styles.navText}>Retail Bill</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('products_list')}>
          <Ionicons name="cube-outline" size={22} color={COLORS.tabInactive} />
          <Text style={styles.navText}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('sales_reports')}>
          <Ionicons name="bar-chart-outline" size={22} color={COLORS.tabInactive} />
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('settings')}>
          <Ionicons name="settings-outline" size={22} color={COLORS.tabInactive} />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingTop: ANDROID_STATUS_BAR,
  },
  brandHeaderStrip: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  userStatusLeft: {
    justifyContent: 'center',
  },
  brandTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  userLoggedText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  userNameHighlight: {
    color: '#1D72F5',
    fontWeight: '700',
  },
  logoRightContainer: {
    alignItems: 'flex-end',
  },
  logoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoTextTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0A2540',
    letterSpacing: 0.2,
  },
  logoTagline: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  bodyScroll: {
    padding: 16,
    paddingBottom: 25,
  },
  mainLayout: {
    flexDirection: 'column',
    gap: 16,
  },
  mainLayoutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  quickAccessSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  quickAccessSectionWide: {
    flex: 6.2,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  headingIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionHeadingSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  moduleCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduleCard: {
    width: '48%',
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    gap: 10,
    position: 'relative',
    ...SHADOWS.card,
  },
  moduleCardWide: {
    width: '31.8%',
  },
  moduleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  moduleTextContainer: {
    flex: 1,
  },
  moduleCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  moduleCardSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  moduleChevronPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.card,
  },
  kpiSectionWide: {
    flex: 3.8,
  },
  kpiCardsList: {
    gap: 12,
  },
  kpiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.2,
    gap: 12,
    ...SHADOWS.card,
  },
  kpiIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTextContainer: {
    flex: 1,
  },
  kpiAmountText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  kpiLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  kpiChevronPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    ...SHADOWS.floating,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 55,
  },
  navText: {
    color: COLORS.tabInactive,
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  navTextActive: {
    color: COLORS.tabActive,
    fontWeight: '800',
  },
});
