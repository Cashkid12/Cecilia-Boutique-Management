# API Documentation - Cecilia Boutique Management

Base URL: `http://localhost:5000/api` (Development)

All authenticated routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📑 Table of Contents
- [Authentication](#authentication)
- [Dashboard](#dashboard)
- [Inventory](#inventory)
- [Sales](#sales)
- [Expenses](#expenses)
- [Workers](#workers)
- [Settings](#settings)
- [Notifications](#notifications)
- [Reports](#reports)

---

## Authentication

### Register User
Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
}
```

**Response:** `201 Created`
```json
{
  "_id": "507f191e810c19729de860ea",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login User
Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "_id": "507f191e810c19729de860ea",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
Get authenticated user details.

**Endpoint:** `GET /api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "_id": "507f191e810c19729de860ea",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}
```

---

## Dashboard

### Get All Dashboard Data
Consolidated endpoint for all dashboard data.

**Endpoint:** `GET /api/dashboard/all`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: `today` | `week` | `month` (default: `week`)

**Response:** `200 OK`
```json
{
  "todaySales": 15000,
  "totalProfit": 45000,
  "todayItems": 25,
  "lowStockCount": 8,
  "salesChart": [
    { "date": "2024-01-01", "amount": 5000 },
    { "date": "2024-01-02", "amount": 7500 }
  ],
  "stockDistribution": [
    {
      "category": "Men's Trousers",
      "count": 45,
      "percentage": 15,
      "color": "#D6C2A1"
    }
  ],
  "bestSellers": [
    {
      "_id": "...",
      "itemName": "Classic Fit Pants",
      "totalQuantity": 50,
      "totalRevenue": 75000
    }
  ],
  "recentSales": [
    {
      "id": "...",
      "itemName": "T-Shirt",
      "quantity": 2,
      "amount": 2000,
      "time": "2024-01-15T10:30:00Z"
    }
  ],
  "lowStockItems": [
    {
      "_id": "...",
      "name": "Socks",
      "quantity": 3,
      "category": "Socks"
    }
  ],
  "categoryStats": [
    {
      "category": "Men's Trousers",
      "totalItems": 45,
      "productCount": 10,
      "lowStockCount": 2
    }
  ]
}
```

### Get Category Statistics
Get inventory statistics for all categories.

**Endpoint:** `GET /api/dashboard/category-stats`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "category": "Men's Trousers",
    "totalItems": 45,
    "productCount": 10,
    "lowStockCount": 2
  },
  {
    "category": "Ladies Trousers",
    "totalItems": 38,
    "productCount": 8,
    "lowStockCount": 1
  }
]
```

---

## Inventory

### Get All Products
Retrieve all inventory items with optional filtering.

**Endpoint:** `GET /api/inventory`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category`: Filter by category
- `search`: Search by name
- `lowStock`: `true` | `false` - Filter low stock items only
- `sort`: `name` | `quantity` | `price`
- `order`: `asc` | `desc`

**Response:** `200 OK`
```json
{
  "products": [
    {
      "_id": "...",
      "name": "Classic Fit Pants",
      "category": "Men's Trousers",
      "buyingPrice": 500,
      "sellingPrice": 800,
      "quantity": 25,
      "size": "M",
      "color": "Black",
      "lowStockThreshold": 5,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 10
}
```

### Create Product
Add a new product to inventory.

**Endpoint:** `POST /api/inventory`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Classic Fit Pants",
  "category": "Men's Trousers",
  "buyingPrice": 500,
  "sellingPrice": 800,
  "quantity": 25,
  "size": "M",
  "color": "Black",
  "lowStockThreshold": 5
}
```

**Response:** `201 Created`
```json
{
  "_id": "...",
  "name": "Classic Fit Pants",
  "category": "Men's Trousers",
  "buyingPrice": 500,
  "sellingPrice": 800,
  "quantity": 25,
  "size": "M",
  "color": "Black",
  "lowStockThreshold": 5,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Get Single Product
Retrieve a specific product.

**Endpoint:** `GET /api/inventory/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "_id": "...",
  "name": "Classic Fit Pants",
  "category": "Men's Trousers",
  "buyingPrice": 500,
  "sellingPrice": 800,
  "quantity": 25,
  "size": "M",
  "color": "Black"
}
```

### Update Product
Update product details.

**Endpoint:** `PUT /api/inventory/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (Any fields to update)
```json
{
  "quantity": 30,
  "sellingPrice": 850
}
```

**Response:** `200 OK`
```json
{
  "_id": "...",
  "name": "Classic Fit Pants",
  "quantity": 30,
  "sellingPrice": 850
}
```

### Delete Product
Remove a product from inventory.

**Endpoint:** `DELETE /api/inventory/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Product removed"
}
```

---

## Sales

### Get All Sales
Retrieve all sales records.

**Endpoint:** `GET /api/sales`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `paymentMethod`: `Cash` | `M-Pesa` | `Card`
- `workerId`: Filter by worker

**Response:** `200 OK`
```json
{
  "sales": [
    {
      "_id": "...",
      "itemName": "Classic Fit Pants",
      "quantity": 2,
      "sellingPrice": 800,
      "totalAmount": 1600,
      "profit": 600,
      "paymentMethod": "M-Pesa",
      "workerName": "John Doe",
      "saleDate": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### Record Sale
Record a new sale and auto-update inventory.

**Endpoint:** `POST /api/sales`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "itemId": "507f191e810c19729de860ea",
  "quantity": 2,
  "paymentMethod": "M-Pesa",
  "workerId": "507f191e810c19729de860eb"
}
```

**Response:** `201 Created`
```json
{
  "_id": "...",
  "itemName": "Classic Fit Pants",
  "quantity": 2,
  "sellingPrice": 800,
  "totalAmount": 1600,
  "profit": 600,
  "paymentMethod": "M-Pesa",
  "workerName": "John Doe",
  "saleDate": "2024-01-15T10:30:00Z"
}
```

### Get Sale Details
Retrieve a specific sale.

**Endpoint:** `GET /api/sales/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Delete Sale
Delete a sale record and restore inventory.

**Endpoint:** `DELETE /api/sales/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Expenses

### Get All Expenses
Retrieve all expense records.

**Endpoint:** `GET /api/expenses`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category`: Filter by category
- `startDate`: Filter by start date
- `endDate`: Filter by end date

**Response:** `200 OK`
```json
{
  "expenses": [
    {
      "_id": "...",
      "category": "Utilities",
      "description": "Electricity bill",
      "amount": 2000,
      "date": "2024-01-15T00:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Create Expense
Add a new expense.

**Endpoint:** `POST /api/expenses`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "category": "Utilities",
  "description": "Electricity bill",
  "amount": 2000,
  "date": "2024-01-15"
}
```

**Response:** `201 Created`

### Update Expense
Update an expense record.

**Endpoint:** `PUT /api/expenses/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (Fields to update)

**Response:** `200 OK`

### Delete Expense
Remove an expense record.

**Endpoint:** `DELETE /api/expenses/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Workers

### Get All Workers
Retrieve all workers.

**Endpoint:** `GET /api/workers`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "workers": [
    {
      "_id": "...",
      "name": "John Doe",
      "phone": "+254712345678",
      "role": "worker",
      "totalSales": 50,
      "totalRevenue": 75000
    }
  ]
}
```

### Create Worker
Add a new worker.

**Endpoint:** `POST /api/workers`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phone": "+254712345679",
  "role": "worker"
}
```

**Response:** `201 Created`

### Update Worker
Update worker details.

**Endpoint:** `PUT /api/workers/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Delete Worker
Remove a worker.

**Endpoint:** `DELETE /api/workers/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Settings

### Get Profile
Get user profile information.

**Endpoint:** `GET /api/settings/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254712345678",
  "shopName": "Cecilia Boutique",
  "shopOwnerName": "John Doe",
  "logo": "data:image/png;base64,..."
}
```

### Update Profile
Update user profile.

**Endpoint:** `PUT /api/settings/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "shopName": "Cecilia Boutique",
  "email": "john@example.com",
  "phone": "+254712345678"
}
```

**Response:** `200 OK`

### Change Password
Update user password.

**Endpoint:** `PUT /api/settings/password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password updated successfully"
}
```

### Upload Logo
Upload shop logo.

**Endpoint:** `POST /api/settings/upload-logo`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `logo`: Image file (PNG, JPG, JPEG, max 2MB)

**Response:** `200 OK`

### Get Active Sessions
Get all active user sessions.

**Endpoint:** `GET /api/settings/sessions`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "sessions": [
    {
      "id": "...",
      "device": "Chrome on Windows",
      "location": "Nairobi, Kenya",
      "ipAddress": "192.168.1.1",
      "current": true,
      "lastActive": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Logout Session
Terminate a specific session.

**Endpoint:** `DELETE /api/settings/sessions/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Logout All Sessions
Terminate all sessions except current.

**Endpoint:** `POST /api/settings/sessions/logout-all`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Get Notification Preferences
Get user notification settings.

**Endpoint:** `GET /api/settings/notifications`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "salesAlerts": true,
  "lowStockAlerts": true,
  "expenseAlerts": true,
  "dailyReport": false,
  "weeklyReport": false,
  "monthlyReport": false,
  "emailNotifications": true,
  "inAppNotifications": true
}
```

### Update Notification Preferences
Update notification settings.

**Endpoint:** `PUT /api/settings/notifications`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "salesAlerts": true,
  "lowStockAlerts": true,
  "emailNotifications": false
}
```

**Response:** `200 OK`

### Get Theme Settings
Get user theme preferences.

**Endpoint:** `GET /api/settings/theme`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "darkMode": false,
  "primaryColor": "#D6C2A1",
  "accentColor": "#B89B72"
}
```

### Update Theme Settings
Update theme preferences.

**Endpoint:** `PUT /api/settings/theme`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "darkMode": true,
  "primaryColor": "#D6C2A1",
  "accentColor": "#B89B72"
}
```

**Response:** `200 OK`

---

## Notifications

### Get User Notifications
Get all notifications for current user.

**Endpoint:** `GET /api/notifications`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `unread`: `true` | `false` - Filter unread only

**Response:** `200 OK`
```json
{
  "notifications": [
    {
      "_id": "...",
      "type": "sale",
      "message": "New sale recorded: KSh 1,600",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Mark Notification as Read
Mark a notification as read.

**Endpoint:** `PUT /api/notifications/:id/read`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Mark All as Read
Mark all notifications as read.

**Endpoint:** `PUT /api/notifications/read-all`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Reports

### Get Sales Report
Generate sales report for a period.

**Endpoint:** `GET /api/reports/sales`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period`: `daily` | `weekly` | `monthly` | `yearly`
- `startDate`: Custom start date
- `endDate`: Custom end date

**Response:** `200 OK`
```json
{
  "totalSales": 150000,
  "totalProfit": 45000,
  "totalItems": 250,
  "transactions": 100,
  "averageSale": 1500,
  "salesByCategory": [
    {
      "category": "Men's Trousers",
      "totalSales": 50000,
      "profit": 15000
    }
  ],
  "salesByPayment": {
    "Cash": 60000,
    "M-Pesa": 70000,
    "Card": 20000
  }
}
```

### Get Expense Report
Generate expense report.

**Endpoint:** `GET /api/reports/expenses`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Get Profit & Loss Report
Generate P&L report.

**Endpoint:** `GET /api/reports/profit-loss`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "totalRevenue": 150000,
  "totalExpenses": 30000,
  "totalCOGS": 75000,
  "grossProfit": 75000,
  "netProfit": 45000,
  "profitMargin": 30
}
```

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "message": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Product not found"
}
```

### 500 Server Error
```json
{
  "error": "Server Error",
  "message": "Internal server error"
}
```

---

## Rate Limiting

- API requests are limited to 100 requests per 15 minutes per IP
- Authentication endpoints: 10 requests per 15 minutes

## Categories

The system supports 13 product categories:
1. Men's Trousers
2. Ladies Trousers
3. Boys Trouser
4. Girls Trouser
5. Shorts
6. T-Shirts
7. T-Shirt Boys
8. T-Shirt Girls
9. Socks
10. Vests
11. Jackets Men
12. Jackets Ladies
13. Jackets Kids

---

For support, please open an issue on GitHub or contact the development team.
