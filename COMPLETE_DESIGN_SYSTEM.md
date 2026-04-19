# Cecilia Boutique Management System - Complete Design System & Implementation Prompt

## 🎨 DESIGN SYSTEM

### Color Palette
```
Primary Background: #FFFFFF (White)
Primary Beige: #D6C2A1 (Main accent color)
Accent Beige: #B89B72 (Secondary accent)
Light Card Beige: #F5EFE6 (Card backgrounds)
Text Dark: #2E2E2E (Primary text)
Text Gray: #6B7280 (Secondary text)
Success Green: #10B981
Warning Orange: #F59E0B
Error Red: #EF4444
Info Blue: #3B82F6
```

### Typography
- Font Family: System fonts (Inter, SF Pro, Segoe UI)
- Headings: Bold (700)
- Subheadings: Semibold (600)
- Body: Regular (400)
- Small text: 12-14px
- Medium text: 14-16px
- Large text: 18-24px
- XL text: 24-32px
- XXL text: 32-48px

### Spacing System
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### Border Radius
- Small: 8px (rounded-lg)
- Medium: 12px (rounded-xl)
- Large: 16px (rounded-2xl)
- XL: 24px (rounded-3xl)
- Full: 9999px (rounded-full)

### Shadows
- Small: 0 1px 2px rgba(0,0,0,0.05)
- Medium: 0 4px 6px rgba(0,0,0,0.07)
- Large: 0 10px 15px rgba(0,0,0,0.1)
- XL: 0 20px 25px rgba(0,0,0,0.15)

### Icons
- Library: lucide-react ONLY (no emojis)
- Size system: 16px, 18px, 20px, 24px, 28px, 32px, 48px, 64px

---

## 📱 PAGE-BY-PAGE IMPLEMENTATION PROMPTS

### 1. LOGIN PAGE

**Purpose:** User authentication with role-based access

**Layout:**
- Centered card on gradient background
- Logo at top
- Email & password inputs
- Login button
- "Forgot password?" link
- First-time admin setup option

**Colors:**
- Background: Gradient from #F5EFE6 to #FFFFFF
- Card: #FFFFFF with shadow-lg
- Primary button: #D6C2A1 background, #2E2E2E text
- Inputs: #FFFFFF background, #E5E7EB border

**Components:**
- Logo (centered, 80x80px)
- Page title: "Welcome to Cecilia Boutique"
- Subtitle: "Manage your shop with elegance"
- Email input with Mail icon
- Password input with Lock icon + show/hide toggle
- Login button with arrow icon
- Loading spinner during authentication

**Functionality:**
- Email/password validation
- JWT token storage
- Role detection (admin/employee)
- Redirect to appropriate dashboard
- Error toast notifications
- Remember me option

**Responsive:**
- Mobile: Full-width card, 16px padding
- Desktop: Max-width 400px, centered

---

### 2. ADMIN DASHBOARD

**Purpose:** Central hub for shop management with real-time analytics

**Layout Structure:**
```
Header Section
├── Welcome greeting with time-based message
├── User avatar & name
└── Last updated timestamp

Stats Cards Grid (4 columns)
├── Today's Sales (amount + trend %)
├── Total Profit (amount + trend %)
├── Total Stock (items count)
└── Low Stock Alerts (count with warning)

Category Stock Overview (8 cards)
├── All Stock, Trousers, T-Shirts, Shirts
├── Dresses, Jackets, Shoes, Accessories
└── Each shows: icon, total items, low stock count

Charts Section (2 columns)
├── Sales Analytics (area chart, 2/3 width)
│   ├── Period selector (Today/Week/Month)
│   └── Gradient area with beige color
└── Stock Distribution (pie chart, 1/3 width)
    ├── Category breakdown
    └── Legend with icons

Best Sellers Card
├── Top 3 selling items
├── Shows: name, quantity sold, revenue
└── Trophy icons for ranking

Quick Actions (5 buttons)
├── Record Sale (green)
├── Add Stock (blue)
├── Add Worker (purple)
├── Add Expense (orange)
└── View Reports (beige)

Main Grid (2 columns)
├── Recent Sales Table (2/3 width)
│   ├── 10 most recent sales
│   ├── Columns: Item, Qty, Amount, Date
│   └── Scrollable
└── Low Stock Alerts (1/3 width)
    ├── Grouped by category
    ├── Item name + quantity
    └── Category headers with icons
```

