export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  barcode: string;
  hsn: string;
  mrp: number;
  purchaseRate?: number;
  sellingPrice: number;
  gstRate: number; // 0, 5, 12, 18, 28
  stock: number;
  unit: string; // '500 g', '1 Ltr', '200 g', '750 ml', 'pcs', 'kg'
  image?: string;
  keywords: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercentage: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
}

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Card'
  | 'GPay'
  | 'PhonePe'
  | 'Paytm'
  | 'BankCard'
  | 'Credit'
  | 'Other';

export interface VisionMatchCandidate {
  product: Product;
  confidenceScore: number;
  matchedKeywords?: string[];
}

export interface PhotoRecognitionResult {
  detectedName: string;
  extractedBrand: string;
  suggestedGstRate: number;
  suggestedHsn: string;
  suggestedCategory: string;
  extractedText: string;
  bestMatch?: VisionMatchCandidate;
  otherCandidates: VisionMatchCandidate[];
  isNewProduct: boolean;
  imageUri?: string;
  confidence?: number;
  matchedName?: string;
  product?: Product;
}

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  productId: string;
  productName: string;
  hsn: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstRate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string; // ISO string
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  isB2B: boolean;
  isInterstate: boolean;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  grandTotal: number;
  paymentMode: PaymentMethod;
  paymentRef?: string;
  cashTendered?: number;
  changeDue?: number;
  items: InvoiceItem[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  totalPurchases: number;
  pendingCredit: number; // Khata balance
  lastVisit: string;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  paymentMode: PaymentMethod;
  referenceNo?: string;
  notes?: string;
}

export interface RegisterShift {
  id: string;
  date: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  openingCash: number;
  cashSales: number;
  gpaySales: number;
  phonepeSales: number;
  paytmSales: number;
  bankSales: number;
  creditSales: number;
  otherSales: number;
  totalExpenses: number;
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  stateCode: string;
  receiptHeader: string;
  receiptFooter: string;
  currencySymbol: string;
  enableSound: boolean;
}

export interface UserSession {
  userId: string;
  userName: string;
  role: 'Admin' | 'Cashier' | 'Manager';
  counter: string;
  isLoggedIn: boolean;
  shiftId?: string;
}
