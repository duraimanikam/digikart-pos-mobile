import React, { useState } from 'react';
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

interface StockReportScreenProps {
  onBack: () => void;
}

export const StockReportScreen: React.FC<StockReportScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'Summary' | 'Movement' | 'Low Stock'>('Summary');

  const categories = [
    { name: 'Spices', items: 120, value: '1,25,600.00' },
    { name: 'Dairy', items: 45, value: '85,240.00' },
    { name: 'Beverages', items: 60, value: '68,450.00' },
    { name: 'Biscuits', items: 80, value: '52,340.00' },
    { name: 'Personal Care', items: 40, value: '42,600.00' },
    { name: 'Household', items: 50, value: '38,500.00' },
    { name: 'Others', items: 91, value: '80,500.00' },
  ];

  const lowStockItems = [
    { name: 'Aachi Turmeric Powder 500 g', current: 4, min: 10 },
    { name: 'Aavin Milk 1 Ltr', current: 3, min: 10 },
    { name: 'Sunfeast Marie Biscuits 200 g', current: 5, min: 20 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 19 Header matching Image 2 Screen 9 */}
      <AppHeader title="Stock Report" showBack={true} onBack={onBack} />

      {/* Tabs */}
      <View style={styles.tabsStrip}>
        {(['Stock Summary', 'Stock Movement', 'Low Stock'] as const).map((t, idx) => {
          const tabKey = idx === 0 ? 'Summary' : idx === 1 ? 'Movement' : 'Low Stock';
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, activeTab === tabKey && styles.tabBtnActive]}
              onPress={() => setActiveTab(tabKey)}
            >
              <Text style={[styles.tabText, activeTab === tabKey && styles.tabTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Top 3 Stats Cards */}
        <View style={styles.statsStrip}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Products</Text>
            <Text style={styles.statValue}>486</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Stock Value</Text>
            <Text style={[styles.statValue, { color: COLORS.success }]}>₹ 4,85,230.00</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Low Stock Items</Text>
            <Text style={[styles.statValue, { color: COLORS.danger }]}>24</Text>
          </View>
        </View>

        {/* Category Wise Stock Value Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Category Wise Stock Value</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1 }]}>Category</Text>
            <Text style={[styles.th, { width: 50, textAlign: 'center' }]}>Items</Text>
            <Text style={[styles.th, { width: 95, textAlign: 'right' }]}>Stock Value (₹)</Text>
          </View>

          {categories.map((c, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 1, fontWeight: '600' }]}>{c.name}</Text>
              <Text style={[styles.td, { width: 50, textAlign: 'center', color: COLORS.textSecondary }]}>
                {c.items}
              </Text>
              <Text style={[styles.td, { width: 95, textAlign: 'right', fontWeight: '700' }]}>
                {c.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Low Stock Items Section with View All */}
        <View style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Low Stock Items</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {lowStockItems.map((item, idx) => (
            <View key={idx} style={styles.lowStockRow}>
              <View style={styles.lowStockLeft}>
                <Text style={styles.lowStockName}>{item.name}</Text>
              </View>
              <View style={styles.stockNumbers}>
                <Text style={styles.currentStockText}>
                  Current: <Text style={styles.redCount}>{item.current}</Text>
                </Text>
                <Text style={styles.minStockText}>Min: {item.min}</Text>
              </View>
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
  tabsStrip: {
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
    fontSize: 12,
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
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingBottom: 6,
  },
  th: {
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
  td: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  lowStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  lowStockLeft: {
    flex: 1,
  },
  lowStockName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stockNumbers: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  currentStockText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  redCount: {
    color: COLORS.danger,
    fontWeight: '800',
  },
  minStockText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
