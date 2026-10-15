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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';
import { Product } from '../types';

interface ConfirmAddScreenProps {
  product: Product;
  onCancel: () => void;
  onAddItem: (product: Product, quantity: number, rate: number, discount: number) => void;
}

export const ConfirmAddScreen: React.FC<ConfirmAddScreenProps> = ({
  product,
  onCancel,
  onAddItem,
}) => {
  const [rate, setRate] = useState(product.sellingPrice.toFixed(2));
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState('0.00');

  const numRate = parseFloat(rate) || 0;
  const numDiscount = parseFloat(discount) || 0;
  const totalAmount = Math.max(0, numRate * quantity - numDiscount);

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleConfirm = () => {
    onAddItem(product, quantity, numRate, numDiscount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 4 Header */}
      <AppHeader title="Add to Bill" showBack={true} onBack={onCancel} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Product Identity Card matching Screen 4 */}
        <View style={styles.productBanner}>
          <View style={styles.thumbnailWrapper}>
            {product.image ? (
              <Image
                source={{ uri: product.image }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="cube-outline" size={32} color={COLORS.primary} />
            )}
          </View>
          <View style={styles.productText}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productUnit}>{product.unit}</Text>
          </View>
        </View>

        {/* Input Form Fields matching Screen 4 */}
        <View style={styles.formContainer}>
          {/* Rate (₹) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Rate (₹)</Text>
            <TextInput
              style={styles.textInput}
              value={rate}
              onChangeText={setRate}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Qty Stepper */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Qty</Text>
            <View style={styles.qtyRow}>
              <Text style={styles.qtyDirectVal}>{quantity}</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={handleDecrement}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.stepperCount}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={handleIncrement}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Discount (₹) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Discount (₹)</Text>
            <TextInput
              style={styles.textInput}
              value={discount}
              onChangeText={setDiscount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Total Amount Card */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons matching Screen 4 */}
      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addItemBtn}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.addItemBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>
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
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  thumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  productText: {
    flex: 1,
  },
  productName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  productUnit: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  qtyDirectVal: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  totalSection: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  totalValue: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  footerButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  addItemBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    ...SHADOWS.card,
  },
  addItemBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
