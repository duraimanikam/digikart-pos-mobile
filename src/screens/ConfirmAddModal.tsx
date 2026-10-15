import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';

interface ConfirmAddModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onAddItem: (product: Product, quantity: number, rate: number, discount: number) => void;
}

export const ConfirmAddModal: React.FC<ConfirmAddModalProps> = ({
  visible,
  product,
  onClose,
  onAddItem,
}) => {
  if (!product) return null;

  const [rate, setRate] = useState(product.sellingPrice.toFixed(2));
  const [qty, setQty] = useState(1);
  const [discount, setDiscount] = useState('0.00');

  const parsedRate = parseFloat(rate) || 0;
  const parsedDiscount = parseFloat(discount) || 0;
  const totalAmount = Math.max(0, parsedRate * qty - parsedDiscount);

  const handleConfirm = () => {
    onAddItem(product, qty, parsedRate, parsedDiscount);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header matching Screen 4 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add to Bill</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.body}>
          {/* Top Product Summary */}
          <View style={styles.productBanner}>
            <Image
              source={{
                uri:
                  product.image ||
                  'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&q=80',
              }}
              style={styles.productThumb}
            />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productUnit}>{product.unit}</Text>
            </View>
          </View>

          {/* Form Fields matching Screen 4 */}
          <View style={styles.card}>
            {/* Rate (₹) */}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Rate (₹)</Text>
              <TextInput
                style={styles.textInput}
                value={rate}
                onChangeText={setRate}
                keyboardType="numeric"
              />
            </View>

            {/* Qty with Stepper */}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Qty</Text>
              <View style={styles.qtyRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1, marginRight: 12 }]}
                  value={qty.toString()}
                  onChangeText={(v) => setQty(parseInt(v, 10) || 1)}
                  keyboardType="numeric"
                />
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setQty((prev) => Math.max(1, prev - 1))}
                  >
                    <Ionicons name="remove" size={18} color="#475569" />
                  </TouchableOpacity>
                  <Text style={styles.stepQtyDisplay}>{qty}</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setQty((prev) => prev + 1)}
                  >
                    <Ionicons name="add" size={18} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Discount (₹) */}
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Discount (₹)</Text>
              <TextInput
                style={styles.textInput}
                value={discount}
                onChangeText={setDiscount}
                keyboardType="numeric"
              />
            </View>

            {/* Total Amount Callout */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalVal}>{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Buttons matching Screen 4 */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addItemBtn} onPress={handleConfirm} activeOpacity={0.8}>
            <Text style={styles.addItemBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    padding: 16,
    flex: 1,
  },
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  productDetails: {
    marginLeft: 14,
  },
  productName: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '800',
  },
  productUnit: {
    color: '#64748B',
    fontSize: 12.5,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 14,
  },
  formGroup: {},
  inputLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepBtn: {
    padding: 6,
  },
  stepQtyDisplay: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '800',
    minWidth: 28,
    textAlign: 'center',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  totalLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  totalVal: {
    color: '#1E293B',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  addItemBtn: {
    flex: 1.5,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  addItemBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
