# Cecilia Boutique Management System

A comprehensive boutique management application built with the MERN stack (MongoDB, Express, React, Node.js) featuring inventory management, sales tracking, expense monitoring, worker management, and real-time analytics.

## 🎯 Features

### Dashboard
- **Admin Dashboard**: Complete overview with sales analytics, stock distribution, best sellers, recent sales, low stock alerts, top workers, and expenses
- **Employee Dashboard**: Simplified view showing today's sales, recent transactions, and personal performance metrics
- **Category Stock Overview**: 13-category grid showing inventory levels with low stock badges
- **Real-time Data**: Live updates and analytics

### Inventory Management
- Full CRUD operations for products
- Category-based organization (13 categories)
- Low stock alerts and tracking
- Bulk operations
- Search and filtering

### Sales Management
- Record sales with profit calculation
- Multiple payment methods (Cash, M-Pesa, Card)
- Sales history and filtering
- Daily/Weekly/Monthly reports
- Profit margin tracking

### Expense Tracking
- Categorize expenses
- Track daily spending
- Expense reports and analytics
- Integration with profit calculations

### Worker Management
- Worker profiles and performance tracking
- Sales attribution
- Role-based access control
- Activity monitoring

### Settings & Profile
- **General Tab**: Profile information, shop details, password change
- **Sessions Tab**: Active session management, logout devices
- **Notifications Tab**: 8 customizable notification preferences with toggle switches
- **Appearance Tab**: Theme customization with color pickers and dark mode

### PWA Support
- Installable on all devices (iOS, Android, Desktop)
- Offline support with service worker
- Push notifications ready
- App shortcuts for quick actions

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Navigation
- **Recharts** - Charts and graphs
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables

### PWA
- **Service Worker** - Caching and offline support
- **Web App Manifest** - Installability
- **Background Sync** - Offline data synchronization

## 📁 Project Structure

```
MUM/
├── backend/
│   ├── config/
│   │   └── db.js                    # Database connection
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── categoryController.js    # Category statistics
│   │   ├── dashboardController.js   # Dashboard data
│   │   ├── expenseController.js     # Expense management
│   │   ├── inventoryController.js   # Inventory CRUD
│   │   ├── notificationController.js # Notifications
│   │   ├── reportController.js      # Reports generation
│   │   ├── salesController.js       # Sales operations
│   │   └── workerController.js      # Worker management
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   ├── models/
│   │   ├── Expense.js               # Expense schema
│   │   ├── Inventory.js             # Product schema
│   │   ├── Notification.js          # Notification schema
│   │   ├── Sale.js                  # Sale schema
│   │   ├── Settings.js              # Settings schema
│   │   └── User.js                  # User schema
│   ├── routes/
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── categoryRoutes.js        # Category endpoints
│   │   ├── dashboardRoutes.js       # Dashboard endpoints
│   │   ├── expenseRoutes.js         # Expense endpoints
│   │   ├── inventoryRoutes.js       # Inventory endpoints
│   │   ├── notificationRoutes.js    # Notification endpoints
│   │   ├── reportRoutes.js          # Report endpoints
│   │   ├── salesRoutes.js           # Sales endpoints
│   │   └── workerRoutes.js          # Worker endpoints
│   ├── services/
│   │   ├── notificationService.js   # Notification logic
│   │   └── stockService.js          # Stock management
│   ├── utils/
│   │   ├── categoryConfig.js        # Category definitions
│   │   ├── cronJobs.js              # Scheduled tasks
│   │   ├── emailService.js          # Email notifications
│   │   └── token.js                 # JWT token utilities
│   ├── .env                         # Environment variables
│   ├── package.json                 # Backend dependencies
│   ├── seeder.js                    # Database seeder
│   └── server.js                    # Express server
│
├── frontend/
│   ├── public/
│   │   ├── icons/                   # PWA icons (9 sizes)
│   │   ├── manifest.json            # PWA manifest
│   │   ├── service-worker.js        # Service worker
│   │   ├── offline.html             # Offline fallback page
│   │   └── logo.png                 # Favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx  # Layout wrapper
│   │   │   ├── Navbar.jsx           # Top navigation
│   │   │   ├── PWAInstallPrompt.jsx # PWA install prompt
│   │   │   └── Sidebar.jsx          # Side navigation
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication context
│   │   │   └── ThemeContext.jsx     # Theme management
│   │   ├── hooks/
│   │   │   ├── usePWAInstall.js     # PWA installation hook
│   │   │   └── useRealTimeData.js   # Real-time data hook
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx   # Admin dashboard
│   │   │   ├── EmployeeDashboard.jsx # Employee dashboard
│   │   │   ├── Expenses.jsx         # Expense management
│   │   │   ├── Inventory.jsx        # Inventory management
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Profile.jsx          # User profile
│   │   │   ├── Register.jsx         # Registration page
│   │   │   ├── Reports.jsx          # Reports page
│   │   │   ├── Sales.jsx            # Sales management
│   │   │   ├── Settings.jsx         # Settings page (4 tabs)
│   │   │   └── Workers.jsx          # Worker management
│   │   ├── utils/
│   │   │   └── api.js               # API utilities
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── .env                         # Environment variables
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind configuration
│   └── package.json                 # Frontend dependencies
│
└── Documentation/
    ├── README.md                    # This file
    ├── DEPLOYMENT.md                # Deployment guide
    └── API.md                       # API documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Cashkid12/Cecilia-Boutique-Management.git
cd Cecilia-Boutique-Management
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables**

Create `.env` file in `backend/`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/cecilia-boutique
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

Create `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

