import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';

interface AccountsScreenProps {
  onBack: () => void;
  onNavigateToExpense?: () => void;
  onNavigateToCustomer?: () => void;
  onNavigateToSupplier?: () => void;
}

export const AccountsScreen: React.FC<AccountsScreenProps> = ({
  onBack,
  onNavigateToExpense,
  onNavigateToCustomer,
  onNavigateToSupplier,
}) => {
  const accountMetrics = [
    {
      id: 'cash',
      title: 'Cash In Hand',
      value: '₹ 22,200.00',
      icon: 'wallet-outline',
      iconBg: '#DCFCE7',
      iconColor: '#10B981',
    },
    {
      id: 'bank',
      title: 'Bank Balance',
      value: '₹ 1,45,680.00',
      icon: 'business-outline',
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
    },
    {
      id: 'receivables',
      title: 'Receivables\n(Customer Dues)',
      value: '₹ 2,36,450.00',
      icon: 'people-outline',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      onPress: onNavigateToCustomer,
    },
    {
      id: 'payables',
      title: 'Payables\n(Supplier Dues)',
      value: '₹ 12,300.00',
      icon: 'cube-outline',
      iconBg: '#FEE2E2',
      iconColor: '#EF4444',
      onPress: onNavigateToSupplier,
    },
    {
      id: 'income',
      title: 'Total Income\n(This Month)',
      value: '₹ 4,28,600.00',
      icon: 'trending-up-outline',
      iconBg: '#DCFCE7',
      iconColor: '#10B981',
    },
    {
      id: 'expense',
      title: 'Total Expenses\n(This Month)',
      value: '₹ 1,85,420.00',
      icon: 'arrow-down-circle-outline',
      iconBg: '#FEE2E2',
      iconColor: '#EF4444',
      onPress: onNavigateToExpense,
    },
  ];

  const recentTx = [
    {
      id: 'tx-1',
      title: 'Cash Sales',
      date: '15-10-2026',
      amount: '+ ₹ 2,360.00',
      isCredit: true,
      icon: 'cash-outline',
      iconBg: '#DCFCE7',
      iconColor: '#10B981',
    },
    {
      id: 'tx-2',
      title: 'UPI Payment',
      date: '14-10-2026',
      amount: '+ ₹ 1,240.00',
      isCredit: true,
      icon: 'qr-code-outline',
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
    },
    {
      id: 'tx-3',
      title: 'Purchase Payment',
      date: '14-10-2026',
      amount: '- ₹ 8,500.00',
      isCredit: false,
      icon: 'cart-outline',
      iconBg: '#FEE2E2',
      iconColor: '#EF4444',
    },
    {
      id: 'tx-4',
      title: 'Expense - Electricity',
      date: '14-10-2026',
      amount: '- ₹ 1,250.00',
      isCredit: false,
      icon: 'flash-outline',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 14 Header */}
      <AppHeader title="Accounts" showBack={true} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* 6 Account Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          {accountMetrics.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.metricCard}
              onPress={m.onPress}
              activeOpacity={m.onPress ? 0.7 : 1}
            >
              <View style={[styles.iconBox, { backgroundColor: m.iconBg }]}>
                <Ionicons name={m.icon as any} size={20} color={m.iconColor} />
              </View>
              <Text style={styles.metricTitle}>{m.title}</Text>
              <Text style={styles.metricValue}>{m.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.txSectionHeader}>
          <Text style={styles.txSectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txListCard}>
          {recentTx.map((tx, idx) => (
            <View
              key={tx.id}
              style={[
                styles.txItem,
                idx === recentTx.length - 1 && styles.lastTxItem,
              ]}
            >
              <View style={[styles.txIconBox, { backgroundColor: tx.iconBg }]}>
                <Ionicons name={tx.icon as any} size={18} color={tx.iconColor} />
              </View>

              <View style={styles.txMeta}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>

              <Text
                style={[
                  styles.txAmount,
                  tx.isCredit ? styles.amountGreen : styles.amountRed,
                ]}
              >
                {tx.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 110,
    justifyContent: 'space-between',
    ...SHADOWS.card,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  metricValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  txSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  txSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  txListCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastTxItem: {
    borderBottomWidth: 0,
  },
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txMeta: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  txDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  amountGreen: {
    color: COLORS.success,
  },
  amountRed: {
    color: COLORS.danger,
  },
});
