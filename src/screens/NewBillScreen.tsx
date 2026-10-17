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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { COLORS, SHADOWS } from '../theme/colors';
import { CartItem, Product } from '../types';
import { DedicatedBarcodeScannerModal } from '../components/DedicatedBarcodeScannerModal';
import { VoiceItemEntryModal, VoiceParsedItem } from '../components/VoiceItemEntryModal';

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
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const handleVoiceItemConfirmed = (item: VoiceParsedItem) => {
    const matched = allProducts.find(
      (p) =>
        p.name.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(p.name.toLowerCase())
    );

    if (matched && onSelectProductToAdd) {
      onSelectProductToAdd(matched);
    } else if (onSelectProductToAdd) {
      const dynamicProduct: Product = {
        id: `voice-${Date.now()}`,
        name: item.name,
        brand: 'Direct Item',
        category: 'staples',
        barcode: `890${Date.now().toString().slice(-10)}`,
        hsn: '2106',
        mrp: item.price * 1.1,
        purchaseRate: item.price * 0.8,
        sellingPrice: item.price,
        gstRate: 5,
        stock: 50,
        unit: item.unit,
        keywords: [item.name.toLowerCase()],
      };
      onSelectProductToAdd(dynamicProduct);
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    const matched = allProducts.find((p) => p.barcode === barcode);
    if (matched && onSelectProductToAdd) {
      onSelectProductToAdd(matched);
    } else {
      Alert.alert(
        'Barcode Scanned',
        `Barcode: ${barcode} not found in catalog. Add new item?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add to Bill',
            onPress: () => {
              if (onSelectProductToAdd) {
                onSelectProductToAdd({
                  id: `scanned-${Date.now()}`,
                  name: `Item #${barcode.slice(-4)}`,
                  brand: 'Retail',
                  category: 'staples',
                  barcode,
                  hsn: '2106',
                  mrp: 100,
                  purchaseRate: 75,
                  sellingPrice: 95,
                  gstRate: 5,
                  stock: 50,
                  unit: 'pcs',
                  keywords: [],
                });
              }
            },
          },
        ]
      );
    }
  };

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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.headerBg} />

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
            onPress={() => setIsVoiceModalOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="mic" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchActionIcon}
            onPress={() => setIsBarcodeModalOpen(true)}
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
              Scan barcode, speak item name with voice, or search above to add items to this bill.
            </Text>

            <View style={styles.emptyButtonsRow}>
              <TouchableOpacity
                style={styles.emptyScanBtn}
                onPress={() => setIsBarcodeModalOpen(true)}
              >
                <Ionicons name="barcode-outline" size={18} color="#FFFFFF" />
                <Text style={styles.emptyBtnText}>Scan Barcode / QR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.emptyBarcodeBtn}
                onPress={() => setIsVoiceModalOpen(true)}
              >
                <Ionicons name="mic" size={18} color={COLORS.secondary} />
                <Text style={[styles.emptyBarcodeBtnText, { color: COLORS.secondary }]}>
                  Voice Item Entry
                </Text>
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

      {/* Dedicated Barcode Scanner Modal */}
      <DedicatedBarcodeScannerModal
        visible={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onScan={handleBarcodeScanned}
        title="Scan Product Barcode"
        subtitle="Align product barcode in laser frame to add to bill"
      />

      {/* Voice to Item Entry Modal */}
      <VoiceItemEntryModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onItemConfirmed={handleVoiceItemConfirmed}
        title="Voice Billing Entry"
        targetScreen="billing"
      />
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