import React, { useState } from 'react';
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

interface GSTReportsScreenProps {
  onBack: () => void;
}

export const GSTReportsScreen: React.FC<GSTReportsScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'Summary' | 'GSTR-1' | 'GSTR-3B' | 'HSN Wise'>('GSTR-1');

  const taxRows = [
    { type: 'CGST', taxable: '9,85,400.00', tax: '88,686.00' },
    { type: 'SGST', taxable: '9,85,400.00', tax: '88,686.00' },
    { type: 'IGST', taxable: '3,52,600.00', tax: '63,468.00' },
    { type: 'Total', taxable: '21,23,400.00', tax: '2,40,840.00', isTotal: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 13 Header */}
      <AppHeader title="GST Reports" showBack={true} onBack={onBack} />

      {/* Tabs matching Image 2 Screen 3 */}
      <View style={styles.tabsRow}>
        {(['Summary', 'GSTR-1', 'GSTR-3B', 'HSN Wise'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Date Range Selector */}
        <View style={styles.dateRangeCard}>
          <Text style={styles.dateLabel}>01-10-2026</Text>
          <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
          <Text style={styles.dateLabel}>15-10-2026</Text>
          <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
        </View>

        {/* 2x2 Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          {/* B2B Invoices */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="business-outline" size={18} color="#2563EB" />
              <Text style={styles.metricLabel}>B2B (Invoices)</Text>
            </View>
            <Text style={styles.metricValue}>₹ 12,45,320.00</Text>
            <Text style={styles.metricSub}>58 Invoices</Text>
          </View>

          {/* B2C Unregistered */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="people-outline" size={18} color="#F59E0B" />
              <Text style={styles.metricLabel}>B2C (Unregistered)</Text>
            </View>
            <Text style={styles.metricValue}>₹ 8,90,420.00</Text>
            <Text style={styles.metricSub}>245 Invoices</Text>
          </View>

          {/* Credit Notes */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="document-text-outline" size={18} color="#EF4444" />
              <Text style={styles.metricLabel}>Credit Notes</Text>
            </View>
            <Text style={styles.metricValue}>₹ 12,340.00</Text>
            <Text style={styles.metricSub}>3 Notes</Text>
          </View>

          {/* Total Turnover */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name="cash-outline" size={18} color="#10B981" />
              <Text style={styles.metricLabel}>Total Turnover</Text>
            </View>
            <Text style={styles.metricValue}>₹ 21,23,400.00</Text>
            <Text style={styles.metricSub}>GSTR-1 Ready</Text>
          </View>
        </View>

        {/* Tax Summary Table Card matching Screen 3 */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Tax Summary (GSTR-1)</Text>

          <View style={styles.tableHeaderRow}>
            <Text style={[styles.thCell, { width: 70 }]}>Tax Type</Text>
            <Text style={[styles.thCell, { flex: 1, textAlign: 'right' }]}>Taxable Value</Text>
            <Text style={[styles.thCell, { width: 95, textAlign: 'right' }]}>Tax Amount</Text>
          </View>

          {taxRows.map((r, i) => (
            <View key={i} style={[styles.tableRow, r.isTotal && styles.totalTableRow]}>
              <Text style={[styles.tdCell, { width: 70 }, r.isTotal && styles.boldText]}>
                {r.type}
              </Text>
              <Text
                style={[
                  styles.tdCell,
                  { flex: 1, textAlign: 'right' },
                  r.isTotal && styles.boldText,
                ]}
              >
                {r.taxable}
              </Text>
              <Text
                style={[
                  styles.tdCell,
                  { width: 95, textAlign: 'right' },
                  r.isTotal && styles.boldText,
                ]}
              >
                {r.tax}
              </Text>
            </View>
          ))}
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewDetailsBtn}
            onPress={() => Alert.alert('GSTR-1 Details', 'All 303 transactions mapped to HSN codes.')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={() => Alert.alert('Export Excel', 'GSTR-1 JSON and Excel workbook generated successfully.')}
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  body: {
    padding: 16,
    paddingBottom: 30,
  },
  dateRangeCard: {
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  metricSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  tableCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  tableTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 6,
  },
  thCell: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  totalTableRow: {
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    marginTop: 4,
    paddingTop: 10,
  },
  tdCell: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  boldText: {
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  viewDetailsBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 13.5,
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