5. **Seed Database (Optional)**
```bash
cd backend
node seeder.js
```

6. **Start Development Servers**

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📱 PWA Installation

### Desktop
1. Visit the application URL
2. Click the install icon in the address bar
3. Follow the prompts to install

### Android
1. Open the app in Chrome
2. Tap "Add to Home Screen"
3. Confirm installation

### iOS
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

## 🎨 Design System

### Colors
- **Primary**: `#D6C2A1` (Beige)
- **Primary Dark**: `#B89B72` (Brown)
- **Primary Light**: `#F5EFE6` (Cream)
- **Dark**: `#2E2E2E`
- **White**: `#FFFFFF`

### Typography
- **Font Family**: Inter
- **Weights**: 300, 400, 500, 600, 700

### Categories (13 Total)
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

## 🔐 Authentication

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/Employee)
- Session management
- Protected routes

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/all` - Get all dashboard data
- `GET /api/dashboard/category-stats` - Get category statistics

### Inventory
- `GET /api/inventory` - Get all products
- `POST /api/inventory` - Create product
- `PUT /api/inventory/:id` - Update product
- `DELETE /api/inventory/:id` - Delete product

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Record sale
- `GET /api/sales/:id` - Get sale details
- `DELETE /api/sales/:id` - Delete sale

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Workers
- `GET /api/workers` - Get all workers
- `POST /api/workers` - Create worker
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker

### Settings
- `GET /api/settings/profile` - Get profile
- `PUT /api/settings/profile` - Update profile
- `PUT /api/settings/password` - Change password
- `GET /api/settings/sessions` - Get active sessions
- `DELETE /api/settings/sessions/:id` - Logout session
- `GET /api/settings/notifications` - Get notification preferences
- `PUT /api/settings/notifications` - Update preferences
- `GET /api/settings/theme` - Get theme settings
- `PUT /api/settings/theme` - Update theme

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Backend (Render)
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables
6. Deploy

See `DEPLOYMENT.md` for detailed instructions.

## 📈 Performance Optimizations

- **Lazy Loading**: Tab-based data fetching in Settings
- **Consolidated API**: Single endpoint for dashboard data
- **Caching**: Service worker caching for offline support
- **Code Splitting**: Route-based code splitting with Vite
- **Null Safety**: Graceful error handling throughout

## 🐛 Known Issues

- Email notifications require SMTP configuration
- Background sync needs IndexedDB implementation
- Push notifications require server setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Mary Wanjiru** - Initial work

## 🙏 Acknowledgments

- Tailwind CSS for the styling framework
- Lucide React for beautiful icons
- Recharts for data visualization
- MongoDB Atlas for database hosting

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Cecilia Boutique Management** - Manage your boutique with elegance ✨
