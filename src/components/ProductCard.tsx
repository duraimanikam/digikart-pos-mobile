import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  cartQuantity?: number;
  onAddToCart: (product: Product) => void;
  onProductPress?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currencySymbol,
  cartQuantity = 0,
  onAddToCart,
  onProductPress,
}) => {
  const isLowStock = product.stock <= 10;
  const isOutOfStock = product.stock <= 0;

  const getGstBadgeColor = (rate: number) => {
    switch (rate) {
      case 0:
        return '#059669'; // Green (Exempt)
      case 5:
        return '#0284C7'; // Blue
      case 12:
        return '#D97706'; // Amber
      case 18:
        return '#7C3AED'; // Purple
      case 28:
        return '#DC2626'; // Red
      default:
        return '#64748B';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, cartQuantity > 0 && styles.cardInCart]}
      activeOpacity={0.85}
      onPress={() => onProductPress && onProductPress(product)}
    >
      {/* Top Media / Thumbnail Section */}
      <View style={styles.imageContainer}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="basket-outline" size={32} color="#64748B" />
          </View>
        )}

        {/* GST Rate Badge */}
        <View
          style={[
            styles.gstBadge,
            { backgroundColor: getGstBadgeColor(product.gstRate) },
          ]}
        >
          <Text style={styles.gstBadgeText}>GST {product.gstRate}%</Text>
        </View>

        {/* Cart Quantity Badge if already added */}
        {cartQuantity > 0 && (
          <View style={styles.cartQtyBadge}>
            <Text style={styles.cartQtyText}>{cartQuantity}</Text>
          </View>
        )}

        {/* Stock Badge */}
        <View
          style={[
            styles.stockBadge,
            isOutOfStock
              ? styles.stockOut
              : isLowStock
              ? styles.stockLow
              : styles.stockOk,
          ]}
        >
          <Text style={styles.stockBadgeText}>
            {isOutOfStock
              ? 'Out of Stock'
              : `${product.stock} ${product.unit}`}
          </Text>
        </View>
      </View>

      {/* Product Content Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.brandRow}>
          <Text style={styles.brandText} numberOfLines={1}>
            {product.brand.toUpperCase()}
          </Text>
          <Text style={styles.hsnText}>HSN: {product.hsn}</Text>
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price & Action Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <View style={styles.sellingPriceRow}>
              <Text style={styles.currency}>{currencySymbol}</Text>
              <Text style={styles.sellingPrice}>
                {product.sellingPrice.toFixed(0)}
              </Text>
              <Text style={styles.unitText}>/{product.unit}</Text>
            </View>

            {product.mrp > product.sellingPrice && (
              <Text style={styles.mrpText}>
                MRP {currencySymbol}
                {product.mrp.toFixed(0)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              isOutOfStock && styles.addButtonDisabled,
              cartQuantity > 0 && styles.addButtonActive,
            ]}
            disabled={isOutOfStock}
            onPress={() => onAddToCart(product)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={cartQuantity > 0 ? 'checkmark' : 'add'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.addButtonText}>
              {cartQuantity > 0 ? 'Add +' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    marginBottom: 12,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  cardInCart: {
    borderColor: '#10B981',
    backgroundColor: '#1E293B',
  },
  imageContainer: {
    height: 120,
    width: '100%',
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  gstBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  gstBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cartQtyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10B981',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  cartQtyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  stockBadge: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockOk: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  stockLow: {
    backgroundColor: '#B45309',
  },
  stockOut: {
    backgroundColor: '#DC2626',
  },
  stockBadgeText: {
    color: '#E2E8F0',
    fontSize: 9,
    fontWeight: '700',
  },
  detailsContainer: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  brandText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    flex: 1,
  },
  hsnText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
  },
  productName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceContainer: {
    flex: 1,
  },
  sellingPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  sellingPrice: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  unitText: {
    color: '#94A3B8',
    fontSize: 10,
    marginLeft: 2,
  },
  mrpText: {
    color: '#64748B',
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 3,
  },
  addButtonActive: {
    backgroundColor: '#10B981',
  },
  addButtonDisabled: {
    backgroundColor: '#475569',
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
