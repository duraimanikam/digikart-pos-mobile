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
import { CartItem, Product } from '../types';

interface NewBillScreenProps {
  cart: CartItem[];
  onBack: () => void;
  onIncrementQty: (productId: string) => void;
  onDecrementQty: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  onClearBill: () => void;
  onProceedToPayment: () => void;
  onOpenScanner: () => void;
  onOpenBarcodeScanner?: () => void;
  onSelectProductToAdd?: (product: Product) => void;
  allProducts: Product[];
}

export const NewBillScreen: React.FC<NewBillScreenProps> = ({
  cart,
  onBack,
  onIncrementQty,
  onDecrementQty,
  onRemoveItem,
  onClearBill,
  onProceedToPayment,
  onOpenScanner,
  onOpenBarcodeScanner,
  onSelectProductToAdd,
  allProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const totalItemsCount = cart.length;
  const totalQtyCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.totalAmount, 0);

  // Filtered products for quick add when typing
  const searchResults = searchQuery.trim()
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode.includes(searchQuery)
      )
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen 5 Header */}
      <AppHeader title="New Bill" showBack={true} onBack={onBack} />

      {/* Product Search Bar matching Screen 5 */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInner}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search product (name / barcode)..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.searchActionIcon}
            onPress={onOpenScanner}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchActionIcon}
            onPress={onOpenBarcodeScanner || onOpenScanner}
            activeOpacity={0.7}
          >
            <Ionicons name="barcode-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Search Suggestions Overlay */}
      {searchResults.length > 0 && (
        <View style={styles.searchDropdown}>
          {searchResults.slice(0, 5).map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.searchDropdownItem}
              onPress={() => {
                if (onSelectProductToAdd) onSelectProductToAdd(p);
                setSearchQuery('');
              }}
            >
              <View>
                <Text style={styles.dropdownName}>{p.name}</Text>
                <Text style={styles.dropdownSub}>
                  {p.unit} • Stock: {p.stock}
                </Text>
              </View>
              <Text style={styles.dropdownPrice}>₹{p.sellingPrice.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bill Items List: Only displays items added by cashier */}
      <View style={styles.listContainer}>
        {cart.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={54} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Cart is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Scan a product photo, scan barcode, or search above to add items to this bill.
            </Text>

            <View style={styles.emptyButtonsRow}>
              <TouchableOpacity style={styles.emptyScanBtn} onPress={onOpenScanner}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
                <Text style={styles.emptyBtnText}>Scan Product Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emptyBarcodeBtn}
                onPress={onOpenBarcodeScanner || onOpenScanner}
              >
                <Ionicons name="barcode-outline" size={18} color={COLORS.primary} />
                <Text style={styles.emptyBarcodeBtnText}>Barcode Scan</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Add Catalog Items */}
            <View style={styles.quickAddSection}>
              <Text style={styles.quickAddTitle}>QUICK ADD FROM CATALOG:</Text>
              <View style={styles.quickAddChips}>
                {allProducts.slice(0, 4).map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.quickAddChip}
                    onPress={() => {
                      if (onSelectProductToAdd) onSelectProductToAdd(p);
                    }}
                  >
                    <Ionicons name="add" size={14} color={COLORS.primary} />
                    <Text style={styles.quickAddChipText} numberOfLines={1}>
                      {p.name.split(' ')[0]} (₹{p.sellingPrice})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <FlatList
            data={cart}
            keyExtractor={(item) => item.product.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                {/* Thumbnail */}
                <View style={styles.thumbnailBox}>
                  {item.product.image ? (
                    <Image
                      source={{ uri: item.product.image }}
                      style={styles.thumbImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="cube" size={24} color={COLORS.primary} />
                  )}
                </View>

                {/* Details */}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemUnit}>{item.product.unit}</Text>
                  <Text style={styles.itemRate}>
                    {item.product.sellingPrice.toFixed(2)}
                  </Text>
                </View>

                {/* Stepper */}
                <View style={styles.stepperBox}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => onDecrementQty(item.product.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={14} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => onIncrementQty(item.product.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Line Total */}
                <Text style={styles.lineTotalText}>
                  {item.totalAmount.toFixed(2)}
                </Text>

                {/* Trash Icon */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onRemoveItem(item.product.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* Bottom Summary Bar matching Screen 5 */}
      <View style={styles.bottomSummary}>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statLabel}>Items: {totalItemsCount}</Text>
            <Text style={styles.statLabel}>Total Qty: {totalQtyCount}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹ {totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Buttons matching Screen 5 */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.clearBtn, cart.length === 0 && styles.btnDisabled]}
            onPress={onClearBill}
            disabled={cart.length === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentBtn,
              cart.length === 0 && styles.paymentBtnDisabled,
            ]}
            onPress={onProceedToPayment}
            disabled={cart.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.paymentBtnText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBarContainer: {
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
  searchActionIcon: {
    padding: 6,
    marginLeft: 4,
  },
  searchDropdown: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    zIndex: 99,
    ...SHADOWS.card,
  },
  searchDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dropdownSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dropdownPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 14,
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  thumbnailBox: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    marginRight: 6,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  itemUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  itemRate: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 10,
  },
  stepBtn: {
    padding: 6,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    paddingHorizontal: 6,
  },
  lineTotalText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 50,
    textAlign: 'right',
    marginRight: 8,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  emptyScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    ...SHADOWS.card,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyBarcodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyBarcodeBtnText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  quickAddSection: {
    marginTop: 10,
    alignItems: 'center',
  },
  quickAddTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  quickAddChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  quickAddChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  quickAddChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bottomSummary: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 16,
    ...SHADOWS.floating,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  totalBox: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  paymentBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    ...SHADOWS.card,
  },
  paymentBtnDisabled: {
    opacity: 0.5,
  },
  paymentBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});