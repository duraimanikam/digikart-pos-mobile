import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen, ScreenName } from './src/screens/HomeScreen';
import { ScanProductScreen } from './src/screens/ScanProductScreen';
import { DetectingProductScreen } from './src/screens/DetectingProductScreen';
import { ConfirmAddScreen } from './src/screens/ConfirmAddScreen';
import { NewBillScreen } from './src/screens/NewBillScreen';
import { ProductsListScreen } from './src/screens/ProductsListScreen';
import { ProductDetailsScreen } from './src/screens/ProductDetailsScreen';
import { SalesReportsScreen } from './src/screens/SalesReportsScreen';
import { BillPrintScreen } from './src/screens/BillPrintScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { DailyClosingScreen } from './src/screens/DailyClosingScreen';
import { GSTReportsScreen } from './src/screens/GSTReportsScreen';
import { AccountsScreen } from './src/screens/AccountsScreen';
import { CustomerLedgerScreen } from './src/screens/CustomerLedgerScreen';
import { SupplierLedgerScreen } from './src/screens/SupplierLedgerScreen';
import { ExpenseVoucherScreen } from './src/screens/ExpenseVoucherScreen';
import { ProfitLossScreen } from './src/screens/ProfitLossScreen';
import { StockReportScreen } from './src/screens/StockReportScreen';
import { BackupRestoreScreen } from './src/screens/BackupRestoreScreen';
import { ScreenSwitcherModal } from './src/components/ScreenSwitcherModal';
import { CheckoutModal } from './src/components/CheckoutModal';
import { INITIAL_PRODUCTS, dbService, DEFAULT_SETTINGS } from './src/database/sqlite';
import { Product, CartItem, Invoice, ShopSettings } from './src/types';
import { COLORS } from './src/theme/colors';
import {
  analyzeProductImage,
  DetectionResult,
} from './src/services/productRecognitionService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Products Database
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product>(INITIAL_PRODUCTS[0]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Photo & Detection State
  const [capturedImageUri, setCapturedImageUri] = useState<string>(
    INITIAL_PRODUCTS[0].image || ''
  );
  const [detectionResult, setDetectionResult] = useState<DetectionResult>({
    status: 'EXACT_MATCH',
    product: INITIAL_PRODUCTS[0],
    confidence: 98,
    imageUri: INITIAL_PRODUCTS[0].image || '',
    candidates: [{ product: INITIAL_PRODUCTS[0], score: 98 }],
  });

  // Clean Empty Cart (Only items added by cashier will appear)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Active Completed Invoice for Bill Print
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [nextInvoiceNo, setNextInvoiceNo] = useState<string>('000123');

  useEffect(() => {
    dbService.getProducts().then((p) => {
      if (p && p.length > 0) setProducts(p);
    });
  }, []);

  // Cart Stepper Handlers
  const handleIncrementQty = (productId: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + 1;
          return {
            ...item,
            quantity: newQty,
            totalAmount: item.product.sellingPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const handleDecrementQty = (productId: string) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity - 1;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalAmount: item.product.sellingPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearBill = () => {
    setCart([]);
  };

  // Add Item From Confirm & Add Screen
  const handleAddItemToBill = (
    product: Product,
    quantity: number,
    rate: number,
    discount: number
  ) => {
    const lineTotal = Math.max(0, rate * quantity - discount);
    const existingIndex = cart.findIndex((i) => i.product.id === product.id);

    if (existingIndex >= 0) {
      const updated = [...cart];
      const existing = updated[existingIndex];
      const newQty = existing.quantity + quantity;
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalAmount: rate * newQty - discount,
      };
      setCart(updated);
    } else {
      const newItem: CartItem = {
        product: { ...product, sellingPrice: rate },
        quantity,
        discountPercentage: discount,
        taxableAmount: lineTotal * 0.9,
        cgstAmount: lineTotal * 0.05,
        sgstAmount: lineTotal * 0.05,
        igstAmount: 0,
        totalTax: lineTotal * 0.1,
        totalAmount: lineTotal,
      };
      setCart([newItem, ...cart]);
    }

    setCurrentScreen('new_bill');
  };

  // Photo Captured Handler
  const handlePhotoCaptured = async (
    imageUri: string,
    manualProduct?: Product,
    barcode?: string
  ) => {
    setCapturedImageUri(imageUri || manualProduct?.image || '');

    // Analyze using industrial hybrid matcher (Barcode + OCR)
    const result = await analyzeProductImage(
      imageUri,
      products,
      barcode || manualProduct?.name
    );
    setDetectionResult(result);
    if (result.product) {
      setSelectedProduct(result.product);
    }
    setCurrentScreen('detect_product');
  };

  const handleAddNewProductWithPhoto = (photoUri: string) => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      brand: '',
      category: 'staples',
      barcode: `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      hsn: '0910',
      mrp: 100,
      purchaseRate: 75,
      sellingPrice: 95,
      gstRate: 5,
      stock: 50,
      unit: 'pcs',
      image: photoUri,
      keywords: [],
    });
    setCurrentScreen('product_details');
  };

  // Proceed to Payment Handler - Opens Statutory Payment Checkout
  const handleProceedToPayment = () => {
    setIsCheckoutOpen(true);
  };

  const handleInvoiceCreated = async (inv: Invoice) => {
    await dbService.createInvoice(inv);
    setActiveInvoice(inv);
    setIsCheckoutOpen(false);
    setCart([]);
    setCurrentScreen('bill_print');
  };

  // Direct Barcode Scanned Handler (Does NOT open OCR!)
  const handleBarcodeScanned = (barcode: string) => {
    const matched = products.find((p) => p.barcode === barcode);
    if (matched) {
      setSelectedProduct(matched);
      setCurrentScreen('confirm_add');
    } else {
      Alert.alert(
        'Barcode Not Registered',
        `Barcode "${barcode}" is not registered in your catalog. Do you want to add it as a new product?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Product',
            onPress: () => {
              setEditingProduct({
                id: `prod-${Date.now()}`,
                name: '',
                brand: '',
                category: 'general',
                barcode: barcode,
                hsn: '0910',
                mrp: 100,
                purchaseRate: 75,
                sellingPrice: 95,
                gstRate: 5,
                stock: 50,
                unit: 'pcs',
                keywords: [],
              });
              setCurrentScreen('product_details');
            },
          },
        ]
      );
    }
  };

  // Quick Save & Add Handler (From OCR Photo Detection)
  const handleQuickSaveAndAdd = async (
    product: Product,
    rate: number,
    quantity: number
  ) => {
    await dbService.saveProduct(product);
    setProducts((prev) => [product, ...prev]);
    handleAddItemToBill(product, quantity, rate, 0);
  };

  // Inward Purchase Stock Update Handler
  const handleStockUpdated = (productId: string, inwardQty: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: p.stock + inwardQty } : p
      )
    );
  };

  const handleSaveProductMaster = (prod: Product) => {
    dbService.saveProduct(prod);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === prod.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = prod;
        return updated;
      }
      return [prod, ...prev];
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.headerBg} />

      {/* Screen Router for all 20 screens */}
      {currentScreen === 'home' && (
        <HomeScreen
          onNavigate={setCurrentScreen}
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
          onOpenMenu={() => setIsSwitcherOpen(true)}
        />
      )}

      {currentScreen === 'scan_photo' && (
        <ScanProductScreen
          onBack={() => setCurrentScreen('home')}
          onPhotoCaptured={handlePhotoCaptured}
          onBarcodeScanned={handleBarcodeScanned}
          availableProducts={products}
        />
      )}

      {currentScreen === 'detect_product' && (
        <DetectingProductScreen
          imageUri={capturedImageUri}
          detectionResult={detectionResult}
          onRetake={() => setCurrentScreen('scan_photo')}
          onProceedToConfirm={(prod) => {
            setSelectedProduct(prod);
            setCurrentScreen('confirm_add');
          }}
          onAddNewProductWithPhoto={handleAddNewProductWithPhoto}
          onQuickSaveAndAdd={handleQuickSaveAndAdd}
          catalog={products}
        />
      )}

      {currentScreen === 'confirm_add' && (
        <ConfirmAddScreen
          product={selectedProduct}
          onCancel={() => setCurrentScreen('detect_product')}
          onAddItem={handleAddItemToBill}
        />
      )}

      {currentScreen === 'new_bill' && (
        <NewBillScreen
          cart={cart}
          onBack={() => setCurrentScreen('home')}
          onIncrementQty={handleIncrementQty}
          onDecrementQty={handleDecrementQty}
          onRemoveItem={handleRemoveItem}
          onClearBill={handleClearBill}
          onProceedToPayment={handleProceedToPayment}
          onOpenScanner={() => setCurrentScreen('scan_photo')}
          onOpenBarcodeScanner={() => setCurrentScreen('scan_photo')}
          onSelectProductToAdd={(prod) => {
            setSelectedProduct(prod);
            setCurrentScreen('confirm_add');
          }}
          allProducts={products}
        />
      )}

      {currentScreen === 'products_list' && (
        <ProductsListScreen
          products={products}
          onBack={() => setCurrentScreen('home')}
          onSelectProduct={(prod) => {
            setEditingProduct(prod);
            setCurrentScreen('product_details');
          }}
          onAddNewProduct={() => {
            setEditingProduct(null);
            setCurrentScreen('product_details');
          }}
          onAddToCart={(prod) => {
            setSelectedProduct(prod);
            setCurrentScreen('confirm_add');
          }}
        />
      )}

      {currentScreen === 'product_details' && (
        <ProductDetailsScreen
          product={editingProduct}
          onBack={() => setCurrentScreen('products_list')}
          onSaveProduct={handleSaveProductMaster}
          onOpenScanner={() => setCurrentScreen('scan_photo')}
        />
      )}

      {currentScreen === 'sales_reports' && (
        <SalesReportsScreen onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'bill_print' && (
        <BillPrintScreen
          invoice={activeInvoice}
          onBack={() => setCurrentScreen('new_bill')}
          onNewBill={() => {
            setCart([]);
            setCurrentScreen('new_bill');
          }}
        />
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          onBack={() => setCurrentScreen('home')}
          onNavigate={setCurrentScreen}
        />
      )}

      {currentScreen === 'login' && (
        <LoginScreen onLoginSuccess={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'daily_closing' && (
        <DailyClosingScreen
          onBack={() => setCurrentScreen('home')}
          onCloseSuccess={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'gst_reports' && (
        <GSTReportsScreen onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'accounts' && (
        <AccountsScreen
          onBack={() => setCurrentScreen('home')}
          onNavigateToExpense={() => setCurrentScreen('expense_voucher')}
          onNavigateToCustomer={() => setCurrentScreen('customer_ledger')}
          onNavigateToSupplier={() => setCurrentScreen('supplier_ledger')}
        />
      )}

      {currentScreen === 'customer_ledger' && (
        <CustomerLedgerScreen
          onBack={() => setCurrentScreen('home')}
          onNewInvoice={() => setCurrentScreen('new_bill')}
        />
      )}

      {currentScreen === 'supplier_ledger' && (
        <SupplierLedgerScreen
          onBack={() => setCurrentScreen('home')}
          products={products}
          onStockUpdated={handleStockUpdated}
        />
      )}

      {currentScreen === 'expense_voucher' && (
        <ExpenseVoucherScreen
          onBack={() => setCurrentScreen('home')}
          onSaved={() => setCurrentScreen('accounts')}
        />
      )}

      {currentScreen === 'profit_loss' && (
        <ProfitLossScreen onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'stock_report' && (
        <StockReportScreen onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'backup_restore' && (
        <BackupRestoreScreen onBack={() => setCurrentScreen('settings')} />
      )}

      {/* Floating Quick Screen Switcher Pill */}
      <TouchableOpacity
        style={styles.floatingSwitcherPill}
        onPress={() => setIsSwitcherOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="grid" size={16} color="#FFFFFF" />
        <Text style={styles.floatingSwitcherText}>All 20 Screens</Text>
      </TouchableOpacity>

      {/* Screen Switcher Modal */}
      <ScreenSwitcherModal
        visible={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
      />

      {/* Statutory Payment Checkout Modal */}
      <CheckoutModal
        visible={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        settings={DEFAULT_SETTINGS}
        onInvoiceCreated={handleInvoiceCreated}
        nextInvoiceNo={nextInvoiceNo}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  floatingSwitcherPill: {
    position: 'absolute',
    bottom: 64,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  floatingSwitcherText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
