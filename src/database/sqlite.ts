import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import {
  Product,
  Category,
  Invoice,
  InvoiceItem,
  ShopSettings,
  Customer,
  CustomerPayment,
  RegisterShift,
} from '../types';

const DB_NAME = 'digikart_pos.db';

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'DigiKart Super Market',
  tagline: 'Retail Billing Made Simple',
  gstin: '33ABCDE1234F1Z5',
  phone: '98765 43210',
  email: 'support@digikartpos.com',
  address: 'No. 123, Main Road, Chennai - 600001',
  state: 'Tamil Nadu',
  stateCode: '33',
  receiptHeader: 'TAX INVOICE',
  receiptFooter: 'Thank You! Visit Again.',
  currencySymbol: '₹',
  enableSound: true,
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'All Items', icon: 'grid-outline', color: '#4F46E5' },
  { id: 'spices', name: 'Spices & Masala', icon: 'flame-outline', color: '#F59E0B' },
  { id: 'dairy', name: 'Dairy & Milk', icon: 'nutrition-outline', color: '#06B6D4' },
  { id: 'snacks', name: 'Biscuits & Snacks', icon: 'fast-food-outline', color: '#EC4899' },
  { id: 'beverages', name: 'Cold Drinks & Beverages', icon: 'cafe-outline', color: '#10B981' },
  { id: 'staples', name: 'Grains & Staples', icon: 'basket-outline', color: '#8B5CF6' },
  { id: 'personal', name: 'Personal & Home Care', icon: 'sparkles-outline', color: '#6366F1' },
];

// Seed products matching the exact screenshots
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Aachi Turmeric Powder',
    brand: 'Aachi',
    category: 'spices',
    barcode: '8906021123456',
    hsn: '0910',
    mrp: 130,
    purchaseRate: 90,
    sellingPrice: 120,
    gstRate: 5,
    stock: 45,
    unit: '500 g',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=300&q=80',
    keywords: ['aachi', 'turmeric', 'powder', 'manjal', 'haldi', '500g', 'spices'],
  },
  {
    id: 'prod-002',
    name: 'Aavin Milk',
    brand: 'Aavin',
    category: 'dairy',
    barcode: '8901262010992',
    hsn: '0401',
    mrp: 70,
    purchaseRate: 55,
    sellingPrice: 68,
    gstRate: 0,
    stock: 30,
    unit: '1 Ltr',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80',
    keywords: ['aavin', 'milk', 'fresh', 'dairy', '1ltr', 'pasteurized', 'blue'],
  },
  {
    id: 'prod-003',
    name: 'Sunfeast Marie Biscuits',
    brand: 'Sunfeast',
    category: 'snacks',
    barcode: '8901058852110',
    hsn: '1905',
    mrp: 35,
    purchaseRate: 24,
    sellingPrice: 30,
    gstRate: 18,
    stock: 60,
    unit: '200 g',
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&q=80',
    keywords: ['sunfeast', 'marie', 'biscuits', 'tea', 'cookie', '200g', 'snacks'],
  },
  {
    id: 'prod-004',
    name: 'Coca Cola',
    brand: 'Coca Cola',
    category: 'beverages',
    barcode: '8901764041123',
    hsn: '2202',
    mrp: 50,
    purchaseRate: 38,
    sellingPrice: 45,
    gstRate: 28,
    stock: 50,
    unit: '750 ml',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&q=80',
    keywords: ['coca cola', 'coke', 'cold drink', 'soft drink', '750ml', 'soda'],
  },
  {
    id: 'prod-005',
    name: 'Tata Salt Vacuum Evaporated',
    brand: 'Tata',
    category: 'staples',
    barcode: '8901058852331',
    hsn: '2501',
    mrp: 28,
    purchaseRate: 20,
    sellingPrice: 26,
    gstRate: 0,
    stock: 120,
    unit: '1 kg',
    image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=300&q=80',
    keywords: ['tata', 'salt', 'namak', 'iodised', '1kg'],
  },
  {
    id: 'prod-006',
    name: 'Aashirvaad Superior MP Shudh Chakki Atta',
    brand: 'Aashirvaad',
    category: 'staples',
    barcode: '8901725121112',
    hsn: '1101',
    mrp: 275,
    purchaseRate: 220,
    sellingPrice: 255,
    gstRate: 5,
    stock: 35,
    unit: '5 kg',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&q=80',
    keywords: ['aashirvaad', 'atta', 'wheat', 'chakki', '5kg', 'flour'],
  },
  {
    id: 'prod-007',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    brand: 'Fortune',
    category: 'staples',
    barcode: '8906007281024',
    hsn: '1512',
    mrp: 145,
    purchaseRate: 115,
    sellingPrice: 135,
    gstRate: 5,
    stock: 40,
    unit: '1 Ltr',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&q=80',
    keywords: ['fortune', 'sunlite', 'sunflower', 'oil', 'cooking', '1ltr'],
  },
  {
    id: 'prod-008',
    name: 'Dettol Original Bathing Soap Bar',
    brand: 'Dettol',
    category: 'personal',
    barcode: '8901396112224',
    hsn: '3401',
    mrp: 45,
    purchaseRate: 32,
    sellingPrice: 40,
    gstRate: 18,
    stock: 80,
    unit: '125 g',
    image: 'https://images.unsplash.com/photo-1607006314144-482f34969420?w=300&q=80',
    keywords: ['dettol', 'soap', 'bath', 'germ', 'protection', 'green'],
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-01',
    name: 'Ramesh Kumar',
    phone: '98765 11223',
    email: 'ramesh.k@gmail.com',
    address: 'No. 45, Gandhi Street, Chennai',
    totalPurchases: 8450,
    pendingCredit: 1200,
    lastVisit: '15-10-2026',
  },
  {
    id: 'cust-02',
    name: 'Priya Sharma',
    phone: '94432 99881',
    email: 'priya.sharma@yahoo.com',
    address: 'Flat 3B, Lakeview Apts, Chennai',
    totalPurchases: 14200,
    pendingCredit: 0,
    lastVisit: '15-10-2026',
  },
  {
    id: 'cust-03',
    name: 'Anbu Selvan',
    phone: '97890 44556',
    address: '12/A, Bazar Road, Chennai',
    totalPurchases: 6100,
    pendingCredit: 750,
    lastVisit: '14-10-2026',
  },
  {
    id: 'cust-04',
    name: 'Saravanan Retail Stores',
    phone: '91234 56789',
    gstin: '33AAACD9876E1Z2',
    address: 'Market Complex, Shop #8, Chennai',
    totalPurchases: 32500,
    pendingCredit: 4500,
    lastVisit: '15-10-2026',
  },
];

