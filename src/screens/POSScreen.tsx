import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, CartItem, ShopSettings } from '../types';
import { INITIAL_CATEGORIES } from '../database/sqlite';
import { ProductCard } from '../components/ProductCard';

interface POSScreenProps {
  products: Product[];
  cart: CartItem[];
  settings: ShopSettings;
  onAddToCart: (product: Product) => void;
  onOpenCart: () => void;
  onOpenPhotoBill: () => void;
}

export const POSScreen: React.FC<POSScreenProps> = ({
  products,
  cart,
  settings,
  onAddToCart,
  onOpenCart,
  onOpenPhotoBill,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Filter products by category, search keywords, or barcode
  const filteredProducts = useMemo(() => {
    let list = products;

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.hsn.includes(q) ||
          (p.keywords && p.keywords.some((k) => k.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [products, selectedCategory, searchQuery]);

  // Handle direct barcode search / scan add
  const handleBarcodeSubmit = () => {
    if (!barcodeInput.trim()) return;
    const found = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.id === barcodeInput.trim()
    );
    if (found) {
      onAddToCart(found);
      setBarcodeInput('');
    } else {
      alert(`No product found with barcode: ${barcodeInput}`);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalAmount, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Map product id to quantity in cart
  const cartQtyMap = useMemo(() => {
    const map: { [id: string]: number } = {};
    for (const item of cart) {
      map[item.product.id] = item.quantity;
    }
    return map;
  }, [cart]);

  return (
    <View style={styles.container}>
      {/* Top Search & Barcode Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search product, brand, HSN..."
            placeholderTextColor="#64748B"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Barcode Scanner / Manual Box */}
        <View style={styles.barcodeBox}>
          <Ionicons name="barcode-outline" size={18} color="#10B981" />
          <TextInput
            style={styles.barcodeInput}
            value={barcodeInput}
            onChangeText={setBarcodeInput}
            onSubmitEditing={handleBarcodeSubmit}
            placeholder="Scan / Type Barcode"
            placeholderTextColor="#64748B"
            keyboardType="number-pad"
            returnKeyType="done"
          />
          {barcodeInput.length > 0 && (
            <TouchableOpacity
              style={styles.barcodeAddBtn}
              onPress={handleBarcodeSubmit}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Horizontal Category Selector */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {INITIAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={isSelected ? '#10B981' : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.categoryName,
                    isSelected && styles.categoryNameActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <View style={styles.gridContainer}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyResults}>
            <Ionicons name="search-outline" size={54} color="#334155" />
            <Text style={styles.emptyTitle}>No matching products found</Text>
            <Text style={styles.emptySub}>
              Try a different keyword or tap "Snap & Bill" to scan packaging with your camera.
            </Text>
            <TouchableOpacity
              style={styles.emptySnapBtn}
              onPress={onOpenPhotoBill}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={18} color="#FFFFFF" />
              <Text style={styles.emptySnapText}>Snap & Bill Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                currencySymbol={settings.currencySymbol}
                cartQuantity={cartQtyMap[item.id] || 0}
                onAddToCart={onAddToCart}
              />
            )}
          />
        )}
      </View>

      {/* Floating Sticky Bottom Cart & Snap Bar */}
      {cartItemCount > 0 && (
        <View style={styles.floatingCartBar}>
          <TouchableOpacity
            style={styles.floatingCartButton}
            onPress={onOpenCart}
            activeOpacity={0.85}
          >
            <View style={styles.floatingCartLeft}>
              <View style={styles.floatingCartBadge}>
                <Ionicons name="cart" size={18} color="#FFFFFF" />
                <Text style={styles.floatingCartCount}>{cartItemCount}</Text>
              </View>
              <View>
                <Text style={styles.floatingCartTitle}>View Current Bill</Text>
                <Text style={styles.floatingCartSub}>
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} added
                </Text>
              </View>
            </View>

            <View style={styles.floatingCartRight}>
              <Text style={styles.floatingCartTotal}>
                {settings.currencySymbol}
                {Math.round(cartTotal).toFixed(2)}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
    marginLeft: 8,
  },
  barcodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#334155',
    height: 38,
  },
  barcodeInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 12,
    marginLeft: 6,
  },
  barcodeAddBtn: {
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesSection: {
    paddingVertical: 6,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  categoryCardActive: {
    backgroundColor: '#064E3B40',
    borderColor: '#10B981',
  },
  categoryName: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryNameActive: {
    color: '#10B981',
    fontWeight: '800',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  listContent: {
    paddingBottom: 90,
    paddingTop: 6,
  },
  emptyResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptySnapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  emptySnapText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  floatingCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  floatingCartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  floatingCartCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  floatingCartTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  floatingCartSub: {
    color: '#D1FAE5',
    fontSize: 11,
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingCartTotal: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
});
