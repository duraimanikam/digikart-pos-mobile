# DigiKart POS - React Native Mobile POS Billing Application
> **Retail Billing Made Simple** • Offline-First • AI Photo Scan & Upload • WhatsApp Bill Sharing • Complete GST & Ledgers

Built with **React Native (Expo)**, tailored with the exact royal purple/indigo theme (`#4F46B8`) and exact layouts from the reference designs.

---

## 📱 All 20 Screens Implemented

### Image 1: Core POS & Photo Product Billing
1. **Home Screen (`HomeScreen.tsx`)**:
   - Header with DigiKart POS branding, subtitle, hamburger menu, and notification bell
   - 8 Action Tiles:
     - **Scan Product (Take Photo)** (highlighted card with camera icon)
     - **New Bill** (cart with active item count badge)
     - **Products** (cube icon)
     - **Customers** (people icon)
     - **Sales Reports** (bar-chart icon)
     - **Purchase** (bus/truck icon)
     - **Stock Report** (database/server icon)
     - **Settings** (gear icon)
   - Bottom navigation bar: `Home` (active), `Bills`, `Products`, `Reports`

2. **Take Photo / Scan Product (`ScanProductScreen.tsx`)**:
   - Viewfinder with glowing corner brackets and reticle: *"Align the product within the frame"*
   - Live photo capture and **Gallery Upload picker** (upload ANY product image from phone/PC)
   - Flash toggle, camera switch button, and real sample quick-switchers

3. **Auto Detect Name (`DetectingProductScreen.tsx`)**:
   - Photo preview container displaying captured or uploaded image
   - Animated progress bar (*"Identifying product..."*)
   - Detection card with thumbnail, product name, net weight, and **`✔ 98% match`** green pill badge
   - `Add to Bill` primary button and `Retake` outline button

4. **Confirm & Add (`ConfirmAddScreen.tsx`)**:
   - Product identity banner (thumbnail, title, unit)
   - Rate (₹) editable field (default: `120.00`)
   - Qty stepper `[- 1 +]`
   - Discount (₹) editable field
   - Live Total Amount calculation
   - `Cancel` and `Add Item` buttons

5. **Billing Screen / New Bill (`NewBillScreen.tsx`)**:
   - Search bar with instant camera and barcode scan buttons
   - Itemized bill list with images, unit, rate, stepper, line total, and red delete trash icon:
     - *Aachi Turmeric Powder 500 g* (₹120.00)
     - *Aavin Milk 1 Ltr* (₹68.00)
     - *Sunfeast Marie Biscuits 200 g* (₹30.00)
     - *Coca Cola 750 ml* (₹45.00)
   - Summary bar: `Items: 4`, `Total Qty: 4`, `Total Amount: ₹ 263.00`
   - `Clear` and `Proceed to Payment` buttons

6. **Product List (`ProductsListScreen.tsx`)**:
   - Header with search bar, barcode scan icon, and `+` add product button
   - Product cards with thumbnail, unit, price, and `Stock: 45` badge

7. **Product Master / Product Details (`ProductDetailsScreen.tsx`)**:
   - Photo capture / upload box with camera badge
   - Product Name, Barcode (with scan icon), Category dropdown (Spices), Unit (`500 g`), GST % (`5%`), Purchase Rate (`90.00`), Selling Rate (`120.00`), Opening Stock (`45`)
   - `Save Product` button

8. **Reports Dashboard (`SalesReportsScreen.tsx`)**:
   - Date picker banner (`15 Oct 2026`)
   - 4 KPI cards: `Total Sales: ₹ 25,680` (+12%), `Total Bills: 84` (+8%), `Cash Sales: ₹ 18,240`, `UPI / Card: ₹ 7,440`
   - Hourly sales volume bar chart (9AM, 11AM, 1PM, 3PM, 5PM, 7PM)

9. **Print Bill & WhatsApp Share (`BillPrintScreen.tsx`)**:
   - **WhatsApp Bill Share Card**: Enter/auto-fill customer phone number and tap `Send` to open WhatsApp with a formatted tax invoice
   - Thermal receipt paper layout: Store details, GSTIN, Bill No, date, item table (`S.No`, `Product`, `Qty`, `Rate`, `Amt`), `Total Amount: ₹ 263.00`, `Paid: ₹ 300.00`, `Balance: ₹ 37.00`, *"Thank You! Visit Again."*
   - Thermal Print and New Sale buttons

10. **Settings (`SettingsScreen.tsx`)**:
    - Shop Details, Manage Categories, Manage Units, Barcode Settings, Printer Settings, Backup & Restore, Cloud Sync (Optional), App Theme, About