export const INITIAL_SHIFT: RegisterShift = {
  id: 'shift-today',
  date: '15-10-2026',
  openedAt: '08:30 AM',
  openedBy: 'Admin / Cashier 1',
  openingCash: 2000,
  cashSales: 18240,
  gpaySales: 3250,
  phonepeSales: 2490,
  paytmSales: 1700,
  bankSales: 4120,
  creditSales: 1950,
  otherSales: 650,
  totalExpenses: 500,
  expectedCash: 19740, // 2000 opening + 18240 cash - 500 expense
  status: 'OPEN',
};

class DatabaseService {
  private nativeDb: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  private webProducts: Product[] = [];
  private webInvoices: Invoice[] = [];
  private webCustomers: Customer[] = [];
  private webPayments: CustomerPayment[] = [];
  private webCurrentShift: RegisterShift = { ...INITIAL_SHIFT };
  private webShiftHistory: RegisterShift[] = [];
  private webSettings: ShopSettings = { ...DEFAULT_SETTINGS };

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    if (Platform.OS !== 'web') {
      try {
        this.nativeDb = await SQLite.openDatabaseAsync(DB_NAME);
        await this.createNativeTables();
        await this.seedNativeData();
      } catch (err) {
        console.warn('Native SQLite fallback to storage:', err);
        this.initWebStorage();
      }
    } else {
      this.initWebStorage();
    }

