# Cecilia Clothing Shop - Complete Business Logic & Data Flow

## System Architecture Overview

This document details the complete backend logic, automatic calculations, real-time data synchronization, and category-based inventory management for the Cecilia clothing shop management system.

**Last Updated:** April 2026
**Version:** 2.0 - Category-Based System

---

## 0. CATEGORY-BASED INVENTORY SYSTEM

### Category Structure

The system now organizes inventory by clothing categories:

**Categories:**
- Trousers (Subcategories: Jeans, Khaki, Official, Casual, New Arrival)
- T-Shirts (Subcategories: Polo, Round Neck, V-Neck, Graphic, New Arrival)
- Shirts (Subcategories: Formal, Casual, Denim, Linen, New Arrival)
- Dresses (Subcategories: Maxi, Mini, Midi, Cocktail, New Arrival)
- Jackets (Subcategories: Blazer, Bomber, Denim, Leather, New Arrival)
- Shoes (Subcategories: Sneakers, Formal, Casual, Boots, New Arrival)
- Accessories (Subcategories: Belts, Bags, Hats, Jewelry, New Arrival)

### Category Aggregation Logic

```javascript
// Stock by Category (GET /api/dashboard/category-summary)
const stockByCategory = await Inventory.aggregate([
  {
    $group: {
      _id: '$category',
      category: { $first: '$category' },
      totalItems: { $sum: '$quantity' },
      productCount: { $sum: 1 },
      totalValue: { $sum: { $multiply: ['$quantity', '$buyingPrice'] } },
      lowStockCount: {
        $sum: {
          $cond: [
            { $lte: ['$quantity', { $ifNull: ['$lowStockThreshold', 3] }] },
            1,
            0
          ]
        }
      }
    }
  }
]);
```

### Sales by Category

```javascript
// Monthly sales aggregation by category
const salesByCategory = await Sale.aggregate([
  { $match: { saleDate: { $gte: startOfMonth } } },
  {
    $group: {
      _id: '$category',
      category: { $first: '$category' },
      totalSales: { $sum: '$totalAmount' },
      totalProfit: { $sum: '$profit' },
      itemsSold: { $sum: '$quantity' }
    }
  }
]);
```

---

## 1. Sales Logic & Automatic Actions

### When a Sale is Recorded (POST /api/sales)

**Input:**
- itemId, quantity, paymentMethod, customerName

**Automatic Actions:**

1. **Stock Validation**
   - Checks if inventory.quantity >= requested quantity
   - Returns error if insufficient stock

2. **Profit Calculation**
   ```javascript
   profit = (sellingPrice - buyingPrice) * quantity
   totalAmount = sellingPrice * quantity
   ```

3. **Inventory Update**
   ```javascript
   inventory.quantity -= quantity
   inventory.save()
   ```

4. **Sale Record Created**
   - Stores: item, quantity, prices, profit, worker, payment method
   - Timestamps automatically added

5. **Low Stock Alert Trigger**
   - If quantity <= lowStockThreshold (default: 5)
   - Item appears in low stock alerts

---

## 2. Inventory Logic

### When Stock is Added (POST /api/inventory)

**Automatic Actions:**
- Creates new inventory record
- Calculates initial stock value: `quantity * buyingPrice`
- Sets status based on quantity

### When Stock is Updated (PUT /api/inventory/:id)

**Automatic Actions:**
- Recalculates stock value
- Updates low stock status
- Triggers alerts if needed

### Low Stock Detection

```javascript
// Query finds items where quantity <= threshold
$expr: { $lte: ['$quantity', { $ifNull: ['$lowStockThreshold', 5] }] }
```

---

## 3. Expense Logic

### When Expense is Added (POST /api/expenses)

**Automatic Actions:**
- Records expense with category, amount, payment method
- Links to user who added it
- Automatically included in profit calculations

---

## 4. Net Profit Calculation

**Formula:**
```javascript
netProfit = grossProfit - totalExpenses
```

**Where:**
- `grossProfit` = Sum of all sale profits
- `totalExpenses` = Sum of all expenses

**Auto-Updated In:**
- Dashboard cards
- Reports page
- Analytics charts

---

## 5. Worker Performance Tracking

### Automatic Tracking

Every sale automatically:
- Records which worker made the sale
- Calculates worker's total sales
- Tracks items sold by worker
- Updates performance metrics