---

### Image 2: Accounting, GST & Day Close
11. **Login Screen (`LoginScreen.tsx`)**:
    - DigiKart POS cart logo, Username: `admin`, Password field with show/hide eye toggle, Remember me, Forgot Password, `Sign In ->` button
12. **Daily Closing (`DailyClosingScreen.tsx`)**:
    - Cash drawer breakdown: Opening Cash (₹5,000), Cash Sales (₹18,240), UPI/Card (₹7,440), Credit Sales (₹2,580), Total Sales (₹28,260), Expenses, Expected Cash (₹22,230), Actual Cash input (22,200), **Difference: -30.00** in red, and `Close Day` lock button
13. **GST Reports (`GSTReportsScreen.tsx`)**:
    - Tabs: `Summary`, `GSTR-1` (active), `GSTR-3B`, `HSN Wise`
    - Date range: `01-10-2026` to `15-10-2026`
    - B2B Invoices (₹12,45,320.00), B2C Unregistered (₹8,90,420.00), Credit Notes (₹12,340.00), Total Turnover (₹21,23,400.00)
    - Tax Summary table for CGST, SGST, IGST, and Total with `View Details` and `Export Excel`
14. **Accounting Dashboard (`AccountsScreen.tsx`)**:
    - 6 KPI cards: Cash in Hand (₹22,200), Bank Balance (₹1,45,680), Receivables (₹2,36,450), Payables (₹12,300), Total Income (₹4,28,600), Total Expenses (₹1,85,420)
    - Recent transactions list with `+` and `-` badges
15. **Customer Ledger (`CustomerLedgerScreen.tsx`)**:
    - Customer banner (`Walk-in Customer`, phone: 9876543210), Opening Balance, Total Invoices, Total Receipts, Current Balance (₹4,450.00)
    - Ledger table: Date, Type, Ref No, Amount, Balance
    - `Add Receipt` and `New Invoice` buttons
16. **Supplier Ledger & Payment (`SupplierLedgerScreen.tsx`)**:
    - Supplier banner (`ABC Distributors`, phone: 9876501234), purchases & payments, current balance (₹25,740.00), ledger table, `Record Payment` and `New Purchase`
17. **Expense Voucher (`ExpenseVoucherScreen.tsx`)**:
    - Date, Voucher No (`EXP0045`), Category (`Electricity`), Account (`Electricity Expenses`), Amount (`₹1,250.00`), Payment Mode radios (`Cash`, `Bank`, `UPI`), Reference No, Notes
18. **Profit & Loss Report (`ProfitLossScreen.tsx`)**:
    - Date range, Income breakdown (Sales ₹28,260, Total ₹29,500), COGS (₹11,450), **Gross Profit: ₹18,050.00** in green, Expenses breakdown, **Net Profit: ₹6,460.00** in green
19. **Stock Movement & Valuation (`StockReportScreen.tsx`)**:
    - Tabs: `Stock Summary`, `Stock Movement`, `Low Stock`
    - Total Products: 486, Total Stock Value: ₹4,85,230.00, Low Stock Items: 24 (red badge)
    - Category wise values (Spices, Dairy, Beverages, Biscuits, Personal Care, Household, Others)
    - Low stock items list with current vs minimum threshold
20. **Backup & Restore (`BackupRestoreScreen.tsx`)**:
    - Create Local Backup, Restore from Backup, Cloud Sync toggle switch, Last Backup status with `Success` badge, and `Backup Now` button

---

## 🎨 Exact Color Palette (from Image 1)
- **Primary / Header Bar**: `#4F46B8` (Royal Indigo / Violet)
- **Primary Tint / Highlight**: `#EDEBFB` / `#F3F1FD`
- **Background**: `#F5F6FB` (Soft clean canvas)
- **Surface**: `#FFFFFF` (White cards with subtle border `#E2E8F0`)
- **Success**: `#10B981` (Badges: `#DCFCE7`, text `#166534`)
- **Danger**: `#EF4444` (Badges: `#FEE2E2`, text `#991B1B`)
- **WhatsApp**: `#25D366`

---

## 🚀 Running the App

### Location:
The app is available in your dedicated folder:
`d:\digikart-pos-mobile`

### Start Web Server:
```bash
cd d:\digikart-pos-mobile
npm run web
```
The web server is currently active and can be accessed at **`http://localhost:8082`**.

### Run on Android:
```bash
npm run android
```

### Run on iOS:
```bash
npm run ios
```

### Quick Screen Switcher:
Tap the floating **"All 20 Screens"** button in the bottom-right corner to jump instantly to any of the 20 screens!