**Colors:**
- Cards: #FFFFFF with border #F5EFE6
- Hover: Shadow-xl with -translate-y-1
- Stats cards: Color-coded icons
  - Sales: Green (#10B981)
  - Profit: Blue (#3B82F6)
  - Stock: Beige (#D6C2A1)
  - Alerts: Orange (#F59E0B)

**Charts:**
- Sales chart: Area with gradient fill
  - Stroke: #D6C2A1
  - Fill: Gradient from #D6C2A1 (opacity 0.3) to transparent
- Pie chart: Category colors
  - Trousers: #D6C2A1
  - T-Shirts: #B89B72
  - Shirts: #8B7355
  - Dresses: #A0522D
  - Jackets: #CD853F
  - Shoes: #DEB887
  - Accessories: #F5DEB3

**Real-Time Features:**
- Auto-refresh every 15 seconds
- Live trend calculations
- Category stock updates
- Low stock detection

**Icons Used:**
- DollarSign, TrendingUp, Package, AlertTriangle
- Users, ShoppingCart, Plus, ArrowUpRight
- ArrowDownRight, Clock, Star, Wallet
- FileText, Briefcase, Shirt, Crown
- Footprints, Layers

---

### 3. EMPLOYEE DASHBOARD

**Purpose:** Personal sales tracking and quick actions

**Layout Structure:**
```
Welcome Header
├── User greeting with name
├── User avatar (initials in circle)
└── Role badge

Summary Cards (4 columns)
├── Sales Today (amount + count)
├── Items Sold (quantity)
├── Commission (if applicable)
└── Performance (rating)

Quick Stock View (8 category cards)
├── Same as admin but read-only
├── Shows stock availability
└── Low stock warnings

Quick Actions (3 buttons)
├── Record Sale (primary)
├── View Inventory (secondary)
└── My Sales History (secondary)

Recent Sales Table
├── Employee's sales only
├── Last 10 transactions
└── Export option
```

**Differences from Admin:**
- No profit data visible
- No expense access
- No worker management
- No comprehensive reports
- Personal sales only
- Simplified metrics

**Colors:**
- Same boutique theme
- Less prominent stats
- Focus on sales actions

---

### 4. INVENTORY PAGE (Premium SaaS Design)

**Purpose:** Complete stock management with category-based organization

**Layout Structure:**
```
Page Header
├── Title: "Inventory Management"
├── Subtitle: "Organize and track stock by categories"
└── Action buttons (Filters, Export, Alerts, Add Stock)

Sticky Search Bar
├── Search input with icon
├── Placeholder: "Search [category]..."
└── Clear button when typing

Category Cards (8 cards in grid)
├── All Stock, Trousers, T-Shirts, Shirts
├── Dresses, Jackets, Shoes, Accessories
├── Each card shows:
│   ├── Icon (24px)
│   ├── Category name
│   ├── Total items count
│   ├── Low stock badge (if any)
│   └── Active state highlighting
└── Hover: Lift animation + shadow

Subcategory Pills (when category selected)
├── "All" pill
├── Category-specific subcategories
│   └── Trousers: Jeans, Khaki, Official, Casual, New Arrival
├── Active pill: Beige background
└── Inactive: Gray background

Advanced Filters (collapsible)
├── Status filter (In Stock/Low/Out)
├── Size filter (XS-XXL)
└── Clear filters button

Results Count
└── "Showing X items in [Category]"

Inventory Grid (responsive cards)
├── Desktop: 4 columns
├── Tablet: 3 columns
├── Mobile: 2 columns
└── Each card:
    ├── Header
    │   ├── Item name (bold)
    │   ├── Category badge
    │   ├── Subcategory badge
    │   └── Status badge (color-coded)
    ├── Details Grid (2x2)
    │   ├── Quantity (large number)
    │   ├── Selling Price
    │   ├── Size (if applicable)
    │   └── Color (if applicable)
    ├── Profit Section
    │   └── "Est. Profit: KSh X,XXX"
    └── Action Bar
        ├── Left: View, History icons
        └── Right: Restock, Edit, Delete icons

Empty State (if no items)
├── Large Package icon (64px, gray)
├── "No items found" heading
├── Contextual message
└── "Add First Item" button
```

**Status Badges:**
- In Stock: Green (#10B981) background, green text
- Low Stock: Orange (#F59E0B) background, orange text
- Out of Stock: Red (#EF4444) background, red text

**Card Interactions:**
- Hover: -translate-y-1, shadow-xl
- Click action icons: Color change
- Active category: Border-primary, bg-primary-light

**Modal - Add/Edit Item:**
```
Header: "Add New Stock" / "Edit Item"
Form Fields (2 columns):
├── Item Name * (full width)
├── Category * (dropdown)
├── Subcategory (dropdown, dynamic)
├── Quantity * (number input)
├── Size (dropdown: XS-XXL)
├── Buying Price * (KSh)
├── Selling Price * (KSh)
├── Color (text input)
├── Supplier (text input)
└── Low Stock Threshold (number)

Footer: Cancel + Save buttons
```

**Modal - Stock History:**
```
Header: "Stock History" with History icon
Item info card
Timeline:
├── Date/time stamps
├── Action type (Created/Updated/Restocked)
├── Quantity changed
└── User who made change
```

**Export Feature:**
- CSV format
- Filename: inventory-[category]-[date].csv
- Includes all visible fields
- Loading state during export

---

### 5. SALES PAGE

**Purpose:** Record and track sales with category-first workflow

**Layout Structure:**
```
Page Header
├── Title: "Sales Management"
├── Stats cards (Today's sales, Total revenue)
└── "Record Sale" button

Filters Bar
├── Date range selector
├── Worker filter
├── Payment method filter
└── Search input

Sales Table
├── Columns: Date, Item, Category, Qty, Amount, Payment, Worker
├── Sortable headers
├── Pagination
└── Actions: View receipt, Refund (admin)

Record Sale Modal (Category-First Flow)
Step 1: Select Category
├── 8 category buttons with icons
├── Grid: 4 columns
├── Active: Beige border + background
└── Click filters items

Step 2: Select Item
├── Dropdown shows only selected category items
├── Shows: Name, Price, Available qty
├── Includes subcategory info
└── Warning if no items available

Step 3: Enter Details
├── Quantity (max = available stock)
├── Customer name (optional)
├── Payment method (Cash/M-Pesa/Card/Bank)
├── Notes (optional)
└── Live total calculation

Step 4: Confirm & Print
├── Sale summary
├── Success message
└── Print receipt option
```

**Category Icons:**
- Trousers: Briefcase
- T-Shirts: Shirt
- Shirts: Shirt
- Dresses: Crown
- Jackets: Layers
- Shoes: Footprints
- Accessories: Star

**Payment Method Icons:**
- Cash: DollarSign
- M-Pesa: Smartphone
- Card: CreditCard
- Bank Transfer: Building

**Validation:**
- Stock availability check
- Quantity > 0
- Required fields
- Real-time total calculation

**Receipt Format:**
```
Cecilia Boutique
━━━━━━━━━━━━━━━
Receipt #: XXXX
Date: DD/MM/YYYY
Time: HH:MM

Item: [Name]
Category: [Category]
Qty: X @ KSh X,XXX
Total: KSh X,XXX

Payment: [Method]
Customer: [Name]

Thank you!
━━━━━━━━━━━━━━━
```

---

### 6. EXPENSES PAGE

**Purpose:** Track and manage business expenses

**Layout Structure:**
```
Page Header
├── Title: "Expense Management"
├── Total expenses this month
└── "Add Expense" button

Summary Cards (3 columns)
├── Total Expenses (month)
├── Average Daily
└── Highest Category

Expense Form Modal
├── Title *
├── Category (dropdown: Rent/Utilities/Suppliers/Marketing/Other)
├── Amount * (KSh)
├── Payment Method
├── Date
├── Description (textarea)
├── Receipt upload (optional)
└── Save button

Expenses Table
├── Date, Title, Category, Amount, Payment, Actions
├── Filter by category
├── Filter by date range
└── Edit/Delete buttons

Charts
├── Expense trend (line chart)
└── Category breakdown (pie chart)
```

**Categories:**
- Rent
- Utilities
- Suppliers
- Marketing
- Maintenance
- Salaries
- Transportation
- Other

---

### 7. WORKERS PAGE

**Purpose:** Manage employees and track performance

**Layout Structure:**
```
Page Header
├── Title: "Worker Management"
├── Total workers count
└── "Add Worker" button

Workers Grid (cards)
├── Each card shows:
│   ├── Avatar (initials)
│   ├── Name
│   ├── Role badge
│   ├── Status (Active/Inactive)
│   ├── Today's sales
│   ├── Monthly performance
│   └── Actions: View, Edit, Delete

Add Worker Modal
├── Name *
├── Email *
├── Phone
├── Role (Employee/Manager)
├── Password *
├── Confirm Password *
└── Create button

Performance View
├── Worker stats
├── Sales history
├── Items sold
├── Revenue generated
└── Performance trend chart
```

**Worker Stats:**
- Today's sales
- Weekly sales
- Monthly sales
- All-time sales
- Items sold count
- Average sale value

---

### 8. REPORTS PAGE

**Purpose:** Comprehensive analytics and business insights

**Layout Structure:**
```
Page Header
├── Title: "Reports & Analytics"
├── Date range selector
└── Export report button

Summary Stats (4 cards)
├── Total Revenue
├── Total Profit
├── Total Expenses
└── Net Profit (with trend %)

Tabs Navigation
├── Overview
├── Sales Report
├── Inventory Report
└── Worker Performance

Overview Tab
├── Profit & Loss Trend (area chart)
├── Category Performance (bar chart)
│   ├── Best category badge
│   ├── Revenue bars
│   ├── Profit bars
│   └── Stock status below
├── Expense Breakdown (pie chart)
└── Top Products table

Sales Report Tab
├── Sales by date (line chart)
├── Payment method breakdown
├── Hourly sales distribution
└── Sales comparison (period vs period)

Inventory Report Tab
├── Stock value over time
├── Category stock levels
├── Low stock items
└── Stock turnover rate

Worker Performance Tab
├── Worker rankings
├── Sales per worker
├── Performance trends
└── Commission calculations
```

**Chart Colors:**
- Revenue: Green (#10B981)
- Expenses: Red (#EF4444)
- Profit: Beige (#D6C2A1)
- Categories: Boutique palette

**Export Options:**
- PDF report
- Excel/CSV
- Date range selection
- Include/exclude sections

---

### 9. SETTINGS PAGE

**Purpose:** Account management, sessions, notifications, and appearance

**Layout Structure:**
```
Page Header
├── Title: "Settings"
└── Subtitle: "Manage your shop, account, and notifications"

Tab Navigation (4 tabs)
├── General (User icon)
├── Sessions (Shield icon)
├── Notifications (Bell icon)
└── Appearance (Palette icon)

General Tab
├── Profile & Shop Information Card
│   ├── Logo upload (with preview)
│   │   ├── Current logo or placeholder
│   │   └── Camera icon overlay
│   ├── Shop Owner Name *
│   ├── Shop Name *
│   ├── Email Address * (validated)
│   ├── Phone Number (with icon)
│   └── Save Changes button
│
├── Change Password Card
│   ├── Current Password *
│   ├── New Password * (min 6 chars)
│   ├── Confirm New Password *
│   └── Update Password button

Sessions Tab
├── Current Session Card (highlighted)
│   ├── Device/browser icon
│   ├── Location
│   ├── IP address
│   ├── Started time
│   ├── Last activity
│   └── Active badge (green)
│
├── Other Active Sessions
│   ├── Session cards grid
│   ├── Device info
│   ├── Location
│   ├── Last active
│   └── Log Out button
│
├── Log Out All button (red)
│
└── Recent Activity Timeline
    ├── Activity icons (color-coded)
    ├── Action description
    ├── Timestamp
    └── Details

Notifications Tab
├── Alert Preferences
│   ├── Sales Alerts (toggle)
│   ├── Low Stock Alerts (toggle)
│   ├── Expense Alerts (toggle)
│   ├── Daily Reports (toggle)
│   ├── Weekly Reports (toggle)
│   └── Monthly Reports (toggle)
│
└── Notification Channels
    ├── Email Notifications (toggle)
    └── In-App Notifications (toggle)

Appearance Tab
├── Theme Settings Card
│   ├── Dark Mode Toggle
│   │   ├── Sun/Moon icons
│   │   └── Smooth transition
│   │
│   ├── Primary Color Picker
│   │   ├── Color input
│   │   ├── Hex code display
│   │   └── Preset buttons:
│   │       #D6C2A1, #B89B72, #8B7355
│   │       #A0522D, #CD853F
│   │
│   ├── Accent Color Picker
│   │   ├── Color input
│   │   ├── Hex code display
│   │   └── Preset buttons:
│   │       #B89B72, #D6C2A1, #F5EFE6
│   │       #DEB887, #F4A460
│   │
│   └── Live Preview Section
│       ├── Primary button
│       ├── Badge example
│       └── Outline button
│
└── Save Theme button
```

**Toggle Switch Design:**
```
Container: 56px wide, 28px tall
Active: #D6C2A1 background
Inactive: #D1D5DB background
Thumb: 24px white circle
Transition: transform 0.3s
Active position: translate-x-7
Inactive position: translate-x-0
```

**Validation:**
- Required fields highlighted
- Email format check
- Password strength check
- File size limit (2MB for logo)
- Phone format validation

---

## 🔧 TECHNICAL SPECIFICATIONS

### Component Patterns

**Card Component:**
```jsx
<div className="card p-6 bg-white rounded-2xl border border-[#F5EFE6] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
  {content}
</div>
```

**Button Primary:**
```jsx
<button className="px-6 py-3 bg-[#D6C2A1] text-[#2E2E2E] rounded-xl hover:bg-[#B89B72] transition-all font-medium shadow-md flex items-center gap-2">
  <Icon size={18} />
  <span>Label</span>
</button>
```

**Input Field:**
```jsx
<input className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#D6C2A1] focus:outline-none transition-all" />
```

**Badge:**
```jsx
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
  In Stock
</span>
```

**Toggle Switch:**
```jsx
<button className={`relative w-14 h-7 rounded-full transition-colors ${isActive ? 'bg-[#D6C2A1]' : 'bg-gray-300'}`}>
  <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isActive ? 'translate-x-7' : 'translate-x-0'}`} />
</button>
```

---

## 📊 DATA FLOW & SYNCHRONIZATION

### Real-Time Updates
- Dashboard: 15-second refresh
- Sales: 30-second refresh
- Inventory: 60-second refresh
- Manual refresh after mutations

### Chain Reactions
```
Sale Recorded
  ↓
Stock Deducted (stockService)
  ↓
Low Stock Check
  ↓
If threshold crossed:
  ├─ Create notification
  ├─ Send email (if enabled, rate-limited)
  └─ Update dashboard metrics
  ↓
All pages auto-refresh
```

---

## 🎭 ANIMATIONS & TRANSITIONS

**Page Transitions:**
- Fade-in: 0.3s ease-in
- Slide-in: 0.4s ease-out

**Hover Effects:**
- Card lift: -translate-y-1 (4px)
- Scale up: scale-105
- Shadow increase: shadow-md → shadow-xl
- Duration: 300ms

**Loading States:**
- Spinner: 12px border, 4px top transparent
- Skeleton: Pulse animation
- Button: Opacity 50%, cursor not-allowed

**Modal Animations:**
- Backdrop: Fade-in 0.2s
- Content: Scale from 0.95 to 1, 0.3s

---

## 📱 RESPONSIVE BREAKPOINTS

```
Mobile: < 640px
├── Single column layouts
├── Stacked cards
├── Full-width buttons
└── Touch-friendly (min 44px tap targets)

Tablet: 640px - 1024px
├── 2-column grids
├── Condensed navigation
└── Medium spacing

Desktop: > 1024px
├── 3-4 column grids
├── Full navigation
├── Side-by-side layouts
└── Generous spacing
```

---

## 🔐 SECURITY FEATURES

- JWT authentication
- Password hashing (bcrypt)
- Role-based access control
- Protected API routes
- CORS configuration
- Session management
- Activity logging
- Input validation
- SQL injection prevention
- XSS protection

---

## 📦 DEPENDENCIES

**Frontend:**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.0.0",
  "axios": "^1.6.0",
  "recharts": "^2.10.0",
  "lucide-react": "^0.300.0",
  "react-hot-toast": "^2.4.0",
  "tailwindcss": "^3.4.0"
}
```

**Backend:**
```json
{
  "express": "^4.18.0",
  "mongoose": "^8.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.0",
  "nodemailer": "^6.9.0",
  "node-cron": "^3.0.0"
}
```

---

## 🚀 DEPLOYMENT

**Backend (Render):**
- Environment variables set
- MongoDB Atlas connected
- CORS configured for Vercel
- Cron jobs active
- Email service configured

**Frontend (Vercel):**
- VITE_API_URL set to Render backend
- Production build optimized
- Static assets cached
- SSL enabled

---

## ✨ FINAL CHECKLIST

- [ ] All pages use boutique color palette
- [ ] Only lucide-react icons (no emojis)
- [ ] Rounded 2xl cards throughout
- [ ] Soft shadows on hover
- [ ] Smooth transitions (300ms)
- [ ] Professional spacing
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Empty states
- [ ] Form validation
- [ ] Real-time sync working
- [ ] Category system functional
- [ ] Notifications triggering
- [ ] Email automation active
- [ ] Session management working
- [ ] Theme customization functional

---

## 🎯 MASTER IMPLEMENTATION PROMPT

"Create a premium boutique management system using React.js + Tailwind CSS with Node.js/Express backend and MongoDB. Use the exact color palette: Primary #D6C2A1, Accent #B89B72, Light #F5EFE6, Text #2E2E2E, Background #FFFFFF. Implement category-based inventory (Trousers, T-Shirts, Shirts, Dresses, Jackets, Shoes, Accessories) with subcategory filtering. Build real-time dashboards with auto-refresh, automated email notifications, session management, and theme customization. Use only lucide-react icons, rounded-2xl cards, soft shadows, hover animations, and ensure full mobile/desktop responsiveness. Include stock service for centralized operations, notification service for alerts, and cron jobs for scheduled reports. All pages must synchronize automatically with chain reaction updates."

---

**Version:** 2.0  
**Last Updated:** April 2026  
**System:** Cecilia Boutique Management  
**Stack:** MERN (MongoDB, Express, React, Node.js)  
**Status:** Production Ready ✅
