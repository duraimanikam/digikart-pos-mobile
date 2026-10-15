import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem, ShopSettings } from '../types';

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: ShopSettings;
  onIncrementQuantity: (productId: string) => void;
  onDecrementQuantity: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  isInterstate: boolean;
}

export const CartModal: React.FC<CartModalProps> = ({
  visible,
  onClose,
  cart,
  settings,
  onIncrementQuantity,
  onDecrementQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  isInterstate,
}) => {
  const subtotal = cart.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalTaxable = cart.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalCgst = cart.reduce((sum, item) => sum + item.cgstAmount, 0);
  const totalSgst = cart.reduce((sum, item) => sum + item.sgstAmount, 0);
  const totalIgst = cart.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalTax = isInterstate ? totalIgst : totalCgst + totalSgst;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBadge}>
                <Ionicons name="basket" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Current Bill</Text>
                <Text style={styles.headerSubtitle}>
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in active cart
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              {cart.length > 0 && (
                <TouchableOpacity
                  onPress={onClearCart}
                  style={styles.clearBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color="#334155" />
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySubtitle}>
                Add items from the catalog or tap "Snap & Bill" to scan product packaging.
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.itemsList}
                showsVerticalScrollIndicator={false}
              >
                {cart.map((item) => (
                  <View key={item.product.id} style={styles.itemRow}>
                    {item.product.image ? (
                      <Image
                        source={{ uri: item.product.image }}
                        style={styles.itemThumb}
                      />
                    ) : (
                      <View style={styles.itemThumbPlaceholder}>
                        <Ionicons name="cube-outline" size={20} color="#64748B" />
                      </View>
                    )}

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <View style={styles.itemMeta}>
                        <Text style={styles.itemGstBadge}>
                          GST {item.product.gstRate}%
                        </Text>
                        <Text style={styles.itemHsn}>HSN: {item.product.hsn}</Text>
                        <Text style={styles.itemRate}>
                          @{settings.currencySymbol}
                          {item.product.sellingPrice.toFixed(0)}/{item.product.unit}
                        </Text>
                      </View>
                    </View>

                    {/* Stepper Controls */}
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => onDecrementQuantity(item.product.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={item.quantity === 1 ? 'trash' : 'remove'}
                          size={14}
                          color={item.quantity === 1 ? '#EF4444' : '#E2E8F0'}
                        />
                      </TouchableOpacity>

                      <Text style={styles.qtyText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => onIncrementQuantity(item.product.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={14} color="#E2E8F0" />
                      </TouchableOpacity>
                    </View>

                    {/* Line Total */}
                    <View style={styles.itemTotalBox}>
                      <Text style={styles.itemTotalText}>
                        {settings.currencySymbol}
                        {item.totalAmount.toFixed(0)}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Bill Summary Footer */}
              <View style={styles.footerContainer}>
                {/* GST Breakdown Strip */}
                <View style={styles.taxSummaryStrip}>
                  <View style={styles.taxCol}>
                    <Text style={styles.taxLabel}>Taxable Amt</Text>
                    <Text style={styles.taxVal}>
                      {settings.currencySymbol}
                      {totalTaxable.toFixed(2)}
                    </Text>
                  </View>

                  {!isInterstate ? (
                    <>
                      <View style={styles.taxCol}>
                        <Text style={styles.taxLabel}>CGST</Text>
                        <Text style={styles.taxVal}>
                          {settings.currencySymbol}
                          {totalCgst.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.taxCol}>
                        <Text style={styles.taxLabel}>SGST</Text>
                        <Text style={styles.taxVal}>
                          {settings.currencySymbol}
                          {totalSgst.toFixed(2)}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.taxCol}>
                      <Text style={styles.taxLabel}>IGST</Text>
                      <Text style={styles.taxVal}>
                        {settings.currencySymbol}
                        {totalIgst.toFixed(2)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.taxCol}>
                    <Text style={styles.taxLabel}>Total Tax</Text>
                    <Text style={[styles.taxVal, { color: '#10B981' }]}>
                      {settings.currencySymbol}
                      {totalTax.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Grand Total & Checkout Action */}
                <View style={styles.checkoutBar}>
                  <View>
                    <Text style={styles.grandTotalLabel}>TOTAL AMOUNT</Text>
                    <Text style={styles.grandTotalAmount}>
                      {settings.currencySymbol}
                      {Math.round(subtotal).toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={onProceedToCheckout}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.checkoutBtnText}>Payment</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    minHeight: '40%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EF444415',
    gap: 4,
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
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
  emptySubtitle: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  itemsList: {
    maxHeight: 320,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  itemThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  itemName: {
    color: '#F8FAFC',
    fontSize: 12.5,
    fontWeight: '700',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  itemGstBadge: {
    backgroundColor: '#334155',
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemHsn: {
    color: '#64748B',
    fontSize: 9.5,
  },
  itemRate: {
    color: '#94A3B8',
    fontSize: 9.5,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepBtn: {
    padding: 6,
  },
  qtyText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotalBox: {
    marginLeft: 10,
    minWidth: 55,
    alignItems: 'flex-end',
  },
  itemTotalText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  footerContainer: {
    backgroundColor: '#0B1120',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  taxSummaryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  taxCol: {
    alignItems: 'center',
  },
  taxLabel: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  taxVal: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  checkoutBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  grandTotalAmount: {
    color: '#10B981',
    fontSize: 22,
    fontWeight: '900',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