    this.isInitialized = true;
  }

  private initWebStorage() {
    try {
      const storedProds = localStorage.getItem('digikart_products_v2');
      this.webProducts = storedProds ? JSON.parse(storedProds) : [...INITIAL_PRODUCTS];
      if (!storedProds) localStorage.setItem('digikart_products_v2', JSON.stringify(this.webProducts));

      const storedInvoices = localStorage.getItem('digikart_invoices_v2');
      this.webInvoices = storedInvoices ? JSON.parse(storedInvoices) : [];

      const storedCusts = localStorage.getItem('digikart_customers_v2');
      this.webCustomers = storedCusts ? JSON.parse(storedCusts) : [...INITIAL_CUSTOMERS];
      if (!storedCusts) localStorage.setItem('digikart_customers_v2', JSON.stringify(this.webCustomers));

      const storedShift = localStorage.getItem('digikart_current_shift_v2');
      this.webCurrentShift = storedShift ? JSON.parse(storedShift) : { ...INITIAL_SHIFT };
      if (!storedShift) localStorage.setItem('digikart_current_shift_v2', JSON.stringify(this.webCurrentShift));

      const storedHistory = localStorage.getItem('digikart_shift_history_v2');
      this.webShiftHistory = storedHistory ? JSON.parse(storedHistory) : [];

      const storedSettings = localStorage.getItem('digikart_settings_v2');
      this.webSettings = storedSettings ? JSON.parse(storedSettings) : { ...DEFAULT_SETTINGS };
      if (!storedSettings) localStorage.setItem('digikart_settings_v2', JSON.stringify(this.webSettings));
    } catch {
      this.webProducts = [...INITIAL_PRODUCTS];
      this.webCustomers = [...INITIAL_CUSTOMERS];
      this.webCurrentShift = { ...INITIAL_SHIFT };
      this.webSettings = { ...DEFAULT_SETTINGS };
    }
  }

  private async createNativeTables(): Promise<void> {
    if (!this.nativeDb) return;

    await this.nativeDb.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT,
        category TEXT,
        barcode TEXT UNIQUE,
        hsn TEXT,
        mrp REAL,
        purchaseRate REAL,
        sellingPrice REAL,
        gstRate REAL,
        stock INTEGER,
        unit TEXT,
        image TEXT,
        keywords TEXT
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoiceNo TEXT UNIQUE,
        date TEXT,
        customerId TEXT,
        customerName TEXT,
        customerPhone TEXT,
        customerGstin TEXT,
        isB2B INTEGER,
        isInterstate INTEGER,
        subtotal REAL,
        discount REAL,
        taxableAmount REAL,
        totalCgst REAL,
        totalSgst REAL,
        totalIgst REAL,
        grandTotal REAL,
        paymentMode TEXT,
        paymentRef TEXT,
        cashTendered REAL,
        changeDue REAL
      );

      CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY,
        invoiceId TEXT,
        productId TEXT,
        productName TEXT,
        hsn TEXT,
        quantity REAL,
        unit TEXT,
        unitPrice REAL,
        gstRate REAL,
        taxableAmount REAL,
        cgstAmount REAL,
        sgstAmount REAL,
        igstAmount REAL,
        totalAmount REAL
      );

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        email TEXT,
        gstin TEXT,
        address TEXT,
        totalPurchases REAL,
        pendingCredit REAL,
        lastVisit TEXT
      );

      CREATE TABLE IF NOT EXISTS register_shifts (
        id TEXT PRIMARY KEY,
        date TEXT,
        openedAt TEXT,
        closedAt TEXT,
        openedBy TEXT,
        openingCash REAL,
        cashSales REAL,
        gpaySales REAL,
        phonepeSales REAL,
        paytmSales REAL,
        bankSales REAL,
        creditSales REAL,
        otherSales REAL,
        totalExpenses REAL,
        expectedCash REAL,
        actualCash REAL,
        cashDifference REAL,
        status TEXT,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS shop_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        shopName TEXT,
        tagline TEXT,
        gstin TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        state TEXT,
        stateCode TEXT,
        receiptHeader TEXT,
        receiptFooter TEXT,
        currencySymbol TEXT,
        enableSound INTEGER
      );
    `);
  }

  private async seedNativeData(): Promise<void> {
    if (!this.nativeDb) return;

    const countRes = await this.nativeDb.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM products;'
    );

    if (!countRes || countRes.count === 0) {
      for (const p of INITIAL_PRODUCTS) {
        await this.nativeDb.runAsync(
          `INSERT INTO products (id, name, brand, category, barcode, hsn, mrp, purchaseRate, sellingPrice, gstRate, stock, unit, image, keywords)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            p.id,
            p.name,
            p.brand,
            p.category,
            p.barcode,
            p.hsn,
            p.mrp,
            p.purchaseRate || 0,
            p.sellingPrice,
            p.gstRate,
            p.stock,
            p.unit,
            p.image || '',
            JSON.stringify(p.keywords || []),
          ]
        );
      }
    }
  }

  // --- Products API ---
  public async getProducts(): Promise<Product[]> {
    await this.init();
    if (this.nativeDb) {
      const rows = await this.nativeDb.getAllAsync<any>('SELECT * FROM products ORDER BY name ASC;');
      return rows.map((r) => ({
        ...r,
        keywords: typeof r.keywords === 'string' ? JSON.parse(r.keywords || '[]') : r.keywords,
      }));
    }
    return [...this.webProducts];
  }

  public async saveProduct(product: Product): Promise<void> {
    await this.init();
    if (this.nativeDb) {
      await this.nativeDb.runAsync(
        `INSERT OR REPLACE INTO products (id, name, brand, category, barcode, hsn, mrp, purchaseRate, sellingPrice, gstRate, stock, unit, image, keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          product.id,
          product.name,
          product.brand,
          product.category,
          product.barcode,
          product.hsn,
          product.mrp,
          product.purchaseRate || 0,
          product.sellingPrice,
          product.gstRate,
          product.stock,
          product.unit,
          product.image || '',
          JSON.stringify(product.keywords || []),
        ]
      );
    } else {
      const idx = this.webProducts.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        this.webProducts[idx] = product;
      } else {
        this.webProducts.unshift(product);
      }
      try {
        localStorage.setItem('digikart_products_v2', JSON.stringify(this.webProducts));
      } catch {}
    }
  }

  public async updateStock(productId: string, qtyDeducted: number): Promise<void> {
    await this.init();
    const prod = this.webProducts.find((p) => p.id === productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - qtyDeducted);
      try {
        localStorage.setItem('digikart_products_v2', JSON.stringify(this.webProducts));
      } catch {}
    }
  }

  // --- Invoices & Shift Ledger Updates ---
  public async getNextInvoiceNumber(): Promise<string> {
    await this.init();
    const count = this.webInvoices.length + 1;
    return `000${count.toString().padStart(3, '0')}`;
  }

  public async createInvoice(invoice: Invoice): Promise<void> {
    await this.init();
    this.webInvoices.unshift(invoice);

    // Deduct stock for all items
    for (const item of invoice.items) {
      await this.updateStock(item.productId, item.quantity);
    }

    // Update Day Close Register Shift Account Breakdown
    const amount = invoice.grandTotal;
    switch (invoice.paymentMode) {
      case 'Cash':
        this.webCurrentShift.cashSales += amount;
        this.webCurrentShift.expectedCash += amount;
        break;
      case 'GPay':
        this.webCurrentShift.gpaySales += amount;
        break;
      case 'PhonePe':
        this.webCurrentShift.phonepeSales += amount;
        break;
      case 'Paytm':
        this.webCurrentShift.paytmSales += amount;
        break;
      case 'BankCard':
        this.webCurrentShift.bankSales += amount;
        break;
      case 'Credit':
        this.webCurrentShift.creditSales += amount;
        break;
      case 'Other':
      default:
        this.webCurrentShift.otherSales += amount;
        break;
    }

    // Update Customer purchases or credit balance
    if (invoice.customerId || invoice.customerPhone) {
      let cust = this.webCustomers.find(
        (c) => c.id === invoice.customerId || (invoice.customerPhone && c.phone === invoice.customerPhone)
      );

      if (cust) {
        cust.totalPurchases += invoice.grandTotal;
        if (invoice.paymentMode === 'Credit') {
          cust.pendingCredit += invoice.grandTotal;
        }
        cust.lastVisit = new Date().toLocaleDateString('en-IN');
      } else if (invoice.customerName && invoice.customerName !== 'Walk-in Customer') {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: invoice.customerName,
          phone: invoice.customerPhone || '',
          gstin: invoice.customerGstin,
          totalPurchases: invoice.grandTotal,
          pendingCredit: invoice.paymentMode === 'Credit' ? invoice.grandTotal : 0,
          lastVisit: new Date().toLocaleDateString('en-IN'),
        };
        this.webCustomers.unshift(newCust);
      }
    }

    try {
      localStorage.setItem('digikart_invoices_v2', JSON.stringify(this.webInvoices));
      localStorage.setItem('digikart_current_shift_v2', JSON.stringify(this.webCurrentShift));
      localStorage.setItem('digikart_customers_v2', JSON.stringify(this.webCustomers));
    } catch {}
  }

  public async getInvoices(): Promise<Invoice[]> {
    await this.init();
    return [...this.webInvoices];
  }

  // --- Customers API ---
  public async getCustomers(): Promise<Customer[]> {
    await this.init();
    return [...this.webCustomers];
  }

  public async saveCustomer(customer: Customer): Promise<void> {
    await this.init();
    const idx = this.webCustomers.findIndex((c) => c.id === customer.id);
    if (idx >= 0) {
      this.webCustomers[idx] = customer;
    } else {
      this.webCustomers.unshift(customer);
    }
    try {
      localStorage.setItem('digikart_customers_v2', JSON.stringify(this.webCustomers));
    } catch {}
  }

  public async recordCustomerPayment(payment: CustomerPayment): Promise<void> {
    await this.init();
    const cust = this.webCustomers.find((c) => c.id === payment.customerId);
    if (cust) {
      cust.pendingCredit = Math.max(0, cust.pendingCredit - payment.amount);
    }
    this.webPayments.unshift(payment);

    // Reflect cash or digital payment in current shift register
    if (payment.paymentMode === 'Cash') {
      this.webCurrentShift.cashSales += payment.amount;
      this.webCurrentShift.expectedCash += payment.amount;
    } else if (payment.paymentMode === 'GPay') {
      this.webCurrentShift.gpaySales += payment.amount;
    } else if (payment.paymentMode === 'PhonePe') {
      this.webCurrentShift.phonepeSales += payment.amount;
    } else if (payment.paymentMode === 'Paytm') {
      this.webCurrentShift.paytmSales += payment.amount;
    }

    try {
      localStorage.setItem('digikart_customers_v2', JSON.stringify(this.webCustomers));
      localStorage.setItem('digikart_current_shift_v2', JSON.stringify(this.webCurrentShift));
    } catch {}
  }

  // --- Day Close Register API ---
  public async getCurrentShift(): Promise<RegisterShift> {
    await this.init();
    return { ...this.webCurrentShift };
  }

  public async closeCurrentShift(actualCash: number, notes?: string): Promise<RegisterShift> {
    await this.init();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const closedShift: RegisterShift = {
      ...this.webCurrentShift,
      closedAt: timeStr,
      actualCash,
      cashDifference: actualCash - this.webCurrentShift.expectedCash,
      status: 'CLOSED',
      notes: notes || 'Day Closed successfully',
    };

    this.webShiftHistory.unshift(closedShift);

    // Start next fresh shift with the closing cash or default
    this.webCurrentShift = {
      id: `shift-${Date.now()}`,
      date: now.toLocaleDateString('en-IN'),
      openedAt: timeStr,
      openedBy: 'Admin / Cashier 1',
      openingCash: actualCash,
      cashSales: 0,
      gpaySales: 0,
      phonepeSales: 0,
      paytmSales: 0,
      bankSales: 0,
      creditSales: 0,
      otherSales: 0,
      totalExpenses: 0,
      expectedCash: actualCash,
      status: 'OPEN',
    };

    try {
      localStorage.setItem('digikart_shift_history_v2', JSON.stringify(this.webShiftHistory));
      localStorage.setItem('digikart_current_shift_v2', JSON.stringify(this.webCurrentShift));
    } catch {}

    return closedShift;
  }

  public async getShiftHistory(): Promise<RegisterShift[]> {
    await this.init();
    return [...this.webShiftHistory];
  }

  // --- Settings API ---
  public async getShopSettings(): Promise<ShopSettings> {
    await this.init();
    return { ...this.webSettings };
  }

  public async updateShopSettings(settings: ShopSettings): Promise<void> {
    await this.init();
    this.webSettings = { ...settings };
    try {
      localStorage.setItem('digikart_settings_v2', JSON.stringify(this.webSettings));
    } catch {}
  }
}

export const dbService = new DatabaseService();
