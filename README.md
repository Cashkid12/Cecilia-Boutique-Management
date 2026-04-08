# Cecilia Boutique Management

A professional clothing shop management web application built with React.js, Tailwind CSS, Node.js, Express, and MongoDB.

## ✨ Features

### Core Features
- **Role-Based Authentication**: Admin and Employee roles with different access levels
- **Dashboard Analytics**: Real-time sales, inventory, and performance metrics
- **Inventory Management**: Category-based stock tracking with premium UI
- **Sales Tracking**: Record sales, track profits, and generate receipts
- **Expense Management**: Monitor business costs and operational spending
- **Worker Management**: Employee performance tracking and account management
- **Reports & Analytics**: Comprehensive profit/loss reports with charts
- **Settings & Profile**: Customizable themes (Light, Dark, Beige)

### 🤖 Automated Notification & Email System
- **Real-Time Notifications**: In-app notifications for all system events
  - Low stock alerts
  - New sales recorded
  - Expenses added
  - Workers created
  
- **Email Automation** (Powered by Nodemailer):
  - **Low Stock Alerts**: Automatic email when items fall below threshold
  - **Weekly Reports**: Every Monday at 8 AM with sales, profit, and expenses summary
  - **Monthly Reports**: 1st of each month with growth analysis and worker performance
  
- **Smart Detection System**:
  - Automatically detects low stock (configurable threshold)
  - Prevents email spam (sends once per hour max)
  - Batches all low stock items in single email
  - Beautiful HTML email templates

### 🔄 Real-Time System Synchronization
- **Automatic Updates**: One action updates everything across the system
  - Sale recorded → Stock deducted → Dashboard updated → Notifications triggered
  - Stock updated → Low stock check → Email sent (if needed) → Metrics recalculated
  - Expense added → Profit recalculated → Notification created
  
- **Stock Management Service**:
  - Centralized stock operations
  - Prevents overselling
  - Validates stock availability
  - Auto-calculates stock metrics
  - Tracks stock status (In Stock, Low Stock, Out of Stock)

### 🎨 Premium Inventory Management
- **Category-Based Navigation**: Browse stock by clothing categories
  - Trousers, T-Shirts, Shirts, Dresses, Jackets, Shoes, Accessories
  - Subcategory filtering (e.g., Jeans, Khaki, Official, Casual)
  
- **Modern Card-Based UI**:
  - Responsive grid layout
  - Hover animations and smooth transitions
  - Real-time stock status badges
  - Quick actions (Edit, Restock, Delete, View Details)
  
- **Advanced Search & Filter**:
  - Live search within categories
  - Size, color, and status filters
  - Export to CSV functionality

## Tech Stack

### Frontend
- React.js 18
- Tailwind CSS
- Recharts (Data Visualization)
- Lucide React Icons
- React Hot Toast (Notifications)
- Axios (HTTP Client)
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt (Password Hashing)
- **Nodemailer** (Email Service)
- **node-cron** (Scheduled Tasks)

### Services Architecture
- **stockService.js**: Centralized stock management
- **notificationService.js**: Notification handling
- **emailService.js**: Email generation and sending
- **cronJobs.js**: Automated scheduled reports

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Gmail account (for email notifications - optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Cashkid12/Cecilia-Boutique-Management.git
cd Cecilia-Boutique-Management
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
- Copy `.env.example` to `.env` in the backend folder
- Add your MongoDB connection string and JWT secret
- (Optional) Add Gmail credentials for email notifications

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

5. Start the backend server
```bash
cd backend
npm start
```

6. Start the frontend development server
```bash
cd frontend
npm run dev
```

7. Access the application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Usage

- Access the app at `http://localhost:5173`
- First-time setup: Create an admin account
- Admin can create employee accounts
- Employees can only access their own dashboard and sales

### Setting Up Email Notifications (Optional)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Generate password for "Mail"
3. Add to your `.env` file:
   ```env
   ADMIN_EMAIL=your_email@gmail.com
   EMAIL_PASSWORD=your_generated_app_password
   ```
4. Configure notification settings in the app Settings page

### Automated Features

Once configured, the system automatically:
- ✅ Sends low stock alerts when items fall below threshold
- ✅ Emails weekly business reports every Monday at 8 AM
- ✅ Emails monthly reports on the 1st of each month
- ✅ Creates in-app notifications for all actions
- ✅ Updates all dashboards in real-time
- ✅ Prevents overselling and stock errors

## Project Structure

```
Cecilia-Boutique-Management/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── expenseController.js
│   │   ├── inventoryController.js
│   │   ├── notificationController.js  # NEW
│   │   ├── reportController.js
│   │   ├── salesController.js
│   │   └── workerController.js
│   ├── models/               # Database schemas
│   │   ├── Expense.js
│   │   ├── Inventory.js
│   │   ├── Notification.js   # NEW
│   │   ├── Sale.js
│   │   ├── Settings.js       # NEW
│   │   └── User.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── notificationRoutes.js  # NEW
│   │   ├── reportRoutes.js
│   │   ├── salesRoutes.js
│   │   └── workerRoutes.js
│   ├── services/             # NEW - Business logic
│   │   ├── stockService.js          # Stock management
│   │   └── notificationService.js   # Notifications
│   ├── utils/                # Utilities
│   │   ├── auth.js
│   │   ├── cronJobs.js              # NEW - Scheduled tasks
│   │   └── emailService.js          # NEW - Email sending
│   ├── middleware/
│   │   └── auth.js
│   ├── config/
│   │   └── db.js
│   ├── .env                  # Environment variables
│   ├── package.json
│   ├── server.js
│   └── seeder.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   └── useRealTimeData.js
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Inventory.jsx      # REDESIGNED
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Workers.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── README.md
├── DEPLOYMENT_GUIDE.md
└── .gitignore
```

## License

MIT License

## API Endpoints

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/stats` - Get notification statistics
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Stock Management
- `GET /api/inventory` - Get all inventory
- `POST /api/inventory` - Add new item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- *Automatic triggers*: Low stock detection, notifications, emails

### Sales
- `POST /api/sales` - Record sale (auto-updates stock)
- `GET /api/sales` - Get all sales
- *Automatic triggers*: Stock deduction, notifications, dashboard updates

### Expenses
- `POST /api/expenses` - Add expense (triggers notification)
- `GET /api/expenses` - Get all expenses

### Workers
- `POST /api/workers` - Add worker (triggers notification)
- `GET /api/workers` - Get all workers

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/Employee)
- Protected API routes
- CORS configuration
- Environment variable protection

## Performance Optimizations

- Aggregation pipelines for complex queries
- Indexed database fields
- Batched email notifications (prevents spam)
- Efficient stock validation
- Optimized cron job scheduling

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions:
- Backend: Render (Free tier)
- Frontend: Vercel (Free tier)
- Database: MongoDB Atlas (Free tier)

## Support & Troubleshooting

### Common Issues

1. **Backend won't start**
   - Run `npm install` in backend folder
   - Check `.env` file configuration
   - Verify MongoDB connection string

2. **Email not sending**
   - Verify Gmail credentials in `.env`
   - Enable 2FA and use App Password
   - Check notification settings in app

3. **CORS errors**
   - Update CORS configuration in `server.js`
   - Add your frontend URL to allowed origins

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Cecilia Boutique Management System

---

**Built with ❤️ for efficient boutique management**