### Performance Endpoints

**GET /api/workers/:id/performance**
Returns:
- Today's sales, profit, items, count
- Weekly sales, profit, items, count
- All-time sales, profit, items, count

---

## 6. Real-Time Dashboard Synchronization

### Auto-Refresh Mechanism

**Dashboard Data Hook:**
```javascript
useDashboardData(apiFunction)
// Refreshes every 15 seconds
```

**Sales Data Hook:**
```javascript
useSalesData(apiFunction, dependencies)
// Refreshes every 30 seconds
```

**Inventory Data Hook:**
```javascript
useInventoryData(apiFunction)
// Refreshes every 60 seconds
```

### Dashboard Endpoint (GET /api/dashboard)

Returns comprehensive data:
```javascript
{
  today: { sales, profit, items, transactions, expenses },
  weekly: { sales, profit, items, transactions },
  monthly: { sales, profit, items, transactions, expenses },
  allTime: { sales, profit, items, transactions, netProfit },
  inventory: { totalProducts, totalStock, totalValue },
  lowStockItems: [...],
  recentSales: [...],
  workers: count
}
```

---

## 7. NOTIFICATION & EMAIL SYSTEM

### Notification Model

```javascript
{
  type: 'low_stock' | 'sale' | 'expense' | 'worker',
  message: String,
  relatedItem: ObjectId,
  relatedModel: String,
  isRead: Boolean (default: false),
  createdAt: Date
}
```

### Notification Triggers

**Low Stock Notification:**
- Triggered when: `quantity <= lowStockThreshold`
- Only triggers when crossing threshold (prevents spam)
- Creates in-app notification
- Sends email if enabled (max 1 per hour)

**Sale Notification:**
- Triggered on every sale
- Includes: item name, quantity, total amount
- Shows in notification center

**Expense Notification:**
- Triggered on expense creation
- Includes: expense title, amount
- Admin receives notification

**Worker Notification:**
- Triggered when new worker created
- Includes: worker name, role

### Email Automation (Cron Jobs)

**Weekly Report Email:**
- Schedule: Every Monday at 8 AM
- Content:
  - Total sales this week
  - Total profit
  - Total expenses
  - Net profit
  - Best selling items
  - Worker performance

**Monthly Report Email:**
- Schedule: 1st of each month at 8 AM
- Content:
  - Monthly sales summary
  - Profit analysis
  - Growth comparison
  - Top categories
  - Worker rankings
  - Stock status overview

**Low Stock Email:**
- Triggered: When items fall below threshold
- Rate limit: Max 1 email per hour
- Content:
  - All low stock items grouped by category
  - Current quantities
  - Recommended actions

### Email Service Logic

```javascript
// Rate limiting for low stock emails
const lastSent = await Settings.findOne({ key: 'lastLowStockEmail' });
if (lastSent && Date.now() - lastSent.value < 3600000) {
  return; // Don't send if less than 1 hour
}
```

---

## 8. CENTRALIZED SERVICES

### Stock Service (stockService.js)

**Purpose:** Centralized stock management to prevent inconsistencies

**Functions:**
- `updateStock(itemId, newQuantity, actionType, userId)`
- `handleLowStock(item)`
- `calculateStockMetrics()`
- `validateStockForSale(itemId, requestedQuantity)`
- `deductStock(itemId, quantity, saleId)`

**Benefits:**
- Single source of truth for stock operations
- Prevents overselling
- Automatic notifications
- Consistent status tracking

### Notification Service (notificationService.js)

**Purpose:** Centralized notification creation

**Functions:**
- `createNotification(type, message, relatedItem, relatedModel)`
- `createSaleNotification(sale)`
- `createExpenseNotification(expense)`
- `createWorkerNotification(worker)`

**Chain Reaction:**
```
Action → Service → Notification → Email (if enabled) → Dashboard Update
```

---

## 9. SETTINGS & SESSION MANAGEMENT

### Active Sessions Tracking

**Session Data:**
```javascript
{
  userId: ObjectId,
  device: String,
  browser: String,
  os: String,
  location: String,
  ip: String,
  startTime: Date,
  lastActivity: Date,
  isActive: Boolean,
  isCurrent: Boolean
}
```

### Notification Preferences

