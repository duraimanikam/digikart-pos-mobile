import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, ShopSettings } from '../types';

interface InventoryScreenProps {
  products: Product[];
  settings: ShopSettings;
  onOpenAddProduct: (productToEdit?: Product) => void;
  onUpdateStock: (productId: string, delta: number) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  products,
  settings,
  onOpenAddProduct,
  onUpdateStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const filteredProducts = useMemo(() => {
    let list = products;

    if (filterLowStock) {
      list = list.filter((p) => p.stock <= 10);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.hsn.includes(q)
      );
    }

    return list;
  }, [products, filterLowStock, searchQuery]);

  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  return (
    <View style={styles.container}>
      {/* Top Inventory Summary KPIs */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiVal}>{products.length}</Text>
          <Text style={styles.kpiLabel}>Total SKUs</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={[styles.kpiVal, { color: '#10B981' }]}>
            {totalStockUnits}
          </Text>
          <Text style={styles.kpiLabel}>Stock Units</Text>
        </View>

        <TouchableOpacity
          style={[styles.kpiCard, filterLowStock && styles.kpiCardAlertActive]}
          onPress={() => setFilterLowStock(!filterLowStock)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.kpiVal,
              { color: lowStockCount > 0 ? '#EF4444' : '#94A3B8' },
            ]}
          >
            {lowStockCount}
          </Text>
          <Text style={styles.kpiLabel}>Low Stock Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Action & Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search SKU, brand, HSN..."
            placeholderTextColor="#64748B"
          />
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onOpenAddProduct()}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isLow = item.stock <= 10;
          const isOut = item.stock <= 0;

          return (
            <TouchableOpacity
              style={styles.itemCard}
              onPress={() => onOpenAddProduct(item)}
              activeOpacity={0.8}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Ionicons name="cube-outline" size={22} color="#64748B" />
                </View>
              )}

              <View style={styles.itemDetails}>
                <View style={styles.itemTop}>
                  <Text style={styles.brandTag}>{item.brand}</Text>
                  <Text style={styles.hsnTag}>HSN: {item.hsn}</Text>
                </View>

                <Text style={styles.title} numberOfLines={1}>
                  {item.name}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>
                    {settings.currencySymbol}
                    {item.sellingPrice.toFixed(0)}
                  </Text>
                  <Text style={styles.gstTag}>GST {item.gstRate}%</Text>
                  <Text style={styles.barcodeText}>EAN: {item.barcode.slice(-6)}</Text>
                </View>
              </View>

              {/* Stock Stepper */}
              <View style={styles.stockControl}>
                <View
                  style={[
                    styles.stockStatusBadge,
                    isOut
                      ? styles.badgeOut
                      : isLow
                      ? styles.badgeLow
                      : styles.badgeOk,
                  ]}
                >
                  <Text style={styles.stockStatusText}>
                    {item.stock} {item.unit}
                  </Text>
                </View>

                <View style={styles.stockStepper}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => onUpdateStock(item.id, -1)}
                  >
                    <Ionicons name="remove" size={14} color="#E2E8F0" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => onUpdateStock(item.id, 5)}
                  >
                    <Ionicons name="add" size={14} color="#10B981" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
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
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  kpiCardAlertActive: {
    borderColor: '#EF4444',
    backgroundColor: '#450A0A30',
  },
  kpiVal: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
  },
  kpiLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
    height: 42,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
    marginLeft: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  thumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTag: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  hsnTag: {
    color: '#64748B',
    fontSize: 9.5,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  price: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },
  gstTag: {
    backgroundColor: '#0F172A',
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '700',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  barcodeText: {
    color: '#64748B',
    fontSize: 9,
  },
  stockControl: {
    alignItems: 'flex-end',
    gap: 6,
  },
  stockStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeOk: {
    backgroundColor: '#064E3B',
  },
  badgeLow: {
    backgroundColor: '#78350F',
  },
  badgeOut: {
    backgroundColor: '#7F1D1D',
  },
  stockStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  stockStepper: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
