import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';

interface DailyClosingScreenProps {
  onBack: () => void;
  onCloseSuccess: () => void;
}

export const DailyClosingScreen: React.FC<DailyClosingScreenProps> = ({
  onBack,
  onCloseSuccess,
}) => {
  const [dateStr, setDateStr] = useState('15 Oct 2026 (Thu)');
  const [openingCash] = useState(5000.0);
  const [cashSales] = useState(18240.0);
  const [upiCardSales] = useState(7440.0);
  const [creditSales] = useState(2580.0);
  const [totalSales] = useState(28260.0);
  const [cashExpenses] = useState(1250.0);
  const [otherExpenses] = useState(320.0);

  // Expected Cash = Opening Cash (5000) + Cash Sales (18240) - Cash Expenses (1250) + adjustments = 22,230.00
  const expectedCash = 22230.0;
  const [actualCashStr, setActualCashStr] = useState('22200.00');

  const actualCash = parseFloat(actualCashStr) || 0;
  const difference = actualCash - expectedCash;

  const handleCloseDay = () => {
    Alert.alert(
      'Confirm Daily Closing',
      `Expected Cash: ₹${expectedCash.toFixed(2)}\nActual Cash: ₹${actualCash.toFixed(2)}\nDifference: ₹${difference.toFixed(2)}\n\nClose register shift?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Close',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Day Closed Successfully! Shift report saved.');
            onCloseSuccess();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 12 Header matching Image 2 Screen 2 with exact Image 1 Purple */}
      <AppHeader title="Daily Closing" showBack={true} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Date Selector Banner */}
        <View style={styles.dateBanner}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
        </View>

        {/* Sales & Collections Card */}
        <View style={styles.breakdownCard}>
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="cash-outline" size={18} color="#10B981" />
              <Text style={styles.rowLabel}>Opening Cash</Text>
            </View>
            <Text style={styles.rowValue}>₹ {openingCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>

          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="wallet-outline" size={18} color="#2563EB" />
              <Text style={styles.rowLabel}>Cash Sales</Text>
            </View>
            <Text style={styles.rowValue}>₹ {cashSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>

          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="card-outline" size={18} color="#8B5CF6" />
              <Text style={styles.rowLabel}>UPI / Card Sales</Text>
            </View>
            <Text style={styles.rowValue}>₹ {upiCardSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>

          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="receipt-outline" size={18} color="#F59E0B" />
              <Text style={styles.rowLabel}>Credit Sales</Text>
            </View>
            <Text style={styles.rowValue}>₹ {creditSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>

          <View style={styles.divider} />

          {/* Total Sales */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Sales</Text>
            <Text style={styles.totalVal}>₹ {totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>

          <View style={styles.divider} />

          {/* Expenses */}
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="arrow-undo-outline" size={18} color="#EF4444" />
              <Text style={styles.rowLabel}>Cash Expenses</Text>
            </View>
            <Text style={styles.rowValue}>₹ {cashExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>

          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="document-text-outline" size={18} color="#EF4444" />
              <Text style={styles.rowLabel}>Other Expenses</Text>
            </View>
            <Text style={styles.rowValue}>₹ {otherExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>

          <View style={styles.divider} />

          {/* Expected Cash */}
          <View style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
              <Text style={styles.boldRowLabel}>Expected Cash</Text>
            </View>
            <Text style={styles.boldRowValue}>₹ {expectedCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>

          {/* Actual Cash Input */}
          <View style={styles.actualCashRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="create-outline" size={18} color={COLORS.primary} />
              <Text style={styles.boldRowLabel}>Actual Cash</Text>
            </View>
            <TextInput
              style={styles.actualCashInput}
              value={actualCashStr}
              onChangeText={setActualCashStr}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Difference in Red matching Screen 2 */}
          <View style={styles.diffRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
              <Text style={styles.diffLabel}>Difference</Text>
            </View>
            <Text style={styles.diffValue}>{difference.toFixed(2)}</Text>
          </View>
        </View>

        {/* Close Day Button with Lock Icon */}
        <TouchableOpacity style={styles.closeDayBtn} onPress={handleCloseDay} activeOpacity={0.8}>
          <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
          <Text style={styles.closeDayBtnText}>Close Day</Text>
        </TouchableOpacity>
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
  dateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  breakdownCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  rowValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  boldRowLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  boldRowValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  totalVal: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  actualCashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  actualCashInput: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    minWidth: 110,
    textAlign: 'right',
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 4,
  },
  diffLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
  diffValue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.danger,
  },
  closeDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
    ...SHADOWS.card,
  },
  closeDayBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
