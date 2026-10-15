import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Invoice, ShopSettings } from '../types';

interface InvoicesScreenProps {
  invoices: Invoice[];
  settings: ShopSettings;
  onSelectInvoice: (invoice: Invoice) => void;
}

export const InvoicesScreen: React.FC<InvoicesScreenProps> = ({
  invoices,
  settings,
  onSelectInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'b2b' | 'b2c'>('all');

  const filteredInvoices = useMemo(() => {
    let list = invoices;

    if (filterType === 'b2b') {
      list = list.filter((i) => i.isB2B);
    } else if (filterType === 'b2c') {
      list = list.filter((i) => !i.isB2B);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.invoiceNo.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          i.customerPhone.includes(q) ||
          (i.customerGstin && i.customerGstin.toLowerCase().includes(q))
      );
    }

    return list;
  }, [invoices, filterType, searchQuery]);

  // GST Totals for Statutory Reporting
  const totalTurnover = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalCgst = invoices.reduce((sum, i) => sum + i.totalCgst, 0);
  const totalSgst = invoices.reduce((sum, i) => sum + i.totalSgst, 0);
  const totalIgst = invoices.reduce((sum, i) => sum + i.totalIgst, 0);
  const totalGstCollected = totalCgst + totalSgst + totalIgst;

  return (
    <View style={styles.container}>
      {/* GST Sales & Tax KPI Cards */}
      <View style={styles.kpiContainer}>
        <View style={styles.turnoverCard}>
          <Text style={styles.turnoverLabel}>TOTAL GST TURNOVER</Text>
          <Text style={styles.turnoverVal}>
            {settings.currencySymbol}
            {totalTurnover.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.turnoverSub}>
            {invoices.length} {invoices.length === 1 ? 'Bill' : 'Bills'} Issued
          </Text>
        </View>

        <View style={styles.taxStatsRow}>
          <View style={styles.taxStatBox}>
            <Text style={styles.taxStatLabel}>Total Tax</Text>
            <Text style={[styles.taxStatVal, { color: '#10B981' }]}>
              {settings.currencySymbol}
              {totalGstCollected.toFixed(0)}
            </Text>
          </View>

          <View style={styles.taxStatBox}>
            <Text style={styles.taxStatLabel}>CGST</Text>
            <Text style={styles.taxStatVal}>
              {settings.currencySymbol}
              {totalCgst.toFixed(0)}
            </Text>
          </View>

          <View style={styles.taxStatBox}>
            <Text style={styles.taxStatLabel}>SGST</Text>
            <Text style={styles.taxStatVal}>
              {settings.currencySymbol}
              {totalSgst.toFixed(0)}
            </Text>
          </View>

          <View style={styles.taxStatBox}>
            <Text style={styles.taxStatLabel}>IGST</Text>
            <Text style={styles.taxStatVal}>
              {settings.currencySymbol}
              {totalIgst.toFixed(0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs & Search */}
      <View style={styles.searchSection}>
        <View style={styles.filterPills}>
          <TouchableOpacity
            style={[styles.pill, filterType === 'all' && styles.pillActive]}
            onPress={() => setFilterType('all')}
          >
            <Text
              style={[
                styles.pillText,
                filterType === 'all' && styles.pillTextActive,
              ]}
            >
              All Bills ({invoices.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, filterType === 'b2c' && styles.pillActive]}
            onPress={() => setFilterType('b2c')}
          >
            <Text
              style={[
                styles.pillText,
                filterType === 'b2c' && styles.pillTextActive,
              ]}
            >
              B2C Retail
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, filterType === 'b2b' && styles.pillActive]}
            onPress={() => setFilterType('b2b')}
          >
            <Text
              style={[
                styles.pillText,
                filterType === 'b2b' && styles.pillTextActive,
              ]}
            >
              B2B Tax Credit
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search invoice number, phone, customer..."
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      {/* Invoices List */}
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const formattedDate = new Date(item.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <TouchableOpacity
              style={styles.invoiceCard}
              onPress={() => onSelectInvoice(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <View style={styles.invoiceNoRow}>
                  <Text style={styles.invoiceNo}>{item.invoiceNo}</Text>
                  <View
                    style={[
                      styles.typeBadge,
                      item.isB2B ? styles.b2bBadge : styles.b2cBadge,
                    ]}
                  >
                    <Text
                      style={item.isB2B ? styles.b2bText : styles.b2cText}
                    >
                      {item.isB2B ? 'B2B GST' : 'B2C'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.customerName}>
                  {item.customerName} {item.customerPhone ? `(${item.customerPhone})` : ''}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.dateText}>{formattedDate}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.payModeText}>{item.paymentMode}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.itemsCountText}>
                    {item.items.reduce((s, i) => s + i.quantity, 0)} items
                  </Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.grandTotal}>
                  {settings.currencySymbol}
                  {Math.round(item.grandTotal).toFixed(2)}
                </Text>
                <Text style={styles.taxSub}>
                  Tax: {settings.currencySymbol}
                  {(item.totalCgst + item.totalSgst + item.totalIgst).toFixed(0)}
                </Text>
                <View style={styles.reprintPill}>
                  <Ionicons name="receipt-outline" size={12} color="#10B981" />
                  <Text style={styles.reprintText}>Slip</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={54} color="#334155" />
            <Text style={styles.emptyTitle}>No Invoices Found</Text>
            <Text style={styles.emptySub}>
              Complete your first sale in the POS Register tab to generate GST invoices!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  kpiContainer: {
    marginBottom: 12,
  },
  turnoverCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  turnoverLabel: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  turnoverVal: {
    color: '#10B981',
    fontSize: 26,
    fontWeight: '900',
    marginVertical: 2,
  },
  turnoverSub: {
    color: '#64748B',
    fontSize: 11,
  },
  taxStatsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  taxStatBox: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  taxStatLabel: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  taxStatVal: {
    color: '#E2E8F0',
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 2,
  },
  searchSection: {
    marginBottom: 12,
    gap: 8,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillActive: {
    backgroundColor: '#064E3B40',
    borderColor: '#10B981',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#10B981',
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#334155',
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 12.5,
    marginLeft: 6,
  },
  listContent: {
    paddingBottom: 24,
  },
  invoiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardLeft: {
    flex: 1,
  },
  invoiceNoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  invoiceNo: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  b2bBadge: {
    backgroundColor: '#1E1B4B',
  },
  b2bText: {
    color: '#A5B4FC',
    fontSize: 9.5,
    fontWeight: '800',
  },
  b2cBadge: {
    backgroundColor: '#064E3B',
  },
  b2cText: {
    color: '#6EE7B7',
    fontSize: 9.5,
    fontWeight: '800',
  },
  customerName: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dateText: {
    color: '#64748B',
    fontSize: 10.5,
  },
  dot: {
    color: '#475569',
    fontSize: 10,
  },
  payModeText: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '700',
  },
  itemsCountText: {
    color: '#64748B',
    fontSize: 10.5,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  grandTotal: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
  },
  taxSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 1,
  },
  reprintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reprintText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
