# Cecilia Clothing Shop - Complete Business Logic & Data Flow

## System Architecture Overview

This document details the complete backend logic, automatic calculations, and real-time data synchronization for the Cecilia clothing shop management system.

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

## 7. API Endpoints Summary

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
  category: String,
  buyingPrice: Number,
  sellingPrice: Number,
  quantity: Number,
  size: String,
  color: String,
  supplier: String,
  lowStockThreshold: Number (default: 5)
}
```

### Sale
```javascript
{
  item: ObjectId (ref: Inventory),
  itemName: String,
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

### Example: Recording a Sale

1. **User Action:** Employee records sale via form
2. **API Call:** POST /api/sales
3. **Backend Processing:**
   - Validates stock availability
   - Calculates profit
   - Creates sale record
   - Reduces inventory
   - Returns sale data
4. **Frontend Response:**
   - Shows success toast
   - Closes modal
   - Resets form
5. **Auto-Refresh (15 seconds):**
   - Dashboard fetches new data
   - Cards update with new totals
   - Recent sales table refreshes
   - Low stock alerts update if needed
6. **Charts Update:**
   - Sales trend includes new sale
   - Worker performance updates
   - Reports reflect new data

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
