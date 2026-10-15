import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';

interface ProfitLossScreenProps {
  onBack: () => void;
}

export const ProfitLossScreen: React.FC<ProfitLossScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 18 Header matching Image 2 Screen 8 */}
      <AppHeader title="Profit & Loss Report" showBack={true} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Date Range Selector */}
        <View style={styles.dateBanner}>
          <Text style={styles.dateLabel}>01-10-2026</Text>
          <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
          <Text style={styles.dateLabel}>15-10-2026</Text>
          <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
        </View>

        {/* 1. Income Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Income</Text>
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Sales</Text>
            <Text style={styles.lineVal}>28,260.00</Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Other Income</Text>
            <Text style={styles.lineVal}>1,240.00</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total Income</Text>
            <Text style={styles.totalVal}>29,500.00</Text>
          </View>
        </View>

        {/* 2. Cost of Goods Sold & Gross Profit */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Cost of Goods Sold</Text>
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Opening Stock</Text>
            <Text style={styles.lineVal}>1,25,600.00</Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Purchases</Text>
            <Text style={styles.lineVal}>18,450.00</Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Closing Stock</Text>
            <Text style={styles.lineVal}>1,32,600.00</Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={styles.subTotalLabel}>COGS</Text>
            <Text style={styles.subTotalVal}>11,450.00</Text>
          </View>

          {/* Highlighted Gross Profit Green Bar */}
          <View style={styles.profitBanner}>
            <Text style={styles.profitBannerLabel}>Gross Profit</Text>
            <Text style={styles.profitBannerVal}>18,050.00</Text>
          </View>
        </View>

        {/* 3. Operating Expenses */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Expenses</Text>
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Salary</Text>
            <Text style={styles.lineVal}>5,000.00</Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Rent</Text>
            <Text style={styles.lineVal}>3,000.00</Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Electricity</Text>
            <Text style={styles.lineVal}>1,250.00</Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={styles.lineLabel}>Other Expenses</Text>
            <Text style={styles.lineVal}>2,340.00</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total Expenses</Text>
            <Text style={styles.totalVal}>11,590.00</Text>
          </View>

          {/* Highlighted Net Profit Green Bar */}
          <View style={styles.profitBanner}>
            <Text style={styles.profitBannerLabel}>Net Profit</Text>
            <Text style={styles.profitBannerVal}>6,460.00</Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => Alert.alert('Detailed Audit', 'Audited ledger balance sheet exported.')}
            activeOpacity={0.7}
          >
            <Text style={styles.detailsBtnText}>View Detailed Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={() => Alert.alert('Export Excel', 'P&L Statement exported to Excel workbook.')}
            activeOpacity={0.8}
          >
            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
            <Text style={styles.exportBtnText}>Export Excel</Text>
          </TouchableOpacity>
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
  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    ...SHADOWS.card,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  lineLabel: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  lineVal: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subTotalVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  profitBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  profitBannerLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.successText,
  },
  profitBannerVal: {
    fontSize: 14.5,
    fontWeight: '900',
    color: COLORS.successText,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  detailsBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...SHADOWS.card,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13.5,
  },
});
