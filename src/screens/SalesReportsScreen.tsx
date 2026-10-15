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

interface SalesReportsScreenProps {
  onBack: () => void;
}

export const SalesReportsScreen: React.FC<SalesReportsScreenProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState('15 Oct 2026');

  // Hourly sales bar data matching Screen 8
  const hourlyData = [
    { time: '9AM', height: 40, value: '₹2,400' },
    { time: '11AM', height: 75, value: '₹5,800' },
    { time: '1PM', height: 50, value: '₹3,900' },
    { time: '3PM', height: 95, value: '₹7,200', active: true },
    { time: '5PM', height: 60, value: '₹4,500' },
    { time: '7PM', height: 85, value: '₹6,400' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 8 Header matching Image 1 Screen 8 */}
      <AppHeader title="Sales Reports" showBack={true} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Date Selector Banner matching Screen 8 */}
        <View style={styles.dateBanner}>
          <Text style={styles.dateText}>{selectedDate}</Text>
          <TouchableOpacity style={styles.calendarBtn}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* 4 Summary Cards Grid */}
        <View style={styles.kpiGrid}>
          {/* Total Sales */}
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Total Sales</Text>
            <Text style={styles.kpiValue}>₹ 25,680</Text>
            <View style={styles.growthBadge}>
              <Ionicons name="arrow-up" size={11} color={COLORS.success} />
              <Text style={styles.growthText}>+12%</Text>
            </View>
          </View>

          {/* Total Bills */}
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Total Bills</Text>
            <Text style={styles.kpiValue}>84</Text>
            <View style={styles.growthBadge}>
              <Ionicons name="arrow-up" size={11} color={COLORS.success} />
              <Text style={styles.growthText}>+8%</Text>
            </View>
          </View>

          {/* Cash Sales */}
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>Cash Sales</Text>
            <Text style={styles.kpiValue}>₹ 18,240</Text>
          </View>

          {/* UPI / Card */}
          <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>UPI / Card</Text>
            <Text style={styles.kpiValue}>₹ 7,440</Text>
          </View>
        </View>

        {/* Hourly Sales Bar Chart Container matching Screen 8 */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Hourly Sales Volume</Text>
          <View style={styles.chartPlotArea}>
            {hourlyData.map((d, idx) => (
              <View key={idx} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barPillar,
                      { height: `${d.height}%` },
                      d.active && styles.barPillarActive,
                    ]}
                  />
                </View>
                <Text style={[styles.timeLabel, d.active && styles.timeLabelActive]}>
                  {d.time}
                </Text>
              </View>
            ))}
          </View>
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
  calendarBtn: {
    padding: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 2,
  },
  growthText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.successText,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  chartPlotArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    width: 38,
  },
  barTrack: {
    flex: 1,
    width: 14,
    justifyContent: 'flex-end',
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    overflow: 'hidden',
  },
  barPillar: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 7,
  },
  barPillarActive: {
    backgroundColor: '#6366F1',
  },
  timeLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  timeLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