**User Preferences:**
```javascript
{
  salesAlerts: Boolean,
  lowStockAlerts: Boolean,
  expenseAlerts: Boolean,
  dailyReports: Boolean,
  weeklyReports: Boolean,
  monthlyReports: Boolean,
  emailNotifications: Boolean,
  inAppNotifications: Boolean
}
```

**Behavior:**
- Toggles save instantly to backend
- Preferences checked before sending notifications
- Email preferences control email automation
- In-app preferences control notification center

---

## 10. API Endpoints Summary

### Authentication
```
POST   /api/auth/login
POST   /api/auth/register (first-time admin setup)
GET    /api/auth/profile
PUT    /api/auth/profile
```

### Dashboard
```
GET    /api/dashboard              // Full dashboard data
GET    /api/dashboard/stats        // Quick stats (lightweight)
```

### Inventory
```
GET    /api/inventory
POST   /api/inventory
PUT    /api/inventory/:id
DELETE /api/inventory/:id
GET    /api/inventory/alerts/low-stock
```

### Sales
```
GET    /api/sales
POST   /api/sales
DELETE /api/sales/:id              // Admin only
POST   /api/sales/:id/refund       // Admin only
GET    /api/sales/today
GET    /api/sales/stats
```

### Expenses
```
GET    /api/expenses
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/summary
```

### Workers
```
GET    /api/workers                // Admin only
POST   /api/workers                // Admin only
PUT    /api/workers/:id            // Admin only
DELETE /api/workers/:id            // Admin only
GET    /api/workers/:id/performance
```

### Reports
```
GET    /api/reports/profit-loss
GET    /api/reports/best-sellers
GET    /api/reports/comprehensive
```

### Notifications
```
GET    /api/notifications
GET    /api/notifications/stats
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
DELETE /api/notifications/:id
```

### Category Analytics
```
GET    /api/dashboard/category-summary
GET    /api/dashboard/best-category
```

---

## 8. Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'employee',
  phone: String,
  isActive: Boolean (default: true)
}
```

### Inventory
```javascript
{
  itemName: String,
  category: String,  // Trousers, T-Shirts, Shirts, Dresses, Jackets, Shoes, Accessories
  subcategory: String,  // Jeans, Khaki, Formal, etc.
  buyingPrice: Number,
  sellingPrice: Number,
  quantity: Number,
  size: String,
  color: String,
  supplier: String,
  lowStockThreshold: Number (default: 5)
}
```

### Notification
```javascript
{
  type: String,  // low_stock, sale, expense, worker
  message: String,
  relatedItem: ObjectId,
  relatedModel: String,
  isRead: Boolean (default: false),
  createdAt: Date
}
```

### Settings
```javascript
{
  key: String,
  value: Mixed,
  updatedAt: Date
}
```

### Sale
```javascript
{
  item: ObjectId (ref: Inventory),
  itemName: String,
  category: String,  // Added for category tracking
  subcategory: String,  // Added for subcategory tracking
  quantity: Number,
  sellingPrice: Number,
  buyingPrice: Number,
  totalAmount: Number,
  profit: Number,
  worker: ObjectId (ref: User),
  workerName: String,
  paymentMethod: String,
  customerName: String,
  status: 'completed' | 'refunded',
  refundReason: String,
  refundDate: Date,
  saleDate: Date (auto)
}
```

### Expense
```javascript
{
  title: String,
  category: String,
  amount: Number,
  paymentMethod: String,
  description: String,
  expenseDate: Date,
  addedBy: ObjectId (ref: User)
}
```

---

## 9. Role-Based Access Control

### Admin Access
- Full dashboard with all stats
- Inventory CRUD
- All sales data
- Expenses management
- Worker management
- Reports & analytics
- Settings

### Employee Access
- Personal dashboard (own sales only)
- Record sales
- View inventory (read-only)
- Own sales history
- NO access to: profits, expenses, workers, reports

### Middleware Protection
```javascript
// Route protection
protect                     // Requires authentication
authorize('admin')          // Requires admin role
```

---

## 10. Error Handling & Validation

### Stock Validation
```javascript
if (inventory.quantity < quantity) {
  return res.status(400).json({ 
    message: 'Insufficient stock' 
  });
}
```

### Input Validation
- Required fields checked
- Negative values prevented
- Duplicate emails prevented
- Password minimum length (6 chars)

### Friendly Error Messages
- "Insufficient stock"
- "Item not found"
- "Worker already exists"
- "Password must be at least 6 characters"

---

## 11. Real-Time Update Flow

### Example: Recording a Sale (Updated with Categories & Notifications)

1. **User Action:** Employee records sale via form
   - Selects category first
   - Selects item from filtered list
   - Enters quantity

2. **API Call:** POST /api/sales

3. **Backend Processing:**
   - Validates stock availability using `stockService.validateStockForSale()`
   - Calculates profit
   - Creates sale record with category & subcategory
   - Deducts inventory using `stockService.deductStock()`
   - Checks for low stock using `stockService.handleLowStock()`
   - Creates notification using `notificationService.createSaleNotification()`
   - Triggers low stock notification if threshold crossed
   - Returns sale data

4. **Frontend Response:**
   - Shows success toast
   - Closes modal
   - Resets form
   - Invalidates queries for dashboard, inventory, reports

5. **Auto-Refresh (15 seconds):**
   - Dashboard fetches new data
   - Category cards update with new totals
   - Recent sales table refreshes
   - Low stock alerts update if needed
   - Stock distribution chart updates

6. **Notifications:**
   - In-app notification created
   - If low stock: Email sent (rate limited to 1/hour)
   - Notification bell count updates

7. **Charts Update:**
   - Sales trend includes new sale
   - Category performance updates
   - Worker performance updates
   - Reports reflect new data

### Example: Stock Update Chain Reaction

```
Stock Updated
    ↓
