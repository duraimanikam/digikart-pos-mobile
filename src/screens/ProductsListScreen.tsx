import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';
import { Product } from '../types';

interface ProductsListScreenProps {
  products: Product[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onAddNewProduct: () => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductsListScreen: React.FC<ProductsListScreenProps> = ({
  products,
  onBack,
  onSelectProduct,
  onAddNewProduct,
  onAddToCart,
}) => {
  const [search, setSearch] = useState('');

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 6 Header matching Image 1 Screen 6 */}
      <AppHeader
        title="Products"
        showBack={true}
        onBack={onBack}
        rightIcon="add"
        onRightPress={onAddNewProduct}
      />

      {/* Search Input Bar with Barcode Scanner Icon */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInner}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search product..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.barcodeIcon}>
            <Ionicons name="barcode-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Products List matching Screen 6 */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => onSelectProduct(item)}
            activeOpacity={0.7}
          >
            {/* Thumbnail */}
            <View style={styles.thumbWrapper}>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="cube" size={24} color={COLORS.primary} />
              )}
            </View>

            {/* Product Meta */}
            <View style={styles.productMeta}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.productUnit}>{item.unit}</Text>
              <Text style={styles.productPrice}>₹{item.sellingPrice.toFixed(2)}</Text>
            </View>

            {/* Stock Count Badge */}
            <View style={styles.stockColumn}>
              <Text style={styles.stockText}>Stock: {item.stock}</Text>
              <TouchableOpacity
                style={styles.menuDotsBtn}
                onPress={() => onSelectProduct(item)}
              >
                <Ionicons name="ellipsis-vertical" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  barcodeIcon: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  thumbWrapper: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  productMeta: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  productUnit: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 3,
  },
  stockColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 46,
  },
  stockText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  menuDotsBtn: {
    padding: 4,
  },
});