stockService.updateStock()
    ↓
Check if low stock threshold crossed
    ↓
If YES → Create notification
    ↓
If YES → Check if email needed (rate limit)
    ↓
If YES → Send email with all low stock items
    ↓
Update dashboard metrics
    ↓
Update category summary
    ↓
Frontend auto-refreshes
```

---

## 12. Toast Notifications

All actions show user feedback:
- "Sale recorded successfully"
- "Item added successfully"
- "Stock updated"
- "Expense recorded"
- "Worker created"
- "Password reset successfully"

Error toasts:
- "Insufficient stock"
- "Failed to load data"
- "Operation failed"

---

## 13. Data Synchronization Guarantee

**Every page stays synchronized because:**

1. **Auto-refresh hooks** poll data at intervals
2. **Database is single source of truth**
3. **All calculations done server-side**
4. **Actions trigger immediate database updates**
5. **Frontend re-fetches after mutations**
6. **No manual refresh needed**

---

## 14. Performance Optimizations

- **Aggregation pipelines** for complex queries
- **Population** for related data
- **Indexing** on frequently queried fields
- **Pagination** ready for large datasets
- **Lightweight endpoints** for frequent polling

---

## 15. Security Features

- JWT authentication
- Password hashing with bcrypt
- Role-based authorization
- Protected API routes
- Input validation
- CORS configured
- Environment variables for secrets

---

This system operates as a **real-time business management SaaS product** where all pages remain synchronized automatically without manual intervention.

---

## 17. NEW FEATURES (Version 2.0)

### Category-Based Inventory
- All inventory organized by clothing categories
- Subcategory filtering within categories
- Category-first sales workflow
- Stock distribution analytics
- Category performance tracking
- Best selling category identification

### Premium UI/UX
- Category cards with live stock counts
- Stock status badges (In Stock, Low Stock, Out of Stock)
- Hover animations and smooth transitions
- Responsive design (mobile + desktop)
- Skeleton loading states
- Empty state handling
- Toast notifications

### Automated Notifications
- Real-time in-app notifications
- Low stock email alerts
- Weekly report emails (Monday 8 AM)
- Monthly report emails (1st of month)
- Beautiful HTML email templates
- Smart spam prevention

### Session Management
- View all active sessions
- Device and browser tracking
- Session termination
- Activity timeline
- Security monitoring

### Settings Page
- Active sessions control
- Notification preferences toggles
- Profile management
- Real-time preference updates
- Email channel configuration

### Centralized Services
- stockService.js for stock operations
- notificationService.js for notifications
- emailService.js for email automation
- cronJobs.js for scheduled tasks
- Chain reaction updates

### System Synchronization
- One action updates everything
- Sale → Stock → Notifications → Dashboard
- Real-time metrics calculation
- Automatic low stock detection
- Overselling prevention

---

**Document Version:** 2.0  
**Last Updated:** April 2026  
**Maintained By:** Cecilia Boutique Management Team
